#!/bin/sh

# 确保数据目录存在
mkdir -p /app/data
mkdir -p /app/public/uploads

# 使用 npx 运行 Prisma（因为 pnpm 可能不可用）
echo "Running Prisma migrations..."
npx prisma migrate deploy 2>/dev/null || true
npx prisma generate 2>/dev/null || true

# 启动应用
echo "Starting application..."
exec node server.js
