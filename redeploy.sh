#!/bin/bash

# 网络剪切板 Docker 清理和重新部署脚本

set -e

cd "$(dirname "$0")"

echo "=== 清理旧容器和卷 ==="
docker-compose down

echo "=== 删除旧卷 ==="
docker volume rm clipboard_clipboard-data 2>/dev/null || echo "卷不存在"
docker volume rm clipboard_clipboard-uploads 2>/dev/null || echo "卷不存在"

echo "=== 设置环境变量 ==="
export JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}
export ENCRYPTION_KEY=${ENCRYPTION_KEY:-$(openssl rand -hex 32)}

echo "JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "ENCRYPTION_KEY: ${ENCRYPTION_KEY:0:10}..."

echo "=== 重新构建并启动 ==="
docker-compose up -d --build --force-recreate

echo ""
echo "=== 等待启动 ==="
sleep 10

echo "=== 查看日志 ==="
docker-compose logs --tail=50 app

echo ""
echo "=== 部署完成 ==="
echo "访问地址：http://localhost:7707"
