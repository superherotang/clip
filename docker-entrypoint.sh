#!/bin/sh

# 等待数据库文件准备就绪
sleep 2

# 运行 Prisma 迁移
echo "Running Prisma migrations..."
pnpm prisma migrate deploy
pnpm prisma generate

# 启动应用
echo "Starting application..."
exec node server.js
