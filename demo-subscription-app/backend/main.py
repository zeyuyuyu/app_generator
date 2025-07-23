"""
订阅支出追踪器
管理订阅服务和支付记录，以及查看总支出和即将到期的订阅

自动生成的FastAPI应用
生成时间: 2025-07-23T02:11:49.514Z
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import subscription_router
from routers import paymentRecord_router

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="订阅支出追踪器",
    description="管理订阅服务和支付记录，以及查看总支出和即将到期的订阅",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由
app.include_router(subscription_router.router, prefix="/subscriptions", tags=["订阅服务"])
app.include_router(paymentRecord_router.router, prefix="/paymentRecords", tags=["支付记录"])

@app.get("/")
def read_root():
    return {
        "message": "欢迎使用订阅支出追踪器",
        "description": "管理订阅服务和支付记录，以及查看总支出和即将到期的订阅",
        "version": "1.0.0",
        "endpoints": [
            "/subscriptions",
            "/paymentRecords"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
