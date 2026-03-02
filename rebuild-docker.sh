#!/bin/bash
# 清理并重新构建 Docker 容器

cd /home/tang/clip

# 停止并删除容器
docker-compose down

# 删除旧的数据卷（可选，如果需要保留数据请注释掉这行）
docker volume rm clipboard_clipboard-data

# 设置环境变量
export JWT_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# 重新构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f app
