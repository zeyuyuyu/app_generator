"""
Subscription 路由
提供Subscription的CRUD操作
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.subscription import Subscription, SubscriptionCreate, SubscriptionUpdate

router = APIRouter()

# 这里应该添加实际的数据库操作
# 为了简化，这里使用内存存储作为示例

fake_subscriptions = []

@router.get("/", response_model=List[Subscription])
def get_subscriptions(skip: int = 0, limit: int = 100):
    """获取Subscription列表"""
    return fake_subscriptions[skip : skip + limit]

@router.get("/{item_id}", response_model=Subscription)
def get_subscription(item_id: str):
    """根据ID获取Subscription"""
    for item in fake_subscriptions:
        if item.get("id") == item_id:
            return item
    raise HTTPException(status_code=404, detail="Subscription not found")

@router.post("/", response_model=Subscription)
def create_subscription(item: SubscriptionCreate):
    """创建新的Subscription"""
    import uuid
    from datetime import datetime
    
    new_item = item.dict()
    new_item["id"] = str(uuid.uuid4())
    new_item["created_at"] = datetime.now()
    new_item["updated_at"] = datetime.now()
    
    fake_subscriptions.append(new_item)
    return new_item

@router.put("/{item_id}", response_model=Subscription)
def update_subscription(item_id: str, item: SubscriptionUpdate):
    """更新Subscription"""
    for i, existing_item in enumerate(fake_subscriptions):
        if existing_item.get("id") == item_id:
            from datetime import datetime
            
            updated_item = existing_item.copy()
            updated_item.update(item.dict(exclude_unset=True))
            updated_item["updated_at"] = datetime.now()
            
            fake_subscriptions[i] = updated_item
            return updated_item
    
    raise HTTPException(status_code=404, detail="Subscription not found")

@router.delete("/{item_id}")
def delete_subscription(item_id: str):
    """删除Subscription"""
    for i, item in enumerate(fake_subscriptions):
        if item.get("id") == item_id:
            del fake_subscriptions[i]
            return {"message": "Subscription deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Subscription not found")
