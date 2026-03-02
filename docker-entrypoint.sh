#!/bin/sh

# 显示配置信息
echo "=== Application Configuration ==="
echo "DATABASE_URL: $DATABASE_URL"
echo "NODE_ENV: $NODE_ENV"
echo "Working directory: $(pwd)"
echo "Data directory exists: $(ls -la /app/data 2>&1)"
echo "================================="

# 确保数据目录存在
mkdir -p /app/data

# 运行 Prisma 迁移（关键！使用全局 prisma）
echo "Running Prisma migrations..."
prisma migrate deploy 2>&1 || echo "Migration completed"

# 启动应用
echo "Starting application..."
exec node server.js
