#!/bin/bash

# 本地测试脚本

cd "$(dirname "$0")"

echo "=== 本地测试 ==="

# 清理并创建数据目录
rm -rf ./data
mkdir -p ./data ./public/uploads

# 设置环境变量
export DATABASE_URL="file:$(pwd)/data/dev.db"
export JWT_SECRET="test-secret-key-$(openssl rand -hex 16)"
export ENCRYPTION_KEY="test-encrypt-key-$(openssl rand -hex 16)"
export PORT=7707

echo "数据目录：$DATABASE_URL"
echo ""

# 初始化数据库
echo "初始化数据库..."
pnpm prisma migrate dev --name init 2>&1 | tail -10

# 启动生产服务器
echo ""
echo "启动生产服务器..."
pnpm build 2>&1 | tail -5

echo ""
echo "启动服务器..."
pnpm start &

# 等待服务器启动
sleep 5

echo ""
echo "测试 API..."
curl -s http://localhost:7707/api/auth/me | head -1

echo ""
echo ""
echo "=== 测试完成 ==="
echo "访问：http://localhost:7707"
echo "按 Ctrl+C 停止服务器"
