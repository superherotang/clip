# Clipboard - 网络剪切板系统

一个功能强大的网络剪切板应用，支持多房间、实时同步和端到端加密。

## ✨ 功能特性

- 🔒 **端到端加密** - 所有剪贴板内容都经过加密存储
- 🏠 **房间管理** - 创建和管理多个剪切板房间
- 🔑 **API 密钥认证** - 支持 API 密钥访问，方便第三方集成
- 📱 **响应式设计** - 完美支持桌面和移动设备
- 👥 **多用户支持** - 用户注册、登录和权限管理
- ⚙️ **系统设置** - 管理员可配置系统参数（注册开关、用户限制等）
- 🌍 **多语言支持** - 支持中文和英文界面

## 🛠 技术栈

- **前端**: Next.js 16 (App Router)、React、Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (Prisma ORM)
- **认证**: JWT (jose)、bcryptjs
- **部署**: Docker、Docker Compose

## 📦 本地开发

### 环境要求

- Node.js 20+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 配置以下变量：

```env
# 数据库路径（本地开发）
DATABASE_URL="file:./prisma/dev.db"

# JWT 密钥（生产环境请修改）
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# 加密密钥（生产环境请修改）
ENCRYPTION_KEY="your-super-secret-encryption-key-change-in-production"

# 环境变量
NODE_ENV="development"

# 服务端口
PORT="7707"
HOSTNAME="localhost"
```

### 初始化数据库

```bash
# 生成 Prisma Client
pnpm prisma generate

# 运行数据库迁移
pnpm prisma migrate dev

# （可选）初始化默认数据
node scripts/init-db.js
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:7707

### 首次运行

首次访问时，系统会自动跳转到设置页面创建管理员账号。

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 构建并启动
docker-compose up --build

# 后台运行
docker-compose up --build -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v
```

### 环境变量配置

在 `docker-compose.yml` 中配置环境变量：

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=file:/app/data/dev.db
  - JWT_SECRET=${JWT_SECRET:-change-this-to-a-random-string-in-production}
  - ENCRYPTION_KEY=${ENCRYPTION_KEY:-change-this-to-a-random-string-in-production}
```

生产环境部署前，请务必修改 `JWT_SECRET` 和 `ENCRYPTION_KEY`！

### 访问应用

服务启动后访问：http://localhost:7707

### 数据持久化

Docker Compose 会自动创建以下卷来持久化数据：

- `clipboard-data`: 数据库文件
- `clipboard-uploads`: 上传的文件

## ⚙️ 管理员功能

登录后，管理员可以访问以下功能：

### 系统设置

访问 `/admin/settings` 可配置：

- **允许新用户注册** - 开关控制是否允许用户自主注册
- **站点名称** - 自定义站点名称
- **站点描述** - 添加站点说明
- **每用户最大房间数** - 限制单个用户可创建的房间数量
- **每用户最大剪贴项数** - 限制单个用户的剪贴板项目数量

## 🔌 API 文档

API 文档可在应用内查看：

访问 http://localhost:7707/api-docs

### 主要 API 端点

#### 认证

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/signup` - 用户注册
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息
- `GET /api/auth/api-key` - 获取 API 密钥

#### 外部 API（需要 API 密钥）

- `GET /api/external/rooms` - 获取用户的房间列表
- `GET /api/external/clipboard` - 获取剪贴板项目
- `POST /api/external/clipboard` - 创建剪贴板项目

API 请求示例：

```bash
# 登录获取 API 密钥
curl -X POST http://localhost:7707/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'

# 使用 API 密钥获取房间列表
curl http://localhost:7707/api/external/rooms \
  -H "X-API-Key: your_api_key_here"

# 创建剪贴板项目
curl -X POST http://localhost:7707/api/external/clipboard \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "roomId": "room_id",
    "type": "text",
    "content": "Hello, World!",
    "title": "My Clipboard Item"
  }'
```

## 📁 项目结构

```
clip/
├── prisma/
│   ├── schema.prisma          # 数据库模型定义
│   └── migrations/            # 数据库迁移文件
├── scripts/
│   ├── init-db.js             # 数据库初始化脚本
│   └── fix-system-settings.js # 数据库修复脚本
├── src/
│   ├── app/                   # Next.js App Router 页面
│   │   ├── api/              # API 路由
│   │   ├── admin/            # 管理员页面
│   │   ├── setup/            # 初始设置页面
│   │   └── ...
│   ├── components/           # React 组件
│   │   ├── admin/            # 管理员组件
│   │   ├── auth/             # 认证组件
│   │   ├── ui/               # UI 基础组件
│   │   └── ...
│   └── lib/                  # 工具库
│       ├── auth.ts           # 认证和权限
│       ├── prisma.ts         # Prisma 客户端
│       └── encryption.ts     # 加密工具
├── public/                   # 静态资源
├── docker-compose.yml        # Docker Compose 配置
├── Dockerfile               # Docker 镜像构建
├── docker-entrypoint.sh     # Docker 容器启动脚本
└── package.json             # 项目依赖
```

## 🔐 安全建议

1. **修改默认密钥** - 生产环境必须修改 `JWT_SECRET` 和 `ENCRYPTION_KEY`
2. **使用强密码** - 管理员账号应使用强密码
3. **HTTPS** - 生产环境建议使用 HTTPS
4. **定期备份** - 定期备份 SQLite 数据库文件
5. **限制访问** - 使用防火墙限制对应用端口的访问

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
