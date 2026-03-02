# 网络剪切板 - Docker 部署

## 一键部署

```bash
./deploy.sh
```

## 手动部署

```bash
cd /home/tang/clip

# 设置环境变量
export JWT_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# 停止并清理
docker-compose down
docker volume rm clipboard_clipboard-data

# 重新构建启动
docker-compose up -d --build --force-recreate --no-cache

# 查看日志
docker-compose logs -f app
```

## 访问

http://localhost:7707

## 关键修复

1. **全局安装 Prisma** - 在 Dockerfile 中运行 `pnpm add -g prisma`
2. **启动时迁移** - `docker-entrypoint.sh` 中运行 `prisma migrate deploy`
3. **权限设置** - 在 Dockerfile 中设置正确的目录权限

## 常用命令

```bash
docker-compose ps              # 查看状态
docker-compose logs -f app     # 查看日志
docker-compose exec app sh     # 进入容器
docker-compose restart         # 重启
docker-compose down            # 停止
```
