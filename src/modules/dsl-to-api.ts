import { AppDSL, DSLEntity, DSLColumn } from '../types/dsl.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export class DSLToAPI {
  
  /**
   * 生成完整的FastAPI应用
   */
  generateFastAPIApp(dsl: AppDSL, outputDir: string): void {
    // 创建输出目录
    mkdirSync(outputDir, { recursive: true });
    mkdirSync(join(outputDir, 'models'), { recursive: true });
    mkdirSync(join(outputDir, 'routers'), { recursive: true });
    
    // 生成主应用文件
    this.generateMainFile(dsl, outputDir);
    
    // 生成数据模型
    this.generateModels(dsl, outputDir);
    
    // 生成路由文件
    this.generateRouters(dsl, outputDir);
    
    // 生成数据库连接
    this.generateDatabase(dsl, outputDir);
    
    // 生成依赖文件
    this.generateRequirements(outputDir);
    
    console.log(`FastAPI应用已生成到: ${outputDir}`);
  }
  
  /**
   * 生成main.py主文件
   */
  private generateMainFile(dsl: AppDSL, outputDir: string): void {
    const imports = dsl.entities.map(entity => 
      `from routers import ${entity.name}_router`
    ).join('\n');
    
    const routerIncludes = dsl.entities.map(entity =>
      `app.include_router(${entity.name}_router.router, prefix="/${entity.name}s", tags=["${entity.displayName || entity.name}"])`
    ).join('\n');
    
    const mainContent = `"""
${dsl.name}
${dsl.description || ''}

自动生成的FastAPI应用
生成时间: ${new Date().toISOString()}
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
${imports}

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="${dsl.name}",
    description="${dsl.description || ''}",
    version="${dsl.version || '1.0.0'}"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由
${routerIncludes}

@app.get("/")
def read_root():
    return {
        "message": "欢迎使用${dsl.name}",
        "description": "${dsl.description || ''}",
        "version": "${dsl.version || '1.0.0'}",
        "endpoints": [
${dsl.entities.map(entity => `            "/${entity.name}s"`).join(',\n')}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
`;
    
    writeFileSync(join(outputDir, 'main.py'), mainContent);
  }
  
  /**
   * 生成Pydantic模型
   */
  private generateModels(dsl: AppDSL, outputDir: string): void {
    dsl.entities.forEach(entity => {
      const modelContent = this.generateEntityModel(entity);
      writeFileSync(join(outputDir, 'models', `${entity.name}.py`), modelContent);
    });
    
    // 生成__init__.py文件
    const initContent = dsl.entities.map(entity =>
      `from .${entity.name} import ${this.capitalize(entity.name)}, ${this.capitalize(entity.name)}Create, ${this.capitalize(entity.name)}Update`
    ).join('\n');
    
    writeFileSync(join(outputDir, 'models', '__init__.py'), initContent);
  }
  
  /**
   * 生成单个实体的模型
   */
  private generateEntityModel(entity: DSLEntity): string {
    const className = this.capitalize(entity.name);
    
    const baseFields = entity.columns
      .filter(col => col.name !== 'id' && col.name !== 'created_at' && col.name !== 'updated_at')
      .map(col => this.generateFieldDefinition(col, false))
      .join('\n');
    
    const allFields = entity.columns
      .map(col => this.generateFieldDefinition(col, true))
      .join('\n');
    
    const updateFields = entity.columns
      .filter(col => col.name !== 'id' && col.name !== 'created_at' && col.name !== 'updated_at')
      .map(col => this.generateFieldDefinition(col, false, true))
      .join('\n');
    
    return `"""
${className}模型定义
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class ${className}Base(BaseModel):
    """${className}基础模型"""
${baseFields}

class ${className}Create(${className}Base):
    """创建${className}时使用的模型"""
    pass

class ${className}Update(BaseModel):
    """更新${className}时使用的模型"""
${updateFields}

class ${className}(${className}Base):
    """${className}完整模型"""
    id: str = Field(..., description="主键ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    
    class Config:
        from_attributes = True
`;
  }
  
  /**
   * 生成字段定义
   */
  private generateFieldDefinition(column: DSLColumn, includeAll: boolean, optional: boolean = false): string {
    const pythonType = this.mapToPythonType(column.type);
    const fieldType = optional || !column.required ? `Optional[${pythonType}]` : pythonType;
    const defaultValue = optional ? ' = None' : (column.required ? '' : ' = None');
    
    return `    ${column.name}: ${fieldType}${defaultValue} = Field(..., description="${this.getFieldDescription(column)}")`;
  }
  
  /**
   * 映射DSL类型到Python类型
   */
  private mapToPythonType(type: DSLColumn['type']): string {
    const typeMap = {
      'text': 'str',
      'number': 'float',
      'date': 'datetime',
      'boolean': 'bool',
      'email': 'str',
      'url': 'str',
      'textarea': 'str'
    };
    
    return typeMap[type] || 'str';
  }
  
  /**
   * 获取字段描述
   */
  private getFieldDescription(column: DSLColumn): string {
    const descriptions = {
      'id': '主键ID',
      'name': '名称',
      'title': '标题',
      'description': '描述',
      'email': '邮箱地址',
      'url': '链接地址',
      'created_at': '创建时间',
      'updated_at': '更新时间'
    };
    
    return descriptions[column.name as keyof typeof descriptions] || column.name;
  }
  
  /**
   * 生成路由文件
   */
  private generateRouters(dsl: AppDSL, outputDir: string): void {
    dsl.entities.forEach(entity => {
      const routerContent = this.generateEntityRouter(entity);
      writeFileSync(join(outputDir, 'routers', `${entity.name}_router.py`), routerContent);
    });
    
    // 生成__init__.py文件
    writeFileSync(join(outputDir, 'routers', '__init__.py'), '');
  }
  
  /**
   * 生成单个实体的路由
   */
  private generateEntityRouter(entity: DSLEntity): string {
    const className = this.capitalize(entity.name);
    const pluralName = entity.name + 's';
    
    return `"""
${className} 路由
提供${className}的CRUD操作
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.${entity.name} import ${className}, ${className}Create, ${className}Update

router = APIRouter()

# 这里应该添加实际的数据库操作
# 为了简化，这里使用内存存储作为示例

fake_${pluralName} = []

@router.get("/", response_model=List[${className}])
def get_${pluralName}(skip: int = 0, limit: int = 100):
    """获取${className}列表"""
    return fake_${pluralName}[skip : skip + limit]

@router.get("/{item_id}", response_model=${className})
def get_${entity.name}(item_id: str):
    """根据ID获取${className}"""
    for item in fake_${pluralName}:
        if item.get("id") == item_id:
            return item
    raise HTTPException(status_code=404, detail="${className} not found")

@router.post("/", response_model=${className})
def create_${entity.name}(item: ${className}Create):
    """创建新的${className}"""
    import uuid
    from datetime import datetime
    
    new_item = item.dict()
    new_item["id"] = str(uuid.uuid4())
    new_item["created_at"] = datetime.now()
    new_item["updated_at"] = datetime.now()
    
    fake_${pluralName}.append(new_item)
    return new_item

@router.put("/{item_id}", response_model=${className})
def update_${entity.name}(item_id: str, item: ${className}Update):
    """更新${className}"""
    for i, existing_item in enumerate(fake_${pluralName}):
        if existing_item.get("id") == item_id:
            from datetime import datetime
            
            updated_item = existing_item.copy()
            updated_item.update(item.dict(exclude_unset=True))
            updated_item["updated_at"] = datetime.now()
            
            fake_${pluralName}[i] = updated_item
            return updated_item
    
    raise HTTPException(status_code=404, detail="${className} not found")

@router.delete("/{item_id}")
def delete_${entity.name}(item_id: str):
    """删除${className}"""
    for i, item in enumerate(fake_${pluralName}):
        if item.get("id") == item_id:
            del fake_${pluralName}[i]
            return {"message": "${className} deleted successfully"}
    
    raise HTTPException(status_code=404, detail="${className} not found")
`;
  }
  
  /**
   * 生成数据库连接文件
   */
  private generateDatabase(dsl: AppDSL, outputDir: string): void {
    const databaseContent = `"""
数据库连接配置
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 数据库URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/database")

# 创建数据库引擎
engine = create_engine(DATABASE_URL)

# 创建SessionLocal类
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建Base类
Base = declarative_base()

# 依赖函数，用于获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
`;
    
    writeFileSync(join(outputDir, 'database.py'), databaseContent);
  }
  
  /**
   * 生成requirements.txt
   */
  private generateRequirements(outputDir: string): void {
    const requirements = `fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-dotenv==1.0.0
`;
    
    writeFileSync(join(outputDir, 'requirements.txt'), requirements);
  }
  
  /**
   * 首字母大写
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// 便捷函数
export function generateAPI(dsl: AppDSL, outputDir: string): void {
  const generator = new DSLToAPI();
  generator.generateFastAPIApp(dsl, outputDir);
} 