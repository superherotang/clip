#!/bin/bash
# 清理并重新构建 Docker 容器

cd /home/tang/clip

echo "=== Stopping containers ==="
docker-compose down

echo "=== Removing old volumes ==="
docker volume rm clipboard_clipboard-data 2>/dev/null || echo "Volume didn't exist"

echo "=== Setting environment variables ==="
export JWT_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)

echo "JWT_SECRET: $JWT_SECRET"
echo "ENCRYPTION_KEY: $ENCRYPTION_KEY"

echo "=== Building and starting containers ==="
docker-compose up -d --build --no-cache

echo "=== Waiting for application to start ==="
sleep 10

echo "=== Showing logs ==="
docker-compose logs -f app
