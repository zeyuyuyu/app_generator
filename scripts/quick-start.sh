#!/bin/bash

# Base44 应用生成器 - 快速启动脚本
# 使用方法: ./scripts/quick-start.sh

echo "🚀 Base44 应用生成器 - 快速启动"
echo "=================================="

# 检查环境
echo "📋 检查环境要求..."

# 检查 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ 错误: 请先安装 Node.js 18+"
    exit 1
fi

# 检查 npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ 错误: npm 未找到"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
else
    echo "✅ 依赖已安装"
fi

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚙️ 创建环境变量文件..."
    if [ -f "env.template" ]; then
        cp env.template .env
        echo "📝 请编辑 .env 文件，设置你的 OpenAI API 密钥"
        echo "   OPENAI_API_KEY=your_key_here"
    else
        echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
        echo "WEB_PORT=3001" >> .env
        echo "HOST=localhost" >> .env
    fi
    echo "⚠️  注意: 请先配置 .env 文件中的 OpenAI API 密钥"
else
    echo "✅ 环境变量文件存在"
fi

echo ""
echo "🎯 启动选项:"
echo "1. Web GUI 界面 (推荐): npm run web"
echo "2. 运行演示: npm run demo"
echo "3. 命令行生成: npm run gen-app -- --prompt '你的需求' --output my-app"

echo ""
echo "📖 更多信息:"
echo "- 部署指南: DEPLOYMENT.md"
echo "- GUI使用: GUI使用指南.md"
echo "- GitHub: https://github.com/zeyuyuyu/app_generator"

echo ""
read -p "是否立即启动 Web GUI? (y/n): " choice
case "$choice" in 
  y|Y|yes|YES ) 
    echo "🌐 启动 Web GUI..."
    npm run web
    ;;
  * ) 
    echo "💡 准备完成！使用 'npm run web' 启动 Web 界面"
    ;;
esac 