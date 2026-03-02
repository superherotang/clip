# Docker 部署说明

## 快速部署

```bash
# 一键部署
./deploy.sh
```

## 手动部署

```bash
# 1. 设置环境变量
export JWT_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# 2. 创建必要目录并设置权限
mkdir -p ./data ./public/uploads
chmod -R 755 ./data ./public/uploads

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

# 修复权限问题
docker-compose exec app chown -R nextjs:nodejs /app/data
```

## 数据持久化

数据存储在：
- `./data/dev.db` - 数据库文件
- `./public/uploads/` - 上传的文件

## 首次使用

启动容器后，访问 http://localhost:7707 注册账号即可开始使用。

## 常见问题

### 数据库只读错误

如果看到 `SQLITE_READONLY` 错误，执行：

```bash
# 停止容器
docker-compose down

# 修复宿主机目录权限
chmod -R 755 ./data ./public/uploads

# 重新启动
docker-compose up -d
```

### 权限拒绝

```bash
# 进入容器修复权限
docker-compose exec app chown -R nextjs:nodejs /app/data /app/public/uploads
```
