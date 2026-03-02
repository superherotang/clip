# Docker 部署最终修复版

## 问题根源

Prisma 在构建时硬编码了数据库路径，导致在 Docker 容器中使用相对路径 `./prisma/dev.db` 而不是绝对路径。

## 解决方案

### 方案 A：使用 Docker 卷映射（推荐）

数据库文件存储在容器中，通过卷持久化：

```bash
cd /home/tang/clip

# 设置环境变量
export JWT_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# 停止旧容器
docker-compose down

# 删除旧卷（可选，会删除数据）
docker volume rm clipboard_clipboard-data

# 重新构建启动
docker-compose up -d --build --no-cache

# 查看日志
docker-compose logs -f app
```

### 方案 B：使用宿主机目录挂载

数据库文件存储在宿主机上，更容易调试：

修改 `docker-compose.yml`：

```yaml
volumes:
  - ./prisma:/app/prisma      # 映射 prisma 目录
  - ./data:/app/data          # 映射数据目录
  - ./public/uploads:/app/public/uploads
```

## 验证修复

```bash
# 进入容器
docker-compose exec app sh

# 检查数据库文件
ls -la /app/data/

# 检查环境变量
env | grep DATABASE_URL

# 测试 API
wget -qO- http://localhost:3000/api/auth/me
```

## 本地测试

在本地环境中测试（不使用 Docker）：

```bash
cd /home/tang/clip

# 设置环境变量
export DATABASE_URL="file:$(pwd)/prisma/dev.db"

# 运行
pnpm dev
```

访问 http://localhost:7707

## 常见问题

### 1. 数据库连接失败

检查数据库文件路径：
```bash
docker exec clipboard-app ls -la /app/data/
```

### 2. 权限问题

确保容器内用户有权限访问数据目录：
```bash
docker exec clipboard-app chown -R nextjs:nodejs /app/data
```

### 3. 迁移失败

手动运行迁移：
```bash
docker exec clipboard-app npx prisma migrate deploy
```
