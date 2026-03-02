#!/bin/bash

# 网络剪切板 Docker 部署脚本

set -e

cd "$(dirname "$0")"

echo "=== 网络剪切板 Docker 部署 ==="
echo ""

# 检查环境变量
if [ -z "$JWT_SECRET" ]; then
    echo "生成 JWT_SECRET..."
    export JWT_SECRET=$(openssl rand -hex 32)
fi

if [ -z "$ENCRYPTION_KEY" ]; then
    echo "生成 ENCRYPTION_KEY..."
    export ENCRYPTION_KEY=$(openssl rand -hex 32)
fi

# 创建必要目录并设置权限
echo "创建必要目录..."
mkdir -p ./data ./public/uploads
chmod -R 755 ./data ./public/uploads

# 停止旧容器
echo "停止旧容器..."
docker-compose down 2>/dev/null || true

# 构建并启动
echo "构建并启动容器..."
docker-compose up -d --build

echo ""
echo "=== 部署完成 ==="
echo ""
echo "访问地址：http://localhost:7707"
echo ""
echo "常用命令:"
echo "  docker-compose logs -f app  # 查看日志"
echo "  docker-compose down         # 停止容器"
echo "  docker-compose restart      # 重启容器"
echo ""
