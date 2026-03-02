# 网络剪切板 - Docker 部署

## 快速部署

```bash
cd /home/tang/clip

# 设置环境变量
export JWT_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# 停止旧容器并删除卷
docker-compose down
docker volume rm clipboard_clipboard-data
docker volume rm clipboard_clipboard-uploads

# 重新构建并启动
docker-compose up -d --build --force-recreate --no-cache

# 查看日志
docker-compose logs -f app
```

## 访问

http://localhost:7707

## 常用命令

```bash
# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 重启
docker-compose restart

# 停止
docker-compose down

# 进入容器
docker-compose exec app sh
```
