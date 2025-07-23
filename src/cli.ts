#!/usr/bin/env node

import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// 加载环境变量
dotenv.config();
import { promptToDsl } from './modules/prompt-to-dsl.js';
import { dslToSql } from './modules/dsl-to-sql.js';
import { generateAPI } from './modules/dsl-to-api.js';
import { generateUI } from './modules/dsl-to-ui.js';

class Base44Generator {
  
  /**
   * 完整的应用生成流程
   */
  async generateApp(prompt: string, outputDir: string, options: GenerateOptions = {}): Promise<void> {
    const onProgress = options.onProgress || ((step, message, progress) => {
      console.log(`[${step.toUpperCase()}] ${message} (${progress}%)`);
    });

    onProgress('start', '开始生成应用...', 0);
    console.log('🚀 开始生成应用...');
    console.log(`📝 用户需求: ${prompt}`);
    
    try {
      // 第一步：Prompt -> DSL
      onProgress('dsl', '正在将需求转换为DSL...', 20);
      console.log('\n📊 1. 将需求转换为DSL...');
      const dsl = await promptToDsl(prompt, options.apiKey);
      
      console.log(`✅ DSL生成成功！应用名称: ${dsl.name}`);
      console.log(`   - 实体数量: ${dsl.entities.length}`);
      console.log(`   - 页面数量: ${dsl.pages.length}`);
      
      // 保存DSL到文件
      const dslPath = join(outputDir, 'dsl.json');
      mkdirSync(outputDir, { recursive: true });
      writeFileSync(dslPath, JSON.stringify(dsl, null, 2));
      console.log(`💾 DSL已保存到: ${dslPath}`);
      
      // 第二步：DSL -> SQL
      onProgress('sql', '正在生成数据库迁移脚本...', 40);
      console.log('\n🗄️  2. 生成数据库迁移脚本...');
      const sql = dslToSql(dsl, options.schemaName || 'public');
      const sqlPath = join(outputDir, 'migration.sql');
      writeFileSync(sqlPath, sql);
      console.log(`✅ SQL迁移脚本已生成: ${sqlPath}`);
      
      // 第三步：DSL -> API
      onProgress('api', '正在生成FastAPI后端...', 60);
      console.log('\n🔗 3. 生成FastAPI后端...');
      const apiDir = join(outputDir, 'backend');
      generateAPI(dsl, apiDir);
      console.log(`✅ FastAPI后端已生成: ${apiDir}`);
      
      // 第四步：DSL -> UI
      onProgress('ui', '正在生成React前端...', 80);
      console.log('\n🎨 4. 生成React前端...');
      const frontendDir = join(outputDir, 'frontend');
      generateUI(dsl, frontendDir);
      console.log(`✅ React前端已生成: ${frontendDir}`);
      
      // 生成部署脚本和说明文档
      onProgress('deploy', '正在生成部署文件...', 90);
      this.generateDeploymentFiles(dsl, outputDir);
      this.generateReadme(dsl, outputDir);
      
      onProgress('complete', '应用生成完成！', 100);
      console.log('\n🎉 应用生成完成！');
      console.log('\n📋 下一步操作:');
      console.log(`   1. 配置数据库连接（编辑 backend/database.py）`);
      console.log(`   2. 启动后端: cd ${outputDir}/backend && pip install -r requirements.txt && python main.py`);
      console.log(`   3. 启动前端: cd ${outputDir}/frontend && npm install && npm run dev`);
      console.log(`   4. 执行数据库迁移: psql -f ${outputDir}/migration.sql`);
      
    } catch (error) {
      console.error('❌ 生成过程中出现错误:', error);
      throw error;
    }
  }
  
  /**
   * 从现有DSL生成应用（跳过prompt转换）
   */
  async generateFromDSL(dslFilePath: string, outputDir: string, options: GenerateOptions = {}): Promise<void> {
    console.log('🚀 从DSL文件生成应用...');
    
    try {
      // 读取DSL文件
      if (!existsSync(dslFilePath)) {
        throw new Error(`DSL文件不存在: ${dslFilePath}`);
      }
      
      const dslContent = readFileSync(dslFilePath, 'utf8');
      const dsl = JSON.parse(dslContent);
      
      console.log(`📊 读取DSL文件: ${dslFilePath}`);
      console.log(`✅ 应用名称: ${dsl.name}`);
      
      // 创建输出目录
      mkdirSync(outputDir, { recursive: true });
      
      // 生成SQL、API、UI
      const sql = dslToSql(dsl, options.schemaName || 'public');
      writeFileSync(join(outputDir, 'migration.sql'), sql);
      
      generateAPI(dsl, join(outputDir, 'backend'));
      generateUI(dsl, join(outputDir, 'frontend'));
      
      this.generateDeploymentFiles(dsl, outputDir);
      this.generateReadme(dsl, outputDir);
      
      console.log('🎉 应用生成完成！');
      
    } catch (error) {
      console.error('❌ 生成过程中出现错误:', error);
      throw error;
    }
  }
  
  /**
   * 生成部署相关文件
   */
  private generateDeploymentFiles(dsl: any, outputDir: string): void {
    // Docker Compose文件
    const dockerCompose = `version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${dsl.name.toLowerCase().replace(/\s+/g, '_')}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migration.sql:/docker-entrypoint-initdb.d/01-init.sql

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/${dsl.name.toLowerCase().replace(/\s+/g, '_')}
    depends_on:
      - postgres
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app

volumes:
  postgres_data:
`;
    
    writeFileSync(join(outputDir, 'docker-compose.yml'), dockerCompose);
    
    // 后端Dockerfile
    const backendDockerfile = `FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
`;
    
    mkdirSync(join(outputDir, 'backend'), { recursive: true });
    writeFileSync(join(outputDir, 'backend', 'Dockerfile'), backendDockerfile);
    
    // 前端Dockerfile
    const frontendDockerfile = `FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
`;
    
    mkdirSync(join(outputDir, 'frontend'), { recursive: true });
    writeFileSync(join(outputDir, 'frontend', 'Dockerfile'), frontendDockerfile);
    
    console.log('📦 部署文件已生成');
  }
  
  /**
   * 生成README文档
   */
  private generateReadme(dsl: any, outputDir: string): void {
    const readme = `# ${dsl.name}

${dsl.description || '自动生成的Web应用'}

## 📋 项目概述

此项目由Base44风格的应用生成器自动创建，包含：

- **后端**: FastAPI + SQLAlchemy + PostgreSQL
- **前端**: React + TypeScript + Tailwind CSS
- **数据库**: PostgreSQL

## 🏗️ 项目结构

\`\`\`
${dsl.name}/
├── backend/                 # FastAPI后端
│   ├── main.py             # 主应用文件
│   ├── database.py         # 数据库连接
│   ├── models/             # Pydantic模型
│   ├── routers/            # API路由
│   └── requirements.txt    # Python依赖
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   └── services/       # API服务
│   └── package.json        # Node.js依赖
├── migration.sql           # 数据库迁移脚本
├── docker-compose.yml      # Docker部署配置
└── dsl.json               # 应用结构定义
\`\`\`

## 🚀 快速开始

### 使用Docker（推荐）

1. 确保安装了Docker和Docker Compose
2. 启动所有服务：

\`\`\`bash
docker-compose up -d
\`\`\`

3. 访问应用：
   - 前端: http://localhost:3000
   - 后端API: http://localhost:8000
   - API文档: http://localhost:8000/docs

### 手动部署

#### 后端设置

1. 进入后端目录：
\`\`\`bash
cd backend
\`\`\`

2. 安装依赖：
\`\`\`bash
pip install -r requirements.txt
\`\`\`

3. 配置数据库URL（可选，默认使用环境变量）：
\`\`\`bash
export DATABASE_URL="postgresql://username:password@localhost:5432/database"
\`\`\`

4. 启动后端：
\`\`\`bash
python main.py
\`\`\`

#### 前端设置

1. 进入前端目录：
\`\`\`bash
cd frontend
\`\`\`

2. 安装依赖：
\`\`\`bash
npm install
\`\`\`

3. 启动开发服务器：
\`\`\`bash
npm run dev
\`\`\`

#### 数据库设置

1. 创建PostgreSQL数据库
2. 执行迁移脚本：
\`\`\`bash
psql -d your_database -f migration.sql
\`\`\`

## 📊 实体结构

${dsl.entities.map((entity: any) => `
### ${entity.displayName || entity.name}

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
${entity.columns.map((col: any) => `| ${col.name} | ${col.type} | ${col.required ? '是' : '否'} | ${col.name} |`).join('\n')}
`).join('')}

## 🛠️ API端点

${dsl.entities.map((entity: any) => `
### ${entity.displayName || entity.name} API

- \`GET /${entity.name}s\` - 获取列表
- \`GET /${entity.name}s/{id}\` - 获取详情
- \`POST /${entity.name}s\` - 创建
- \`PUT /${entity.name}s/{id}\` - 更新
- \`DELETE /${entity.name}s/{id}\` - 删除
`).join('')}

## 🎨 页面结构

${dsl.pages.map((page: any) => `- **${page.title}**: ${page.description || '无描述'}`).join('\n')}

## 🔧 定制化

要修改应用结构：

1. 编辑 \`dsl.json\` 文件
2. 重新运行生成器：
\`\`\`bash
npm run gen-app -- --from-dsl dsl.json
\`\`\`

## 📝 许可证

此项目由Base44风格应用生成器自动生成。
生成时间: ${new Date().toISOString()}

---

💡 **提示**: 这是一个自动生成的应用，你可以根据需要进行定制和扩展。
`;
    
    writeFileSync(join(outputDir, 'README.md'), readme);
    console.log('📚 README.md已生成');
  }
}

interface GenerateOptions {
  apiKey?: string;
  schemaName?: string;
  onProgress?: (step: string, message: string, progress: number) => void;
}

// CLI主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎯 Base44风格应用生成器

用法:
  npm run gen-app "我想创建一个博客系统"
  npm run gen-app --from-dsl dsl.json
  npm run gen-app "订阅支出追踪器" --output ./my-app

选项:
  --from-dsl <file>     从DSL文件生成应用
  --output <dir>        输出目录 (默认: ./generated-app)
  --schema <name>       数据库schema名称 (默认: public)
  --api-key <key>       OpenAI API密钥

示例:
  npm run gen-app "创建一个任务管理系统，包含项目、任务、用户" --output ./task-manager
    `);
    process.exit(0);
  }
  
  const generator = new Base44Generator();
  
  try {
    // 解析参数
    const options: GenerateOptions = {};
    let prompt = '';
    let outputDir = './generated-app';
    let fromDsl = '';
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--from-dsl') {
        fromDsl = args[++i];
      } else if (arg === '--output') {
        outputDir = args[++i];
      } else if (arg === '--schema') {
        options.schemaName = args[++i];
      } else if (arg === '--api-key') {
        options.apiKey = args[++i];
      } else if (!arg.startsWith('--')) {
        prompt = arg;
      }
    }
    
    if (fromDsl) {
      await generator.generateFromDSL(fromDsl, outputDir, options);
    } else if (prompt) {
      await generator.generateApp(prompt, outputDir, options);
    } else {
      console.error('❌ 请提供应用描述或使用 --from-dsl 选项');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行main函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { Base44Generator }; 