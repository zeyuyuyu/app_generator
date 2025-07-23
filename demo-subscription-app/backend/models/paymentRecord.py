"""
PaymentRecord模型定义
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class PaymentRecordBase(BaseModel):
    """PaymentRecord基础模型"""
    subscriptionId: str = Field(..., description="subscriptionId")
    amount: float = Field(..., description="amount")
    paymentDate: datetime = Field(..., description="paymentDate")
    paymentStatus: str = Field(..., description="paymentStatus")

class PaymentRecordCreate(PaymentRecordBase):
    """创建PaymentRecord时使用的模型"""
    pass

class PaymentRecordUpdate(BaseModel):
    """更新PaymentRecord时使用的模型"""
    subscriptionId: Optional[str] = None = Field(..., description="subscriptionId")
    amount: Optional[float] = None = Field(..., description="amount")
    paymentDate: Optional[datetime] = None = Field(..., description="paymentDate")
    paymentStatus: Optional[str] = None = Field(..., description="paymentStatus")

class PaymentRecord(PaymentRecordBase):
    """PaymentRecord完整模型"""
    id: str = Field(..., description="主键ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    
    class Config:
        from_attributes = True
