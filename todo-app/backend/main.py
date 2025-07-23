"""
待办事项应用
一个用于追踪待办事项的简单应用，包括任务名称、完成状态和创建时间。

自动生成的FastAPI应用
生成时间: 2025-07-23T02:13:08.656Z
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import task_router

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="待办事项应用",
    description="一个用于追踪待办事项的简单应用，包括任务名称、完成状态和创建时间。",
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
app.include_router(task_router.router, prefix="/tasks", tags=["任务"])

@app.get("/")
def read_root():
    return {
        "message": "欢迎使用待办事项应用",
        "description": "一个用于追踪待办事项的简单应用，包括任务名称、完成状态和创建时间。",
        "version": "1.0.0",
        "endpoints": [
            "/tasks"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
