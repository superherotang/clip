#!/bin/bash

cd /home/tang/clip

echo "=== 停止旧容器 ==="
docker-compose down

echo "=== 删除旧卷 ==="
docker volume rm clipboard_clipboard-data 2>/dev/null || true
docker volume rm clipboard_clipboard-uploads 2>/dev/null || true

echo "=== 设置环境变量 ==="
export JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}
export ENCRYPTION_KEY=${ENCRYPTION_KEY:-$(openssl rand -hex 32)}

echo "=== 重新构建并启动 ==="
docker-compose up -d --build --force-recreate --no-cache

echo "=== 等待 20 秒 ==="
sleep 20

echo "=== 查看日志 ==="
docker-compose logs --tail=100 app

echo ""
echo "=== 完成 ==="
echo "访问：http://localhost:7707"
