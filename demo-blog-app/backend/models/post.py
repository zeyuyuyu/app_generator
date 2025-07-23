"""
Post模型定义
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class PostBase(BaseModel):
    """Post基础模型"""
    title: str = Field(..., description="标题")
    content: str = Field(..., description="content")
    author: str = Field(..., description="author")
    published: Optional[bool] = None = Field(..., description="published")
    publish_date: Optional[datetime] = None = Field(..., description="publish_date")

class PostCreate(PostBase):
    """创建Post时使用的模型"""
    pass

class PostUpdate(BaseModel):
    """更新Post时使用的模型"""
    title: Optional[str] = None = Field(..., description="标题")
    content: Optional[str] = None = Field(..., description="content")
    author: Optional[str] = None = Field(..., description="author")
    published: Optional[bool] = None = Field(..., description="published")
    publish_date: Optional[datetime] = None = Field(..., description="publish_date")

class Post(PostBase):
    """Post完整模型"""
    id: str = Field(..., description="主键ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    
    class Config:
        from_attributes = True
