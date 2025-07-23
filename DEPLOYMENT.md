# 🚀 Base44 应用生成器 - 部署使用指南

## 📋 目录
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [详细安装](#详细安装)
- [环境配置](#环境配置)
- [部署方式](#部署方式)
- [生产环境部署](#生产环境部署)
- [故障排除](#故障排除)
- [性能优化](#性能优化)

---

## 🛠️ 环境要求

### 基础环境
- **Node.js**: 18.0+ (推荐 LTS 版本)
- **npm**: 8.0+ 或 **yarn**: 1.22+
- **Git**: 用于克隆仓库

### 可选环境（用于生成的应用）
- **Docker**: 20.0+ (用于容器化部署)
- **PostgreSQL**: 12+ (数据库支持)
- **Python**: 3.8+ (后端应用运行)

### 开发环境
- **IDE**: VS Code, WebStorm 或其他
- **Chrome/Firefox**: 用于Web GUI界面

---

## ⚡ 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/zeyuyuyu/app_generator.git
cd app_generator
```

### 2. 安装依赖
```bash
npm install
# 或者使用 yarn
yarn install
```

### 3. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量（可选）
nano .env
```

### 4. 启动服务

#### 🌐 Web GUI 模式（推荐）
```bash
npm run web
```
访问：http://localhost:3001

#### 🖥️ 命令行模式
```bash
# 运行演示
npm run demo

# 生成自定义应用
npm run gen-app -- --prompt "你的应用需求" --output my-app
```

---

## 📦 详细安装

### Step 1: 环境检查
```bash
# 检查 Node.js 版本
node --version  # 应该 >= v18.0.0

# 检查 npm 版本  
npm --version   # 应该 >= 8.0.0

# 检查 Git 版本
git --version
```

### Step 2: 获取源码
```bash
# 克隆最新代码
git clone https://github.com/zeyuyuyu/app_generator.git

# 进入项目目录
cd app_generator

# 查看项目结构
ls -la
```

### Step 3: 安装依赖
```bash
# 清理 npm 缓存（如果之前有安装过）
npm cache clean --force

# 安装项目依赖
npm install

# 验证安装
npm list --depth=0
```

### Step 4: 验证安装
```bash
# 编译 TypeScript
npm run build

# 运行测试
npm run demo
```

---

## ⚙️ 环境配置

### 环境变量设置

创建 `.env` 文件：
```bash
# OpenAI API 配置
OPENAI_API_KEY=your_openai_api_key_here

# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/database

# Web 服务器配置
WEB_PORT=3001
HOST=localhost

# 生成应用存储目录
APPS_DIR=./generated-apps
```

### OpenAI API 密钥获取
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册或登录账户
3. 进入 API Keys 页面
4. 创建新的 API 密钥
5. 复制密钥到 `.env` 文件

### 数据库配置（可选）
```bash
# PostgreSQL 本地安装
sudo apt-get install postgresql postgresql-contrib

# 创建数据库用户
sudo -u postgres createuser --interactive

# 创建数据库
sudo -u postgres createdb your_database_name
```

---

## 🚀 部署方式

### 方式 1: 开发环境部署

适用于：开发测试、功能验证

```bash
# 1. 启动开发服务器
npm run web

# 2. 访问 Web 界面
open http://localhost:3001

# 3. 使用命令行工具
npm run gen-app -- --help
```

**优点**：
- 快速启动
- 支持热重载
- 完整功能可用

### 方式 2: Docker 容器部署

适用于：隔离环境、快速部署

#### 创建 Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制包配置
COPY package*.json ./
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "run", "web"]
```

#### 部署命令
```bash
# 构建镜像
docker build -t base44-generator .

# 运行容器
docker run -d \
  --name base44-generator \
  -p 3001:3001 \
  -e OPENAI_API_KEY=your_key_here \
  base44-generator

# 查看日志
docker logs base44-generator
```

#### Docker Compose 部署
```yaml
# docker-compose.yml
version: '3.8'

services:
  base44-generator:
    build: .
    ports:
      - "3001:3001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/base44
    depends_on:
      - postgres
    volumes:
      - ./generated-apps:/app/generated-apps

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: base44
      POSTGRES_USER: postgres  
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps
```

### 方式 3: 云服务部署

#### 部署到 Heroku
```bash
# 安装 Heroku CLI
npm install -g heroku

# 登录 Heroku
heroku login

# 创建应用
heroku create your-app-name

# 设置环境变量
heroku config:set OPENAI_API_KEY=your_key_here

# 部署
git push heroku main
```

#### 部署到 Vercel
```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel --prod
```

#### 部署到 Railway
```bash
# 连接 Railway
railway login

# 部署项目
railway up
```

---

## 🏭 生产环境部署

### 服务器配置要求

**最低配置**：
- CPU: 2 核
- 内存: 4GB RAM
- 存储: 20GB SSD
- 网络: 10Mbps

**推荐配置**：
- CPU: 4 核
- 内存: 8GB RAM  
- 存储: 50GB SSD
- 网络: 100Mbps

### 生产环境优化

#### 1. 环境变量优化
```bash
# 生产环境配置
NODE_ENV=production
WEB_PORT=3001
HOST=0.0.0.0

# 安全配置
SESSION_SECRET=your_random_secret_here
CORS_ORIGIN=https://yourdomain.com
```

#### 2. 进程管理（PM2）
```bash
# 安装 PM2
npm install -g pm2

# 创建 PM2 配置
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'base44-generator',
    script: 'dist/src/web-server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# 构建并启动
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 3. Nginx 反向代理
```nginx
# /etc/nginx/sites-available/base44-generator
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 支持
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/base44-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL 证书（Let's Encrypt）
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 监控和日志

#### 日志配置
```javascript
// src/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

#### 健康检查端点
```javascript
// 添加到 web-server.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

---

## 🔧 故障排除

### 常见问题

#### 1. OpenAI API 错误
```bash
# 错误：API密钥无效
Error: The OPENAI_API_KEY environment variable is missing or empty

# 解决方案：
1. 检查 .env 文件是否存在
2. 验证 API 密钥是否正确
3. 确认 API 密钥有足够额度
```

#### 2. 端口占用错误
```bash
# 错误：端口已被占用
Error: listen EADDRINUSE: address already in use :::3001

# 解决方案：
# 查找占用进程
lsof -i :3001
# 或者
netstat -tulpn | grep :3001

# 终止进程
kill -9 <PID>

# 或者修改端口
export WEB_PORT=3002
```

#### 3. 依赖安装失败
```bash
# 错误：npm install 失败
npm ERR! peer dep missing

# 解决方案：
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 或使用 yarn
yarn install
```

#### 4. TypeScript 编译错误
```bash
# 错误：TypeScript 类型错误
error TS2304: Cannot find name 'Express'

# 解决方案：
npm install @types/express @types/node
npm run build
```

### 日志调试

#### 启用调试模式
```bash
# 设置调试环境变量
export DEBUG=base44:*
export NODE_ENV=development

# 启动服务
npm run web
```

#### 查看生成日志
```bash
# 查看 Web 服务器日志
tail -f logs/web-server.log

# 查看生成器日志  
tail -f logs/generator.log
```

---

## ⚡ 性能优化

### 1. 内存优化
```javascript
// 增加 Node.js 内存限制
node --max-old-space-size=4096 dist/src/web-server.js
```

### 2. 并发处理
```javascript
// PM2 集群模式
pm2 start ecosystem.config.js --instances max
```

### 3. 缓存策略
```javascript
// Redis 缓存配置
const redis = require('redis');
const client = redis.createClient();

// 缓存生成结果
app.post('/api/generate', async (req, res) => {
  const cacheKey = `gen:${hash(req.body.prompt)}`;
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // 生成新应用...
  const result = await generateApp(req.body);
  await client.setex(cacheKey, 3600, JSON.stringify(result));
  
  res.json(result);
});
```

### 4. 静态资源优化
```nginx
# Nginx 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip 压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

---

## 📚 额外资源

### 文档链接
- [项目 README](README.md)
- [GUI 使用指南](GUI使用指南.md)
- [验证报告](验证报告.md)

### 社区支持
- [GitHub Issues](https://github.com/zeyuyuyu/app_generator/issues)
- [讨论区](https://github.com/zeyuyuyu/app_generator/discussions)

### 相关工具
- [OpenAI Platform](https://platform.openai.com/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🤝 贡献指南

如果您在部署过程中遇到问题或有改进建议，请：

1. 查看 [Issues](https://github.com/zeyuyuyu/app_generator/issues) 是否有相似问题
2. 创建新的 Issue 详细描述问题
3. 提交 Pull Request 贡献解决方案

**🎉 祝您部署顺利！如有问题，欢迎随时反馈！** 