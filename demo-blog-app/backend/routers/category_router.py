"""
Category 路由
提供Category的CRUD操作
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.category import Category, CategoryCreate, CategoryUpdate

router = APIRouter()

# 这里应该添加实际的数据库操作
# 为了简化，这里使用内存存储作为示例

fake_categorys = []

@router.get("/", response_model=List[Category])
def get_categorys(skip: int = 0, limit: int = 100):
    """获取Category列表"""
    return fake_categorys[skip : skip + limit]

@router.get("/{item_id}", response_model=Category)
def get_category(item_id: str):
    """根据ID获取Category"""
    for item in fake_categorys:
        if item.get("id") == item_id:
            return item
    raise HTTPException(status_code=404, detail="Category not found")

@router.post("/", response_model=Category)
def create_category(item: CategoryCreate):
    """创建新的Category"""
    import uuid
    from datetime import datetime
    
    new_item = item.dict()
    new_item["id"] = str(uuid.uuid4())
    new_item["created_at"] = datetime.now()
    new_item["updated_at"] = datetime.now()
    
    fake_categorys.append(new_item)
    return new_item

@router.put("/{item_id}", response_model=Category)
def update_category(item_id: str, item: CategoryUpdate):
    """更新Category"""
    for i, existing_item in enumerate(fake_categorys):
        if existing_item.get("id") == item_id:
            from datetime import datetime
            
            updated_item = existing_item.copy()
            updated_item.update(item.dict(exclude_unset=True))
            updated_item["updated_at"] = datetime.now()
            
            fake_categorys[i] = updated_item
            return updated_item
    
    raise HTTPException(status_code=404, detail="Category not found")

@router.delete("/{item_id}")
def delete_category(item_id: str):
    """删除Category"""
    for i, item in enumerate(fake_categorys):
        if item.get("id") == item_id:
            del fake_categorys[i]
            return {"message": "Category deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Category not found")
