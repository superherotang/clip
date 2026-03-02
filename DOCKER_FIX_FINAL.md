# Docker 权限问题修复说明

## 问题根源

使用宿主机目录映射（`./data:/app/data`）时，Docker 会保留宿主机的权限，导致容器内 `nextjs` 用户无法写入。

## 解决方案

**使用 Docker 卷而不是宿主机目录映射**

Docker 卷会自动处理权限问题，容器内用户可以直接读写。

## 重新部署步骤

```bash
cd /home/tang/clip

# 执行重新部署脚本
./redeploy.sh
```

或手动执行：

```bash
# 1. 停止并清理
docker-compose down
docker volume rm clipboard_clipboard-data
docker volume rm clipboard_clipboard-uploads

# 2. 设置环境变量
export JWT_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# 3. 重新构建启动
docker-compose up -d --build --force-recreate

# 4. 查看日志
docker-compose logs -f app
```

## 访问

http://localhost:7707

## 数据备份

使用 Docker 卷后，数据存储在 Docker 管理的卷中：

```bash
# 查看卷
docker volume ls

# 查看卷详情
docker volume inspect clipboard_clipboard-data

# 备份数据
docker run --rm \
  -v clipboard_clipboard-data:/data \
  -v $(pwd):/backup alpine \
  tar czf /backup/data-backup.tar.gz /data
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
```

## 为什么使用 Docker 卷

| 特性 | 宿主机目录 | Docker 卷 |
|------|-----------|----------|
| 权限管理 | 复杂，需要手动设置 | 自动处理 |
| 跨平台 | 路径依赖 | 平台无关 |
| 性能 | 取决于文件系统 | 优化过 |
| 备份 | 直接复制文件 | 需要工具 |
| 调试 | 容易 | 需要进入容器 |

对于 SQLite 这种单文件数据库，Docker 卷是更好的选择。
