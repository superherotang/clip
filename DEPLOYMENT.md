# 网络剪切板 - 部署和使用指南

## 快速开始

### Docker 部署（推荐）

```bash
# 一键部署
./deploy.sh

# 访问
http://localhost:7707
```

### 本地开发

```bash
# 安装依赖
pnpm install

# 初始化数据库
pnpm prisma migrate dev

# 启动开发服务器
pnpm dev

# 访问
http://localhost:7707
```

## 功能特性

- ✅ 用户名 + 密码登录注册（无需邮箱）
- ✅ 房间管理（创建/加入/删除）
- ✅ 剪切板同步（文本/图片/文件）
- ✅ 内容加密存储
- ✅ 分类管理
- ✅ API 接口支持
- ✅ 响应式设计（移动端/桌面端）
- ✅ 中英文国际化

## 使用流程

### 1. 注册账号

- 访问 http://localhost:7707
- 点击"注册"
- 输入用户名（至少 3 个字符）
- 输入密码（至少 6 个字符）
- 保存 API 密钥（用于第三方访问）

### 2. 创建房间

- 登录后进入"我的房间"
- 点击"创建房间"
- 输入房间名称和描述
- 获得 6 位房间代码

### 3. 加入房间

- 点击"加入房间"
- 输入 6 位房间代码
- 即可加入共享房间

### 4. 使用剪切板

- 进入房间
- 添加文本或上传文件
- 内容自动加密保存
- 支持分类管理

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| JWT_SECRET | JWT 密钥 | 自动生成 |
| ENCRYPTION_KEY | 加密密钥 | 自动生成 |
| DATABASE_URL | 数据库路径 | file:/app/data/dev.db |
| PORT | 端口 | 7707 |

## Docker 命令

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

# 重新部署
./deploy.sh
```

## 数据备份

```bash
# 备份数据库
cp -r ./data ./data-backup

# 备份上传文件
cp -r ./public/uploads ./uploads-backup
```

## 常见问题

### 端口被占用

修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "8080:3000"  # 改为其他端口
```

### 数据丢失

数据存储在 `./data` 和 `./public/uploads` 目录，确保这些目录不被删除。

### 无法访问

1. 检查容器是否运行：`docker-compose ps`
2. 查看日志：`docker-compose logs -f app`
3. 检查端口：`netstat -tlnp | grep 7707`

## 技术栈

- **前端**: Next.js 16 + TailwindCSS 4
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma
- **认证**: JWT
- **加密**: AES (crypto-js)
