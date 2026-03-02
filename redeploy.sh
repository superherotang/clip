#!/bin/bash

# 网络剪切板 Docker 重新部署脚本

set -e

cd "$(dirname "$0")"

echo "=== 停止旧容器 ==="
docker-compose down

echo "=== 删除旧卷（会删除所有数据！）==="
docker volume rm clipboard_clipboard-data 2>/dev/null || echo "卷 clipboard-data 不存在"
docker volume rm clipboard_clipboard-uploads 2>/dev/null || echo "卷 clipboard-uploads 不存在"

echo "=== 设置环境变量 ==="
export JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}
export ENCRYPTION_KEY=${ENCRYPTION_KEY:-$(openssl rand -hex 32)}

echo "JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "ENCRYPTION_KEY: ${ENCRYPTION_KEY:0:10}..."

echo "=== 重新构建并启动 ==="
docker-compose up -d --build --force-recreate --no-cache

echo ""
echo "=== 等待应用启动（15 秒）==="
sleep 15

echo "=== 查看日志 ==="
docker-compose logs --tail=100 app

echo ""
echo "=== 测试 API ==="
docker-compose exec app wget -qO- http://localhost:3000/api/auth/me 2>/dev/null || echo "API 测试失败"

echo ""
echo "=== 部署完成 ==="
echo "访问地址：http://localhost:7707"
echo ""
echo "如果看到 'no such table' 错误，请执行:"
echo "  docker-compose exec app npx prisma migrate deploy"
