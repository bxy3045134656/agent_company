# Agent 公司 - 系统架构设计

## 🏗️ 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                    前端层 (Frontend)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  首页展示   │  │  Agent 面板  │  │  项目管理   │     │
│  │  index.html │  │  dashboard  │  │  projects   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                          ↕ WebSocket/HTTP
┌─────────────────────────────────────────────────────────┐
│                    后端层 (Backend)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │              API Gateway (Express)               │   │
│  │  /api/agents  /api/tasks  /api/projects  /chat  │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Agent 管理器 │  │ 任务调度器  │  │ 项目仓库    │     │
│  │ AgentMgr    │  │ Scheduler   │  │ Repo        │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                   Agent 通信层                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Message Bus (发布/订阅模式)              │   │
│  │  topics: agent.*, task.*, project.*, chat.*    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    数据层 (Data)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  SQLite     │  │  JSON 文件   │  │  日志文件   │     │
│  │  (用户/项目) │  │ (Agent 配置) │  │  (logs/)    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 技术栈选型

### 前端
| 模块 | 技术 | 说明 |
|------|------|------|
| 核心 | 原生 HTML/CSS/JS | 轻量级，易维护 |
| UI 框架 | 可选 Vue3 | 后期复杂时可引入 |
| 实时通信 | WebSocket | Agent 对话实时更新 |
| 图表 | Chart.js | 数据统计展示 |
| 图标 | Emoji + CSS | 简单可爱 |

### 后端
| 模块 | 技术 | 说明 |
|------|------|------|
| 运行时 | Node.js 24+ | 与 OpenClaw 一致 |
| Web 框架 | Express 4.x | 轻量灵活 |
| WebSocket | ws | 实时双向通信 |
| 数据库 | SQLite3 | 轻量级，单文件 |
| ORM | better-sqlite3 | 同步 API，简单 |
| 日志 | winston | 结构化日志 |

### Agent 通信
| 模块 | 技术 | 说明 |
|------|------|------|
| 消息总线 | 内存事件总线 | 轻量级 EventEmitter |
| 持久化 | Redis (可选) | 后期扩展用 |
| 协议 | JSON-RPC 2.0 | 标准化 RPC 调用 |

---

## 📁 项目目录结构

```
agent-company/
├── backend/
│   ├── src/
│   │   ├── index.js              # 入口文件
│   │   ├── config.js             # 配置管理
│   │   ├── server.js             # Express 服务器
│   │   ├── websocket.js          # WebSocket 服务
│   │   │
│   │   ├── agents/
│   │   │   ├── AgentBase.js      # Agent 基类
│   │   │   ├── BossAgent.js      # BOSS Agent
│   │   │   ├── AnalystAgent.js   # 需求分析 Agent
│   │   │   ├── DevAgent.js       # 开发 Agent
│   │   │   ├── TestAgent.js      # 测试 Agent
│   │   │   └── OpsAgent.js       # 运营 Agent
│   │   │
│   │   ├── services/
│   │   │   ├── AgentManager.js   # Agent 生命周期管理
│   │   │   ├── TaskScheduler.js  # 任务调度
│   │   │   ├── MessageBus.js     # 消息总线
│   │   │   └── ProjectRepo.js    # 项目管理
│   │   │
│   │   ├── routes/
│   │   │   ├── agents.js         # /api/agents
│   │   │   ├── tasks.js          # /api/tasks
│   │   │   ├── projects.js       # /api/projects
│   │   │   └── chat.js           # /api/chat
│   │   │
│   │   ├── db/
│   │   │   ├── database.js       # 数据库连接
│   │   │   ├── models/
│   │   │   │   ├── User.js       # 用户模型
│   │   │   │   ├── Project.js    # 项目模型
│   │   │   │   └── Task.js       # 任务模型
│   │   │   └── migrations/       # 数据库迁移
│   │   │
│   │   └── utils/
│   │       ├── logger.js         # 日志工具
│   │       ├── helpers.js        # 辅助函数
│   │       └── constants.js      # 常量定义
│   │
│   ├── data/
│   │   ├── agents.json           # Agent 配置
│   │   ├── database.sqlite       # SQLite 数据库
│   │   └── projects/             # 项目文件存储
│   │
│   ├── logs/                     # 日志文件
│   ├── package.json
│   └── .env                      # 环境变量
│
├── frontend/
│   ├── public/
│   │   ├── index.html            # 首页
│   │   ├── dashboard.html        # 控制面板
│   │   ├── projects.html         # 项目市场
│   │   ├── css/
│   │   │   ├── main.css          # 主样式
│   │   │   ├── agents.css        # Agent 样式
│   │   │   └── projects.css      # 项目样式
│   │   └── js/
│   │       ├── app.js            # 主应用
│   │       ├── agents.js         # Agent 模块
│   │       ├── chat.js           # 聊天模块
│   │       └── projects.js       # 项目模块
│   │
│   └── src/                      # 可选：Vue 源码
│       ├── App.vue
│       └── components/
│
├── shared/
│   ├── protocols/
│   │   ├── agent-messages.json   # Agent 消息协议
│   │   └── task-schema.json      # 任务数据结构
│   │
│   └── constants.js              # 前后端共享常量
│
├── docs/
│   ├── API.md                    # API 文档
│   ├── ARCHITECTURE.md           # 架构文档（本文件）
│   └── DEPLOYMENT.md             # 部署指南
│
├── tests/
│   ├── unit/                     # 单元测试
│   └── integration/              # 集成测试
│
├── PROGRESS.md                   # 项目进度
├── CODE_STYLE.md                 # 代码规范
└── README.md                     # 项目说明
```

---

## 🤖 Agent 详细设计

### Agent 基类结构

```javascript
// AgentBase.js
class AgentBase {
  constructor(config) {
    this.id = config.id;           // agent_analyst
    this.name = config.name;       // 小析
    this.role = config.role;       // 需求分析
    this.avatar = config.avatar;   // 📋
    this.status = 'free';          // free|working|busy|rest
    this.skills = config.skills;   // ['requirement_analysis', ...]
    
    this.messageBus = null;        // 消息总线引用
    this.currentTask = null;       // 当前任务
  }

  // 生命周期
  async initialize() {}
  async processTask(task) {}
  async collaborate(message) {}
  async shutdown() {}

  // 状态管理
  setStatus(status) { /* 更新状态并发布事件 */ }
  getStatus() { return this.status; }

  // 通信
  sendMessage(topic, message) { /* 发布消息 */ }
  onMessage(topic, handler) { /* 订阅消息 */ }
}
```

### 5 个 Agent 职责

| Agent | 职责 | 技能 | 输入 | 输出 |
|-------|------|------|------|------|
| **🎯 BOSS** | 决策、分配、协调 | 任务分解、资源调度、优先级判断 | 用户需求 | 任务分配方案 |
| **📋 分析师** | 需求理解、拆解 | 语义分析、功能拆解、风险评估 | 原始需求 | 需求文档 + 任务列表 |
| **💻 开发者** | 代码实现 | 代码生成、文件操作、调试 | 任务描述 | 代码文件 + 说明 |
| **🧪 测试员** | 质量保障 | 单元测试、集成测试、Bug 报告 | 代码 + 需求 | 测试报告 + Bug 列表 |
| **📢 运营员** | 发布推广 | 文档编写、SEO、社交媒体 | 完成项目 | 项目页面 + 推广文案 |

---

## 💬 Agent 通信协议

### 消息格式（JSON-RPC 2.0 风格）

```json
{
  "jsonrpc": "2.0",
  "id": "msg_123456",
  "timestamp": 1773113859844,
  "from": "agent_boss",
  "to": "agent_analyst",
  "topic": "task.assign",
  "message": {
    "type": "task_assignment",
    "taskId": "task_001",
    "priority": "high",
    "deadline": 1773120000000,
    "content": {
      "title": "分析用户需求",
      "description": "用户想要一个论坛系统...",
      "requirements": ["功能 1", "功能 2"]
    }
  },
  "metadata": {
    "conversationId": "conv_001",
    "inReplyTo": null
  }
}
```

### 消息主题（Topics）

```
agent.*           # Agent 相关事件
  - agent.status.changed    # 状态变化
  - agent.task.started      # 开始任务
  - agent.task.completed    # 完成任务

task.*            # 任务相关事件
  - task.created            # 任务创建
  - task.assigned           # 任务分配
  - task.progress           # 进度更新
  - task.completed          # 任务完成
  - task.failed             # 任务失败

project.*         # 项目相关事件
  - project.created         # 项目创建
  - project.updated         # 项目更新
  - project.published       # 项目发布

chat.*            # 聊天消息
  - chat.message            # 普通消息
  - chat.mention            # 被提及
```

### 典型通信流程

```
1. 用户提交需求
   ↓
2. BOSS 接收 → 分解任务 → 发布 task.assigned
   ↓
3. 分析师订阅 → 接收任务 → 分析需求 → 发布 task.completed
   ↓
4. BOSS 接收完成 → 分配开发任务
   ↓
5. 开发者订阅 → 接收任务 → 编写代码 → 发布 task.completed
   ↓
6. BOSS 接收 → 分配测试任务
   ↓
7. 测试员订阅 → 测试 → 发布测试报告
   ↓
8. BOSS 接收 → 分配运营任务
   ↓
9. 运营员订阅 → 编写文档 → 发布项目
   ↓
10. 项目上线！🎉
```

---

## 🔌 API 接口设计

### RESTful API

#### Agent 相关
```
GET    /api/agents              # 获取所有 Agent
GET    /api/agents/:id          # 获取单个 Agent
GET    /api/agents/:id/status   # 获取状态
PUT    /api/agents/:id/status   # 更新状态
GET    /api/agents/:id/tasks    # 获取任务列表
```

#### 任务相关
```
GET    /api/tasks               # 获取任务列表
POST   /api/tasks               # 创建任务
GET    /api/tasks/:id           # 获取任务详情
PUT    /api/tasks/:id           # 更新任务
DELETE /api/tasks/:id           # 删除任务
POST   /api/tasks/:id/assign    # 分配任务
POST   /api/tasks/:id/complete  # 完成任务
```

#### 项目相关
```
GET    /api/projects            # 获取项目列表
POST   /api/projects            # 创建项目
GET    /api/projects/:id        # 获取项目详情
PUT    /api/projects/:id        # 更新项目
DELETE /api/projects/:id        # 删除项目
POST   /api/projects/:id/publish # 发布项目
GET    /api/projects/:id/download # 下载项目
```

#### 聊天相关
```
GET    /api/chat/history        # 获取聊天记录
POST   /api/chat/message        # 发送消息
WS     /ws/chat                 # WebSocket 实时聊天
```

---

## 🗄️ 数据库设计

### 用户表 (users)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT,
  points INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 项目表 (projects)
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER,
  status TEXT DEFAULT 'draft',  -- draft|published|archived
  price_type TEXT DEFAULT 'free',  -- free|paid
  price_points INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### 任务表 (tasks)
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  project_id INTEGER,
  assigned_to TEXT,  -- Agent ID
  status TEXT DEFAULT 'pending',  -- pending|in_progress|completed|failed
  priority TEXT DEFAULT 'normal',  -- low|normal|high|urgent
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### 聊天记录表 (chat_messages)
```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id TEXT NOT NULL,  -- Agent ID 或 user_id
  content TEXT NOT NULL,
  conversation_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 安全设计

### 认证机制
- JWT Token 认证
- API Key（Agent 间通信）
- Session 管理（用户登录）

### 权限控制
- 用户只能管理自己的项目
- Agent 只能执行分配的任务
- 敏感操作需要权限验证

### 数据验证
- 所有输入数据验证
- SQL 注入防护（参数化查询）
- XSS 防护（输出转义）

---

## 🚀 部署方案

### 开发环境
```bash
# 启动后端
cd backend
npm install
npm run dev

# 前端直接打开 HTML 文件或
npm install -g serve
serve frontend/public
```

### 生产环境
```bash
# 使用 PM2 管理
pm2 start backend/src/index.js --name agent-company

# Nginx 反向代理
server {
  listen 80;
  server_name agent-company.local;
  
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
  }
}
```

---

## 📊 性能优化

### 前端
- 静态资源 CDN
- 图片懒加载
- 虚拟滚动（长列表）
- WebSocket 连接复用

### 后端
- 数据库连接池
- 查询结果缓存
- 异步任务队列
- 日志异步写入

### Agent
- 任务并发控制
- 消息队列限流
- 超时重试机制

---

## 🧪 测试策略

### 单元测试
- Agent 逻辑测试
- 服务层测试
- 工具函数测试

### 集成测试
- API 接口测试
- 数据库操作测试
- WebSocket 通信测试

### E2E 测试
- 完整任务流程
- 多 Agent 协作
- 用户交互流程

---

## 📈 扩展计划

### Phase 1 (MVP)
- ✅ 基础架构
- ✅ 5 个 Agent
- ✅ 任务系统
- ⬜ 项目管理

### Phase 2 (增强)
- ⬜ 用户系统
- ⬜ 积分经济
- ⬜ 实时聊天
- ⬜ 数据可视化

### Phase 3 (智能)
- ⬜ AI 模型集成
- ⬜ 自主学习
- ⬜ 智能推荐
- ⬜ 多语言支持

---

*最后更新：2026-03-10*
