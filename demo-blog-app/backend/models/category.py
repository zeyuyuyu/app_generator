"""
Category模型定义
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class CategoryBase(BaseModel):
    """Category基础模型"""
    name: str = Field(..., description="名称")
    description: Optional[str] = None = Field(..., description="描述")

class CategoryCreate(CategoryBase):
    """创建Category时使用的模型"""
    pass

class CategoryUpdate(BaseModel):
    """更新Category时使用的模型"""
    name: Optional[str] = None = Field(..., description="名称")
    description: Optional[str] = None = Field(..., description="描述")

class Category(CategoryBase):
    """Category完整模型"""
    id: str = Field(..., description="主键ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    
    class Config:
        from_attributes = True
