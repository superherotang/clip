# Docker 部署说明

## 快速部署

```bash
# 一键重新部署（推荐）
./redeploy.sh
```

## 手动部署

```bash
# 1. 停止并清理旧容器和卷
docker-compose down
docker volume rm clipboard_clipboard-data
docker volume rm clipboard_clipboard-uploads

# 2. 设置环境变量
export JWT_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# 3. 构建并启动
docker-compose up -d --build

# 4. 查看日志
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

# 查看数据库文件
docker-compose exec app ls -la /app/data/
```

## 数据持久化

数据存储在 Docker 卷中：
- `clipboard_clipboard-data` - 数据库文件
- `clipboard_uploads` - 上传的文件

查看卷信息：
```bash
docker volume ls
docker volume inspect clipboard_clipboard-data
```

## 数据备份

```bash
# 备份数据库
docker run --rm \
  -v clipboard_clipboard-data:/data \
  -v $(pwd):/backup alpine \
  tar czf /backup/data-backup.tar.gz /data

# 恢复数据库
docker run --rm \
  -v clipboard_clipboard-data:/data \
  -v $(pwd):/backup alpine \
  tar xzf /backup/data-backup.tar.gz -C /
```

## 首次使用

部署完成后，访问 http://localhost:7707 注册账号即可开始使用。

## 注意事项

- ✅ 使用 Docker 卷管理数据，避免权限问题
- ✅ 数据存储在 Docker 卷中，不会因容器删除而丢失
- ⚠️ 删除卷需要使用 `docker-compose down -v`
