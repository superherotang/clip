# Docker 部署指南

## 快速开始

### 1. 构建并启动

```bash
# 构建并启动容器
docker-compose up -d --build

# 查看日志
docker-compose logs -f app
```

### 2. 初始化数据库

首次启动后需要初始化数据库：

```bash
# 进入容器
docker-compose exec app sh

# 运行 Prisma 迁移
pnpm prisma migrate deploy
pnpm prisma generate

# 退出容器
exit
```

### 3. 访问应用

打开浏览器访问：http://localhost:3000

## 环境变量

可以通过 `.env` 文件或直接设置环境变量：

```bash
# 创建 .env 文件
cat > .env << EOF
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=your-super-secret-encryption-key-change-in-production
EOF

# 启动
docker-compose up -d
```

## 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 重启容器
docker-compose restart

# 停止容器
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v

# 进入容器
docker-compose exec app sh

# 运行数据库迁移
docker-compose exec app pnpm prisma migrate deploy

# 查看数据库
docker-compose exec app pnpm prisma studio
```

## 数据持久化

数据存储在两个 Docker 卷中：

- `clipboard-data`: 数据库文件
- `clipboard-uploads`: 上传的文件

查看卷位置：
```bash
docker volume ls
docker volume inspect clipboard-data
```

## 备份

### 备份数据库

```bash
# 复制数据库文件
docker cp clipboard-app:/app/data/dev.db ./backup-dev.db
```

### 备份上传的文件

```bash
# 复制上传目录
docker cp clipboard-app:/app/public/uploads ./backup-uploads
```

## 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并重启
docker-compose up -d --build

# 运行数据库迁移
docker-compose exec app pnpm prisma migrate deploy
```

## 健康检查

容器配置了健康检查，可以查看状态：

```bash
docker inspect --format='{{.State.Health.Status}}' clipboard-app
```

## 故障排除

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs app
```

### 数据库错误

```bash
# 进入容器
docker-compose exec app sh

# 检查数据库
ls -la /app/data/

# 重新运行迁移
pnpm prisma migrate deploy
```

### 权限问题

如果遇到权限问题，可以删除卷重新创建：

```bash
docker-compose down -v
docker-compose up -d --build
```

## 生产环境建议

1. **修改密钥**：务必修改 `JWT_SECRET` 和 `ENCRYPTION_KEY`
2. **使用 HTTPS**：在生产环境使用反向代理（如 Nginx）配置 HTTPS
3. **定期备份**：定期备份数据库和上传文件
4. **监控日志**：配置日志收集和监控
5. **资源限制**：根据需要配置容器资源限制

## 使用 Nginx 反向代理（可选）

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

更新 `docker-compose.yml` 添加 Nginx 服务：

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```
