"""
Post 路由
提供Post的CRUD操作
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.post import Post, PostCreate, PostUpdate

router = APIRouter()

# 这里应该添加实际的数据库操作
# 为了简化，这里使用内存存储作为示例

fake_posts = []

@router.get("/", response_model=List[Post])
def get_posts(skip: int = 0, limit: int = 100):
    """获取Post列表"""
    return fake_posts[skip : skip + limit]

@router.get("/{item_id}", response_model=Post)
def get_post(item_id: str):
    """根据ID获取Post"""
    for item in fake_posts:
        if item.get("id") == item_id:
            return item
    raise HTTPException(status_code=404, detail="Post not found")

@router.post("/", response_model=Post)
def create_post(item: PostCreate):
    """创建新的Post"""
    import uuid
    from datetime import datetime
    
    new_item = item.dict()
    new_item["id"] = str(uuid.uuid4())
    new_item["created_at"] = datetime.now()
    new_item["updated_at"] = datetime.now()
    
    fake_posts.append(new_item)
    return new_item

@router.put("/{item_id}", response_model=Post)
def update_post(item_id: str, item: PostUpdate):
    """更新Post"""
    for i, existing_item in enumerate(fake_posts):
        if existing_item.get("id") == item_id:
            from datetime import datetime
            
            updated_item = existing_item.copy()
            updated_item.update(item.dict(exclude_unset=True))
            updated_item["updated_at"] = datetime.now()
            
            fake_posts[i] = updated_item
            return updated_item
    
    raise HTTPException(status_code=404, detail="Post not found")

@router.delete("/{item_id}")
def delete_post(item_id: str):
    """删除Post"""
    for i, item in enumerate(fake_posts):
        if item.get("id") == item_id:
            del fake_posts[i]
            return {"message": "Post deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Post not found")
