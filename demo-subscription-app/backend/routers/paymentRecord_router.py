"""
PaymentRecord 路由
提供PaymentRecord的CRUD操作
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.paymentRecord import PaymentRecord, PaymentRecordCreate, PaymentRecordUpdate

router = APIRouter()

# 这里应该添加实际的数据库操作
# 为了简化，这里使用内存存储作为示例

fake_paymentRecords = []

@router.get("/", response_model=List[PaymentRecord])
def get_paymentRecords(skip: int = 0, limit: int = 100):
    """获取PaymentRecord列表"""
    return fake_paymentRecords[skip : skip + limit]

@router.get("/{item_id}", response_model=PaymentRecord)
def get_paymentRecord(item_id: str):
    """根据ID获取PaymentRecord"""
    for item in fake_paymentRecords:
        if item.get("id") == item_id:
            return item
    raise HTTPException(status_code=404, detail="PaymentRecord not found")

@router.post("/", response_model=PaymentRecord)
def create_paymentRecord(item: PaymentRecordCreate):
    """创建新的PaymentRecord"""
    import uuid
    from datetime import datetime
    
    new_item = item.dict()
    new_item["id"] = str(uuid.uuid4())
    new_item["created_at"] = datetime.now()
    new_item["updated_at"] = datetime.now()
    
    fake_paymentRecords.append(new_item)
    return new_item

@router.put("/{item_id}", response_model=PaymentRecord)
def update_paymentRecord(item_id: str, item: PaymentRecordUpdate):
    """更新PaymentRecord"""
    for i, existing_item in enumerate(fake_paymentRecords):
        if existing_item.get("id") == item_id:
            from datetime import datetime
            
            updated_item = existing_item.copy()
            updated_item.update(item.dict(exclude_unset=True))
            updated_item["updated_at"] = datetime.now()
            
            fake_paymentRecords[i] = updated_item
            return updated_item
    
    raise HTTPException(status_code=404, detail="PaymentRecord not found")

@router.delete("/{item_id}")
def delete_paymentRecord(item_id: str):
    """删除PaymentRecord"""
    for i, item in enumerate(fake_paymentRecords):
        if item.get("id") == item_id:
            del fake_paymentRecords[i]
            return {"message": "PaymentRecord deleted successfully"}
    
    raise HTTPException(status_code=404, detail="PaymentRecord not found")
