# 待办事项应用

一个用于追踪待办事项的简单应用，包括任务名称、完成状态和创建时间。

## 📋 项目概述

此项目由Base44风格的应用生成器自动创建，包含：

- **后端**: FastAPI + SQLAlchemy + PostgreSQL
- **前端**: React + TypeScript + Tailwind CSS
- **数据库**: PostgreSQL

## 🏗️ 项目结构

```
待办事项应用/
├── backend/                 # FastAPI后端
│   ├── main.py             # 主应用文件
│   ├── database.py         # 数据库连接
│   ├── models/             # Pydantic模型
│   ├── routers/            # API路由
│   └── requirements.txt    # Python依赖
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   └── services/       # API服务
│   └── package.json        # Node.js依赖
├── migration.sql           # 数据库迁移脚本
├── docker-compose.yml      # Docker部署配置
└── dsl.json               # 应用结构定义
```

## 🚀 快速开始

### 使用Docker（推荐）

1. 确保安装了Docker和Docker Compose
2. 启动所有服务：

```bash
docker-compose up -d
```

3. 访问应用：
   - 前端: http://localhost:3000
   - 后端API: http://localhost:8000
   - API文档: http://localhost:8000/docs

### 手动部署

#### 后端设置

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 配置数据库URL（可选，默认使用环境变量）：
```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/database"
```

4. 启动后端：
```bash
python main.py
```

#### 前端设置

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

#### 数据库设置

1. 创建PostgreSQL数据库
2. 执行迁移脚本：
```bash
psql -d your_database -f migration.sql
```

## 📊 实体结构


### 任务

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| id | number | 是 | id |
| name | text | 是 | name |
| completed | boolean | 是 | completed |
| created_at | date | 是 | created_at |
| updated_at | date | 是 | updated_at |


## 🛠️ API端点


### 任务 API

- `GET /tasks` - 获取列表
- `GET /tasks/{id}` - 获取详情
- `POST /tasks` - 创建
- `PUT /tasks/{id}` - 更新
- `DELETE /tasks/{id}` - 删除


## 🎨 页面结构

- **任务列表**: 展示所有待办事项的列表
- **任务表单**: 用于添加或编辑待办事项的表单
- **任务详情**: 展示待办事项的详细信息

## 🔧 定制化

要修改应用结构：

1. 编辑 `dsl.json` 文件
2. 重新运行生成器：
```bash
npm run gen-app -- --from-dsl dsl.json
```

## 📝 许可证

此项目由Base44风格应用生成器自动生成。
生成时间: 2025-07-23T02:13:08.659Z

---

💡 **提示**: 这是一个自动生成的应用，你可以根据需要进行定制和扩展。
