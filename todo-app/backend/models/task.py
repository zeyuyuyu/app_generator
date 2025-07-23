"""
Task模型定义
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class TaskBase(BaseModel):
    """Task基础模型"""
    name: str = Field(..., description="名称")
    completed: bool = Field(..., description="completed")

class TaskCreate(TaskBase):
    """创建Task时使用的模型"""
    pass

class TaskUpdate(BaseModel):
    """更新Task时使用的模型"""
    name: Optional[str] = None = Field(..., description="名称")
    completed: Optional[bool] = None = Field(..., description="completed")

class Task(TaskBase):
    """Task完整模型"""
    id: str = Field(..., description="主键ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    
    class Config:
        from_attributes = True
