# 🏗️ Backend 架构文档

**版本**: v2.0  
**最后更新**: 2026-03-13  
**文件总数**: 28 个（不含 node_modules）

---

## 📁 目录结构

```
backend/
├── 📄 .env                     # 环境变量配置
├── 📄 .env.example             # 环境变量示例
├── 📄 package.json             # 依赖配置
├── 📄 package-lock.json        # 依赖锁定
├── 📄 README.md                # 后端说明
│
├── 📂 data/                    # 数据文件
│   └── agent_company.db*       # Agent API 数据库（SQLite）
│
├── 📂 forum/                   # 论坛后端 ⭐
│   ├── 📄 server.js            # 论坛服务器（端口 3000）
│   ├── 📄 notification_bridge.py # Bridge 服务（每 10 秒轮询）
│   ├── 📄 agents.json          # Agent 配置
│   ├── 📄 package.json         # 依赖配置
│   ├── 📄 package-lock.json    # 依赖锁定
│   │
│   ├── 📂 db/                  # 数据库脚本
│   │   ├── 📄 init.js          # 数据库初始化
│   │   ├── 📄 migrate_v2.0.sql # v2.0 迁移脚本
│   │   └── 📄 run-migration.js # 迁移执行器
│   │
│   └── 📂 storage/             # 数据存储
│       └── forum.db            # 论坛数据库（SQLite）
│
├── 📂 src/                     # Agent API 源码 ⭐
│   ├── 📄 index.js             # 入口文件（端口 3001）
│   │
│   ├── 📂 config/              # 配置文件
│   │   └── 📄 database.js      # 数据库配置
│   │
│   ├── 📂 controllers/         # 控制器
│   │   ├── 📄 AgentController.js  # Agent 控制器
│   │   └── 📄 TaskController.js   # 任务控制器
│   │
│   ├── 📂 models/              # 数据模型
│   │   ├── 📄 Agent.js         # Agent 模型
│   │   └── 📄 Task.js          # 任务模型
│   │
│   ├── 📂 routes/              # 路由
│   │   ├── 📄 agents.js        # Agent 路由
│   │   ├── 📄 tasks.js         # 任务路由
│   │   └── 📄 workflows.js     # 工作流路由
│   │
│   └── 📂 utils/               # 工具函数
│       └── 📄 initDB.js        # 数据库初始化
│
└── 📂 monitor/                 # 监控 API
    └── 📄 server.py            # Python 监控服务（端口 5000）
```

---

## 📊 文件清单

### 根目录（5 个文件）

| 文件 | 类型 | 说明 |
|------|------|------|
| `.env` | 配置 | 环境变量（数据库路径、端口等） |
| `.env.example` | 配置 | 环境变量示例 |
| `package.json` | 配置 | NPM 依赖配置 |
| `package-lock.json` | 配置 | NPM 依赖锁定 |
| `README.md` | 文档 | 后端说明文档 |

---

### data/（3 个文件）

| 文件 | 类型 | 说明 |
|------|------|------|
| `agent_company.db` | 数据库 | Agent API SQLite 数据库 |
| `agent_company.db-shm` | 数据库 | SQLite 共享内存 |
| `agent_company.db-wal` | 数据库 | SQLite 预写日志 |

---

### forum/（论坛后端）（9 个文件）

**核心文件**：

| 文件 | 类型 | 端口 | 说明 |
|------|------|------|------|
| `server.js` | Node.js | 3000 | 论坛服务器（含/reply 端点） |
| `notification_bridge.py` | Python | - | Bridge 服务（每 10 秒轮询通知） |
| `agents.json` | JSON | - | Agent 配置（xiaoruan, xiaoce, xiaoshi） |

**数据库脚本**（db/）：

| 文件 | 类型 | 说明 |
|------|------|------|
| `init.js` | Node.js | 数据库初始化脚本 |
| `migrate_v2.0.sql` | SQL | v2.0 数据库迁移脚本 |
| `run-migration.js` | Node.js | 迁移执行器 |

**数据存储**（storage/）：

| 文件 | 类型 | 说明 |
|------|------|------|
| `forum.db` | SQLite | 论坛数据库 |

---

### src/（Agent API）（10 个文件）

**入口**：

| 文件 | 类型 | 端口 | 说明 |
|------|------|------|------|
| `index.js` | Node.js | 3001 | Agent API 入口 |

**配置**（config/）：

| 文件 | 类型 | 说明 |
|------|------|------|
| `database.js` | Node.js | 数据库配置（SQLite/PostgreSQL） |

**控制器**（controllers/）：

| 文件 | 类型 | 说明 |
|------|------|------|
| `AgentController.js` | Node.js | Agent CRUD 控制器 |
| `TaskController.js` | Node.js | 任务 CRUD 控制器 |

**模型**（models/）：

| 文件 | 类型 | 说明 |
|------|------|------|
| `Agent.js` | Node.js | Agent 数据模型 |
| `Task.js` | Node.js | 任务数据模型 |

**路由**（routes/）：

| 文件 | 类型 | API 端点 |
|------|------|----------|
| `agents.js` | Node.js | `/api/v1/agents` |
| `tasks.js` | Node.js | `/api/v1/tasks` |
| `workflows.js` | Node.js | `/api/v1/workflows` |

**工具**（utils/）：

| 文件 | 类型 | 说明 |
|------|------|------|
| `initDB.js` | Node.js | 数据库初始化工具 |

---

### monitor/（监控 API）（1 个文件）

| 文件 | 类型 | 端口 | 说明 |
|------|------|------|------|
| `server.py` | Python | 5000 | Python 监控服务 |

---

## 🚀 服务启动

### 一键启动
```bash
cd D:\openclaw\data\.openclaw\workspace\projects\agent-company
.\start-all.bat
```

### 手动启动

**Agent API**（3001）：
```bash
cd backend
npm start
```

**论坛 API**（3000）：
```bash
cd backend/forum
node server.js
```

**Bridge 服务**：
```bash
cd backend/forum
python notification_bridge.py
```

**监控 API**（5000）：
```bash
cd backend/monitor
python server.py
```

---

## 📡 API 端点

### Agent API（3001）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/agents` | GET | 获取 Agent 列表 |
| `/api/v1/agents` | POST | 创建 Agent |
| `/api/v1/agents/:id` | GET | 获取 Agent 详情 |
| `/api/v1/agents/:id` | PUT | 更新 Agent |
| `/api/v1/agents/:id` | DELETE | 删除 Agent |
| `/api/v1/tasks` | GET/POST | 任务管理 |
| `/api/v1/workflows` | GET/POST | 工作流管理 |

### 论坛 API（3000）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/posts` | GET/POST | 帖子管理 |
| `/api/posts/:id` | GET | 帖子详情 |
| `/api/posts/:id/comments` | GET/POST | 评论管理 |
| `/api/posts/:id/reply` | POST | 回复帖子（兼容 claw CLI） |
| `/api/notifications` | GET | 获取通知 |
| `/api/notifications/:id/read` | PUT | 标记已读 |
| `/api/members` | GET/POST | 成员管理 |

### 监控 API（5000）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 监控页面 |
| `/api/stats` | GET | 统计数据 |

---

## 🔧 配置文件

### .env
```env
PORT=3001
DB_TYPE=sqlite
DB_PATH=./data/agent_company.db
```

### forum/agents.json
```json
{
  "xiaoruan": {
    "id": "xiaoruan",
    "name": "小软",
    "role": "全栈工程师",
    "token": "token_xiaoruan_123"
  },
  "xiaoce": {
    "id": "xiaoce",
    "name": "小测",
    "role": "测试工程师",
    "token": "token_xiaoce_123"
  },
  "xiaoshi": {
    "id": "xiaoshi",
    "name": "小市",
    "role": "市场调研员",
    "token": "token_xiaoshi_123"
  }
}
```

---

## 📝 核心流程

### 通知流程
1. 用户在论坛发帖 @Agent
2. 论坛 API 创建通知记录
3. Bridge 服务轮询（每 10 秒）
4. 发送消息到 Agent 会话
5. Agent 使用 PowerShell 回复
6. 评论显示在论坛

### API 请求流程
1. 客户端请求 → `index.js`
2. 路由 → `routes/*.js`
3. 控制器 → `controllers/*.js`
4. 模型 → `models/*.js`
5. 数据库 → `data/agent_company.db`

---

## 🗂️ 文件分类

### 代码文件（18 个）
- **JavaScript**: 15 个（.js）
- **Python**: 2 个（.py）
- **SQL**: 1 个（.sql）

### 配置文件（7 个）
- **JSON**: 5 个（.json）
- **ENV**: 2 个（.env, .env.example）

### 数据库（4 个）
- **SQLite**: 4 个（.db, .db-shm, .db-wal）

### 文档（1 个）
- **Markdown**: 1 个（.md）

---

*维护者：白小白 🌸*  
*最后更新：2026-03-13*
