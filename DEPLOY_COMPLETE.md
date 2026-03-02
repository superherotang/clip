# Docker 部署最终指南

## ⚠️ 重要提示

**必须在有 Docker 的环境中运行**

如果你在 WSL 中且 Docker 不可用，请使用本地部署方式。

## 本地部署（无需 Docker）

```bash
cd /home/tang/clip

# 1. 安装依赖
pnpm install

# 2. 初始化数据库
pnpm prisma migrate dev

# 3. 启动开发服务器
pnpm dev

# 访问 http://localhost:7707
```

## Docker 部署（推荐生产环境）

### 前提条件

- Docker 已安装
- Docker Compose 已安装
- 有 Docker 环境权限

### 部署步骤

```bash
cd /home/tang/clip

# 1. 设置环境变量
export JWT_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# 2. 停止旧容器（如果有）
docker-compose down

# 3. 删除旧卷（可选，会删除数据）
docker volume rm clipboard_clipboard-data
docker volume rm clipboard_clipboard-uploads

# 4. 重新构建并启动
docker-compose up -d --build --force-recreate --no-cache

# 5. 等待 15 秒
sleep 15

# 6. 查看日志
docker-compose logs -f app
```

### 如果看到 "no such table" 错误

进入容器运行迁移：

```bash
docker-compose exec app npx prisma migrate deploy
```

### 访问

http://localhost:7707

## Docker 配置说明

### docker-compose.yml

使用 Docker 卷管理数据：
```yaml
volumes:
  - clipboard-data:/app/data        # 数据库文件
  - clipboard-uploads:/app/public/uploads  # 上传文件
```

### Dockerfile

- 基于 Node 20 Alpine
- 构建时生成 Prisma Client
- 运行时自动执行数据库迁移
- 使用 nextjs 用户运行应用

### docker-entrypoint.sh

启动时自动运行：
```bash
npx prisma migrate deploy
node server.js
```

## 常用命令

```bash
# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 进入容器
docker-compose exec app sh

# 重启
docker-compose restart

# 停止
docker-compose down

# 删除卷（会丢失数据！）
docker-compose down -v

# 查看数据库文件
docker-compose exec app ls -la /app/data/

# 运行数据库迁移
docker-compose exec app npx prisma migrate deploy
```

## 故障排查

### 1. 数据库只读错误

```bash
# 停止容器
docker-compose down

# 重新构建（会重置权限）
docker-compose up -d --build --force-recreate
```

### 2. no such table 错误

```bash
# 进入容器
docker-compose exec app sh

# 运行迁移
npx prisma migrate deploy
exit

# 重启容器
docker-compose restart
```

### 3. 容器无法启动

```bash
# 查看详细日志
docker-compose logs app

# 检查端口占用
netstat -tlnp | grep 7707

# 删除容器重新构建
docker-compose down
docker-compose up -d --build
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

## 本地测试

如果 Docker 不可用，使用本地部署：

```bash
cd /home/tang/clip

# 初始化数据库
pnpm prisma migrate dev

# 启动开发服务器
pnpm dev

# 访问 http://localhost:7707
```

## 完成验证

部署完成后，测试注册功能：

```bash
curl -X POST http://localhost:7707/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123456"}'
```

应该返回：
```json
{
  "user": {"id": "...", "username": "testuser"},
  "apiKey": "...",
  "message": "User created successfully"
}
```
