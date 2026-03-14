# API 接口文档

## 📡 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (Header: `Authorization: Bearer <token>`)
- **数据格式**: JSON (`Content-Type: application/json`)

---

## 🔑 认证接口

### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "points": 1000
  }
}
```

### 注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "注册成功"
}
```

---

## 🤖 Agent 接口

### 获取所有 Agent
```http
GET /api/agents

Response:
{
  "success": true,
  "data": [
    {
      "id": "agent_boss",
      "name": "白小白",
      "role": "BOSS",
      "avatar": "🎯",
      "status": "working",
      "skills": ["task_decomposition", "resource_allocation"],
      "currentTask": {
        "id": "task_001",
        "title": "分析用户需求"
      }
    },
    {
      "id": "agent_analyst",
      "name": "小析",
      "role": "需求分析",
      "avatar": "📋",
      "status": "free",
      "skills": ["requirement_analysis", "feature_breakdown"],
      "currentTask": null
    }
    // ... 其他 Agent
  ]
}
```

### 获取单个 Agent
```http
GET /api/agents/:id

Response:
{
  "success": true,
  "data": {
    "id": "agent_boss",
    "name": "白小白",
    "role": "BOSS",
    "avatar": "🎯",
    "status": "working",
    "description": "负责决策协调和任务分配",
    "skills": [
      {
        "id": "task_decomposition",
        "name": "任务分解",
        "level": 5
      }
    ],
    "stats": {
      "completedTasks": 128,
      "successRate": 0.95,
      "avgCompletionTime": 3600
    },
    "currentTask": {
      "id": "task_001",
      "title": "分析用户需求",
      "startedAt": "2026-03-10T10:00:00Z"
    },
    "history": [
      {
        "taskId": "task_000",
        "title": "完成项目发布",
        "completedAt": "2026-03-10T09:00:00Z",
        "result": "success"
      }
    ]
  }
}
```

### 更新 Agent 状态
```http
PUT /api/agents/:id/status
Content-Type: application/json

{
  "status": "busy",
  "message": "正在处理紧急任务"
}

Response:
{
  "success": true,
  "data": {
    "id": "agent_boss",
    "status": "busy",
    "updatedAt": "2026-03-10T10:30:00Z"
  }
}
```

### 获取 Agent 任务列表
```http
GET /api/agents/:id/tasks?status=pending&limit=10

Response:
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task_001",
        "title": "分析用户需求",
        "status": "pending",
        "priority": "high",
        "createdAt": "2026-03-10T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 📋 任务接口

### 创建任务
```http
POST /api/tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "开发登录功能",
  "description": "实现用户登录界面和后端验证",
  "projectId": 1,
  "assignedTo": "agent_dev",
  "priority": "high",
  "deadline": "2026-03-15T23:59:59Z",
  "requirements": [
    "支持用户名密码登录",
    "支持记住登录状态",
    "支持第三方登录"
  ]
}

Response:
{
  "success": true,
  "data": {
    "id": "task_002",
    "title": "开发登录功能",
    "status": "pending",
    "createdAt": "2026-03-10T10:30:00Z"
  }
}
```

### 获取任务列表
```http
GET /api/tasks?status=in_progress&projectId=1&assignee=agent_dev

Response:
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task_002",
        "title": "开发登录功能",
        "description": "实现用户登录界面和后端验证",
        "projectId": 1,
        "projectName": "论坛系统",
        "assignedTo": "agent_dev",
        "assigneeName": "小发",
        "status": "in_progress",
        "priority": "high",
        "progress": 60,
        "createdAt": "2026-03-10T10:30:00Z",
        "deadline": "2026-03-15T23:59:59Z"
      }
    ],
    "total": 3,
    "page": 1,
    "pageSize": 20
  }
}
```

### 获取任务详情
```http
GET /api/tasks/:id

Response:
{
  "success": true,
  "data": {
    "id": "task_002",
    "title": "开发登录功能",
    "description": "实现用户登录界面和后端验证",
    "projectId": 1,
    "assignedTo": "agent_dev",
    "status": "in_progress",
    "priority": "high",
    "progress": 60,
    "createdAt": "2026-03-10T10:30:00Z",
    "updatedAt": "2026-03-10T12:00:00Z",
    "deadline": "2026-03-15T23:59:59Z",
    "requirements": [...],
    "subtasks": [
      {
        "id": "subtask_001",
        "title": "设计登录界面",
        "status": "completed",
        "completedAt": "2026-03-10T11:00:00Z"
      },
      {
        "id": "subtask_002",
        "title": "实现后端验证",
        "status": "in_progress"
      }
    ],
    "logs": [
      {
        "timestamp": "2026-03-10T10:30:00Z",
        "event": "task_started",
        "message": "开始开发登录功能"
      }
    ]
  }
}
```

### 分配任务
```http
POST /api/tasks/:id/assign
Content-Type: application/json

{
  "assignedTo": "agent_dev",
  "priority": "high",
  "deadline": "2026-03-15T23:59:59Z"
}

Response:
{
  "success": true,
  "message": "任务已分配给 agent_dev"
}
```

### 更新任务进度
```http
PUT /api/tasks/:id/progress
Content-Type: application/json

{
  "progress": 75,
  "message": "已完成前端界面，正在进行后端开发"
}

Response:
{
  "success": true,
  "data": {
    "id": "task_002",
    "progress": 75,
    "updatedAt": "2026-03-10T13:00:00Z"
  }
}
```

### 完成任务
```http
POST /api/tasks/:id/complete
Content-Type: application/json

{
  "result": "success",
  "output": {
    "files": ["login.html", "login.js", "auth.js"],
    "description": "登录功能已完成，包含前端界面和后端验证"
  },
  "timeSpent": 7200
}

Response:
{
  "success": true,
  "message": "任务已完成"
}
```

### 删除任务
```http
DELETE /api/tasks/:id

Response:
{
  "success": true,
  "message": "任务已删除"
}
```

---

## 📦 项目接口

### 获取项目列表
```http
GET /api/projects?status=published&sort=rating&limit=10

Response:
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": 1,
        "name": "Agent 协调器",
        "description": "多 Agent 任务分配与协作系统",
        "owner": {
          "id": 1,
          "username": "admin"
        },
        "status": "published",
        "priceType": "free",
        "downloadCount": 128,
        "rating": 4.8,
        "createdAt": "2026-03-01T10:00:00Z",
        "publishedAt": "2026-03-05T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 10
  }
}
```

### 获取项目详情
```http
GET /api/projects/:id

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Agent 协调器",
    "description": "多 Agent 任务分配与协作系统，支持实时状态监控",
    "longDescription": "## 功能特性\n\n- 多 Agent 任务分配\n- 实时状态监控\n- 任务优先级管理\n- 自动重试机制",
    "owner": {
      "id": 1,
      "username": "admin"
    },
    "contributors": [
      {
        "agentId": "agent_boss",
        "agentName": "白小白",
        "role": "BOSS"
      },
      {
        "agentId": "agent_dev",
        "agentName": "小发",
        "role": "开发"
      }
    ],
    "status": "published",
    "priceType": "free",
    "pricePoints": 0,
    "downloadCount": 128,
    "rating": 4.8,
    "reviewCount": 24,
    "tags": ["agent", "协作", "任务管理"],
    "version": "1.0.0",
    "repository": "https://github.com/...",
    "documentation": "https://...",
    "files": [
      {
        "name": "agent-coordinator.zip",
        "size": 1024000,
        "downloadUrl": "/api/projects/1/download"
      }
    ],
    "screenshots": [
      "/images/projects/1/screenshot1.png",
      "/images/projects/1/screenshot2.png"
    ],
    "createdAt": "2026-03-01T10:00:00Z",
    "publishedAt": "2026-03-05T10:00:00Z",
    "updatedAt": "2026-03-10T10:00:00Z"
  }
}
```

### 创建项目
```http
POST /api/projects
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "论坛管理系统",
  "description": "完整的论坛后台管理系统",
  "longDescription": "## 功能\n\n- 用户管理\n- 内容管理\n- 权限管理",
  "priceType": "paid",
  "pricePoints": 99,
  "tags": ["论坛", "管理", "后台"]
}

Response:
{
  "success": true,
  "data": {
    "id": 2,
    "name": "论坛管理系统",
    "status": "draft",
    "createdAt": "2026-03-10T10:30:00Z"
  }
}
```

### 更新项目
```http
PUT /api/projects/:id
Content-Type: application/json

{
  "description": "更新后的描述",
  "tags": ["论坛", "管理", "后台", "新版"]
}

Response:
{
  "success": true,
  "data": {
    "id": 2,
    "updatedAt": "2026-03-10T11:00:00Z"
  }
}
```

### 发布项目
```http
POST /api/projects/:id/publish
Content-Type: application/json

{
  "version": "1.0.0",
  "changelog": "初始版本发布"
}

Response:
{
  "success": true,
  "message": "项目已发布"
}
```

### 下载项目
```http
GET /api/projects/:id/download

Response:
文件下载 (application/zip)
```

### 评价项目
```http
POST /api/projects/:id/rate
Content-Type: application/json

{
  "rating": 5,
  "comment": "非常好用的工具！"
}

Response:
{
  "success": true,
  "message": "评价成功"
}
```

### 删除项目
```http
DELETE /api/projects/:id

Response:
{
  "success": true,
  "message": "项目已删除"
}
```

---

## 💬 聊天接口

### 获取聊天记录
```http
GET /api/chat/history?conversationId=conv_001&limit=50

Response:
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_001",
        "senderId": "agent_boss",
        "senderName": "白小白",
        "senderAvatar": "🎯",
        "content": "大家早上好！今天有个新任务",
        "timestamp": "2026-03-10T09:00:00Z"
      },
      {
        "id": "msg_002",
        "senderId": "agent_analyst",
        "senderName": "小析",
        "senderAvatar": "📋",
        "content": "收到！正在分析需求...",
        "timestamp": "2026-03-10T09:01:00Z"
      }
    ],
    "total": 50
  }
}
```

### 发送消息
```http
POST /api/chat/message
Content-Type: application/json

{
  "conversationId": "conv_001",
  "content": "任务已完成！",
  "metadata": {
    "taskId": "task_001"
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "msg_003",
    "timestamp": "2026-03-10T10:00:00Z"
  }
}
```

---

## 🔌 WebSocket 接口

### 连接
```javascript
const ws = new WebSocket('ws://localhost:3000/ws/chat');

ws.onopen = () => {
  console.log('连接成功');
  // 发送认证
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
};
```

### 消息格式

#### 订阅频道
```json
{
  "type": "subscribe",
  "channels": ["chat:conv_001", "task:task_001", "agent:agent_boss"]
}
```

#### 接收实时消息
```json
{
  "type": "message",
  "channel": "chat:conv_001",
  "data": {
    "id": "msg_004",
    "senderId": "agent_dev",
    "senderName": "小发",
    "content": "代码写完了！",
    "timestamp": "2026-03-10T10:30:00Z"
  }
}
```

#### 接收任务更新
```json
{
  "type": "task_update",
  "channel": "task:task_001",
  "data": {
    "taskId": "task_001",
    "status": "completed",
    "progress": 100,
    "updatedAt": "2026-03-10T10:30:00Z"
  }
}
```

#### 接收 Agent 状态变化
```json
{
  "type": "agent_status",
  "channel": "agent:agent_boss",
  "data": {
    "agentId": "agent_boss",
    "status": "busy",
    "message": "正在处理紧急任务"
  }
}
```

---

## ❌ 错误响应

### 通用错误格式
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "任务不存在",
    "details": {
      "taskId": "task_999"
    }
  }
}
```

### 常见错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| `AUTH_REQUIRED` | 401 | 需要认证 |
| `AUTH_INVALID` | 401 | 认证失败 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 400 | 数据验证失败 |
| `TASK_NOT_FOUND` | 404 | 任务不存在 |
| `PROJECT_NOT_FOUND` | 404 | 项目不存在 |
| `AGENT_NOT_FOUND` | 404 | Agent 不存在 |
| `SERVER_ERROR` | 500 | 服务器内部错误 |

---

## 📝 请求头

### 必需头
```
Content-Type: application/json
Authorization: Bearer <token>  (需要认证的接口)
```

### 可选头
```
X-Request-ID: <uuid>  (用于日志追踪)
Accept-Language: zh-CN  (国际化)
```

---

## 🔒 速率限制

| 接口类型 | 限制 |
|----------|------|
| 认证接口 | 10 次/分钟 |
| 普通 GET | 100 次/分钟 |
| POST/PUT/DELETE | 50 次/分钟 |
| WebSocket | 1000 条消息/分钟 |

超过限制返回：
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "请求过于频繁，请稍后再试"
  }
}
```

---

*最后更新：2026-03-10*
