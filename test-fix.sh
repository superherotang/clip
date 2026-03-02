#!/bin/bash
# 本地测试脚本 - 测试数据库路径修复

cd /home/tang/clip

echo "=== 测试数据库路径配置 ==="

# 创建测试数据目录
mkdir -p ./test-data

# 设置环境变量
export DATABASE_URL="file:./test-data/dev.db"
export NODE_ENV="development"

echo "DATABASE_URL: $DATABASE_URL"
echo "当前目录：$(pwd)"
echo "数据目录：$(ls -la ./test-data)"

# 运行 Prisma 迁移
echo "=== 运行 Prisma 迁移 ==="
pnpm prisma migrate dev --name test 2>&1 | tail -20

# 测试构建
echo "=== 测试构建 ==="
pnpm build 2>&1 | tail -30

# 清理测试数据
rm -rf ./test-data

echo "=== 测试完成 ==="
