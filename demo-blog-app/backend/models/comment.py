"""
Comment模型定义
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class CommentBase(BaseModel):
    """Comment基础模型"""
    post_id: str = Field(..., description="post_id")
    author: str = Field(..., description="author")
    email: str = Field(..., description="邮箱地址")
    content: str = Field(..., description="content")
    approved: Optional[bool] = None = Field(..., description="approved")

class CommentCreate(CommentBase):
    """创建Comment时使用的模型"""
    pass

class CommentUpdate(BaseModel):
    """更新Comment时使用的模型"""
    post_id: Optional[str] = None = Field(..., description="post_id")
    author: Optional[str] = None = Field(..., description="author")
    email: Optional[str] = None = Field(..., description="邮箱地址")
    content: Optional[str] = None = Field(..., description="content")
    approved: Optional[bool] = None = Field(..., description="approved")

class Comment(CommentBase):
    """Comment完整模型"""
    id: str = Field(..., description="主键ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    
    class Config:
        from_attributes = True
