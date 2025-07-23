# 订阅支出追踪器

管理订阅服务和支付记录，以及查看总支出和即将到期的订阅

## 📋 项目概述

此项目由Base44风格的应用生成器自动创建，包含：

- **后端**: FastAPI + SQLAlchemy + PostgreSQL
- **前端**: React + TypeScript + Tailwind CSS
- **数据库**: PostgreSQL

## 🏗️ 项目结构

```
订阅支出追踪器/
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


### 订阅服务

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| id | text | 是 | id |
| name | text | 是 | name |
| price | number | 是 | price |
| billingCycle | text | 是 | billingCycle |
| isEnabled | boolean | 是 | isEnabled |
| websiteLink | url | 否 | websiteLink |
| created_at | date | 是 | created_at |
| updated_at | date | 是 | updated_at |

### 支付记录

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| id | text | 是 | id |
| subscriptionId | text | 是 | subscriptionId |
| amount | number | 是 | amount |
| paymentDate | date | 是 | paymentDate |
| paymentStatus | text | 是 | paymentStatus |
| created_at | date | 是 | created_at |
| updated_at | date | 是 | updated_at |


## 🛠️ API端点


### 订阅服务 API

- `GET /subscriptions` - 获取列表
- `GET /subscriptions/{id}` - 获取详情
- `POST /subscriptions` - 创建
- `PUT /subscriptions/{id}` - 更新
- `DELETE /subscriptions/{id}` - 删除

### 支付记录 API

- `GET /paymentRecords` - 获取列表
- `GET /paymentRecords/{id}` - 获取详情
- `POST /paymentRecords` - 创建
- `PUT /paymentRecords/{id}` - 更新
- `DELETE /paymentRecords/{id}` - 删除


## 🎨 页面结构

- **订阅服务列表**: 查看所有订阅服务
- **添加/编辑订阅服务**: 添加或编辑订阅服务信息
- **订阅服务详情**: 查看订阅服务的详细信息
- **支付记录列表**: 查看所有支付记录
- **添加/编辑支付记录**: 添加或编辑支付记录
- **支付记录详情**: 查看支付记录的详细信息
- **仪表板**: 显示总支出和即将到期的订阅

## 🔧 定制化

要修改应用结构：

1. 编辑 `dsl.json` 文件
2. 重新运行生成器：
```bash
npm run gen-app -- --from-dsl dsl.json
```

## 📝 许可证

此项目由Base44风格应用生成器自动生成。
生成时间: 2025-07-23T02:11:49.518Z

---

💡 **提示**: 这是一个自动生成的应用，你可以根据需要进行定制和扩展。
