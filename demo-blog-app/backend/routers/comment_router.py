"""
Comment 路由
提供Comment的CRUD操作
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.comment import Comment, CommentCreate, CommentUpdate

router = APIRouter()

# 这里应该添加实际的数据库操作
# 为了简化，这里使用内存存储作为示例

fake_comments = []

@router.get("/", response_model=List[Comment])
def get_comments(skip: int = 0, limit: int = 100):
    """获取Comment列表"""
    return fake_comments[skip : skip + limit]

@router.get("/{item_id}", response_model=Comment)
def get_comment(item_id: str):
    """根据ID获取Comment"""
    for item in fake_comments:
        if item.get("id") == item_id:
            return item
    raise HTTPException(status_code=404, detail="Comment not found")

@router.post("/", response_model=Comment)
def create_comment(item: CommentCreate):
    """创建新的Comment"""
    import uuid
    from datetime import datetime
    
    new_item = item.dict()
    new_item["id"] = str(uuid.uuid4())
    new_item["created_at"] = datetime.now()
    new_item["updated_at"] = datetime.now()
    
    fake_comments.append(new_item)
    return new_item

@router.put("/{item_id}", response_model=Comment)
def update_comment(item_id: str, item: CommentUpdate):
    """更新Comment"""
    for i, existing_item in enumerate(fake_comments):
        if existing_item.get("id") == item_id:
            from datetime import datetime
            
            updated_item = existing_item.copy()
            updated_item.update(item.dict(exclude_unset=True))
            updated_item["updated_at"] = datetime.now()
            
            fake_comments[i] = updated_item
            return updated_item
    
    raise HTTPException(status_code=404, detail="Comment not found")

@router.delete("/{item_id}")
def delete_comment(item_id: str):
    """删除Comment"""
    for i, item in enumerate(fake_comments):
        if item.get("id") == item_id:
            del fake_comments[i]
            return {"message": "Comment deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Comment not found")
