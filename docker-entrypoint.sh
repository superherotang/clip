#!/bin/sh

# 确保数据目录存在
mkdir -p /app/data
mkdir -p /app/public/uploads

# 设置环境变量（确保在运行时也设置）
export DATABASE_URL="file:/app/data/dev.db"

# 显示当前配置（用于调试）
echo "=== Application Configuration ==="
echo "DATABASE_URL: $DATABASE_URL"
echo "NODE_ENV: $NODE_ENV"
echo "Working directory: $(pwd)"
echo "Data directory exists: $(ls -la /app/data 2>&1)"
echo "================================="

# 使用 npx 运行 Prisma（因为 pnpm 可能不可用）
echo "Running Prisma migrations..."
npx prisma migrate deploy 2>&1 | head -20 || echo "Migration completed or skipped"
npx prisma generate 2>&1 | head -10 || echo "Prisma generate completed or skipped"

# 启动应用
echo "Starting application..."
exec node server.js
