# Docker 快速部署指南

## 问题修复

已修复的问题：
1. ✅ 数据库路径问题：使用绝对路径 `/app/data/dev.db`
2. ✅ 端口映射：`7707:3000`（外部 7707 -> 容器内部 3000）
3. ✅ 构建时环境变量：在 Dockerfile 中设置 `DATABASE_URL`
4. ✅ 入口脚本：自动创建目录并运行迁移

## 快速开始

### 方法一：使用重建脚本（推荐）

```bash
cd /home/tang/clip

# 执行重建脚本
./rebuild-docker.sh
```

### 方法二：手动执行

```bash
cd /home/tang/clip

# 1. 设置环境变量
export JWT_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# 2. 清理旧的容器和卷
docker-compose down
docker volume rm clipboard_clipboard-data  # 可选：删除旧数据

# 3. 重新构建并启动
docker-compose up -d --build

# 4. 查看日志
docker-compose logs -f app
```

## 访问应用

打开浏览器访问：**http://localhost:7707**

## 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 进入容器
docker-compose exec app sh

# 重启容器
docker-compose restart

# 停止容器
docker-compose down

# 查看数据库文件
docker exec clipboard-app ls -la /app/data/
```

## 故障排查

### 1. 数据库连接错误

如果仍然看到数据库连接错误，检查：

```bash
# 查看容器内是否有数据目录
docker exec clipboard-app ls -la /app/data/

# 查看环境变量
docker exec clipboard-app env | grep DATABASE_URL
```

### 2. 容器无法启动

```bash
# 查看详细日志
docker-compose logs app

# 检查端口是否被占用
netstat -tlnp | grep 7707
```

### 3. 权限问题

```bash
# 删除卷重新创建
docker-compose down -v
docker-compose up -d --build
```

## 数据持久化

数据存储在 Docker 卷中：
- `clipboard_clipboard-data`: 数据库文件
- `clipboard_uploads`: 上传的文件

查看卷信息：
```bash
docker volume ls
docker volume inspect clipboard_clipboard-data
```

备份数据：
```bash
# 备份数据库
docker cp clipboard-app:/app/data/dev.db ./backup-dev.db

# 备份上传文件
docker cp clipboard-app:/app/public/uploads ./backup-uploads
```

## 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并重启
docker-compose down
docker-compose up -d --build

# 查看日志
docker-compose logs -f app
```
