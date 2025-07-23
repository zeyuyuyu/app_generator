"""
Subscription模型定义
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class SubscriptionBase(BaseModel):
    """Subscription基础模型"""
    name: str = Field(..., description="名称")
    price: float = Field(..., description="price")
    billingCycle: str = Field(..., description="billingCycle")
    isEnabled: bool = Field(..., description="isEnabled")
    websiteLink: Optional[str] = None = Field(..., description="websiteLink")

class SubscriptionCreate(SubscriptionBase):
    """创建Subscription时使用的模型"""
    pass

class SubscriptionUpdate(BaseModel):
    """更新Subscription时使用的模型"""
    name: Optional[str] = None = Field(..., description="名称")
    price: Optional[float] = None = Field(..., description="price")
    billingCycle: Optional[str] = None = Field(..., description="billingCycle")
    isEnabled: Optional[bool] = None = Field(..., description="isEnabled")
    websiteLink: Optional[str] = None = Field(..., description="websiteLink")

class Subscription(SubscriptionBase):
    """Subscription完整模型"""
    id: str = Field(..., description="主键ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    
    class Config:
        from_attributes = True
