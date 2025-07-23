"""
个人博客系统
一个简单的个人博客管理系统

自动生成的FastAPI应用
生成时间: 2025-07-23T02:11:49.520Z
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import post_router
from routers import comment_router
from routers import category_router

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="个人博客系统",
    description="一个简单的个人博客管理系统",
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
app.include_router(post_router.router, prefix="/posts", tags=["文章"])
app.include_router(comment_router.router, prefix="/comments", tags=["评论"])
app.include_router(category_router.router, prefix="/categorys", tags=["分类"])

@app.get("/")
def read_root():
    return {
        "message": "欢迎使用个人博客系统",
        "description": "一个简单的个人博客管理系统",
        "version": "1.0.0",
        "endpoints": [
            "/posts",
            "/comments",
            "/categorys"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
