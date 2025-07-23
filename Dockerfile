# Base44 应用生成器 - Docker 镜像

# 使用 Node.js 18 Alpine 镜像作为基础
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# 设置环境变量
ENV NODE_ENV=production
ENV WEB_PORT=3001
ENV HOST=0.0.0.0

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装 Node.js 依赖
RUN npm ci --only=production && \
    npm cache clean --force

# 复制源代码
COPY . .

# 构建 TypeScript 代码
RUN npm run build

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S base44 -u 1001

# 创建必要的目录并设置权限
RUN mkdir -p /app/generated-apps /app/logs && \
    chown -R base44:nodejs /app

# 切换到非 root 用户
USER base44

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node --eval "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# 启动命令
CMD ["npm", "run", "web"] 