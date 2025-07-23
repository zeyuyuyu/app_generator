"""
Task 路由
提供Task的CRUD操作
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.task import Task, TaskCreate, TaskUpdate

router = APIRouter()

# 这里应该添加实际的数据库操作
# 为了简化，这里使用内存存储作为示例

fake_tasks = []

@router.get("/", response_model=List[Task])
def get_tasks(skip: int = 0, limit: int = 100):
    """获取Task列表"""
    return fake_tasks[skip : skip + limit]

@router.get("/{item_id}", response_model=Task)
def get_task(item_id: str):
    """根据ID获取Task"""
    for item in fake_tasks:
        if item.get("id") == item_id:
            return item
    raise HTTPException(status_code=404, detail="Task not found")

@router.post("/", response_model=Task)
def create_task(item: TaskCreate):
    """创建新的Task"""
    import uuid
    from datetime import datetime
    
    new_item = item.dict()
    new_item["id"] = str(uuid.uuid4())
    new_item["created_at"] = datetime.now()
    new_item["updated_at"] = datetime.now()
    
    fake_tasks.append(new_item)
    return new_item

@router.put("/{item_id}", response_model=Task)
def update_task(item_id: str, item: TaskUpdate):
    """更新Task"""
    for i, existing_item in enumerate(fake_tasks):
        if existing_item.get("id") == item_id:
            from datetime import datetime
            
            updated_item = existing_item.copy()
            updated_item.update(item.dict(exclude_unset=True))
            updated_item["updated_at"] = datetime.now()
            
            fake_tasks[i] = updated_item
            return updated_item
    
    raise HTTPException(status_code=404, detail="Task not found")

@router.delete("/{item_id}")
def delete_task(item_id: str):
    """删除Task"""
    for i, item in enumerate(fake_tasks):
        if item.get("id") == item_id:
            del fake_tasks[i]
            return {"message": "Task deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Task not found")
