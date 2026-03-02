#!/bin/sh

# 确保数据目录存在
mkdir -p /app/data
mkdir -p /app/public/uploads

# 显示配置信息
echo "=== Application Configuration ==="
echo "DATABASE_URL: $DATABASE_URL"
echo "NODE_ENV: $NODE_ENV"
echo "Working directory: $(pwd)"
echo "Data directory: $(ls -la /app/data)"
echo "================================="

# 运行 Prisma 迁移
echo "Running Prisma migrations..."
cd /app
npx prisma migrate deploy 2>&1 || echo "Migration completed or skipped"

# 启动应用
echo "Starting application..."
exec node server.js
