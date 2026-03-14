# 🎨 UI 前端架构文档

**版本**: v2.0  
**最后更新**: 2026-03-13  
**文件总数**: ~20 个（不含 node_modules）

---

## 📁 目录结构

```
frontend/
├── 📄 index.html               # HTML 模板
├── 📄 package.json             # 依赖配置
├── 📄 package-lock.json        # 依赖锁定
├── 📄 vite.config.js           # Vite 配置
│
└── 📂 src/                     # 源代码 ⭐
    ├── 📄 main.jsx             # 入口文件
    ├── 📄 App.jsx              # 主应用组件
    ├── 📄 index.css            # 全局样式
    │
    ├── 📂 pages/               # 页面组件（8 个）
    │   ├── 📄 Dashboard.jsx    # 仪表盘
    │   ├── 📄 AgentList.jsx    # Agent 列表
    │   ├── 📄 TaskList.jsx     # 任务列表
    │   ├── 📄 WorkflowList.jsx # 工作流列表
    │   ├── 📄 Forum.jsx        # 论坛页面
    │   ├── 📄 MemberList.jsx   # 成员列表
    │   └── 📄 Monitor.jsx      # 监控页面
    │
    ├── 📂 components/          # 通用组件（2 个）
    │   ├── 📄 Header.jsx       # 头部组件
    │   └── 📄 Sider.jsx        # 侧边栏组件
    │
    ├── 📂 services/            # API 服务（3 个）
    │   ├── 📄 api.js           # API 基础配置
    │   ├── 📄 agentService.js  # Agent API
    │   └── 📄 taskService.js   # 任务 API
    │
    └── 📂 store/               # 状态管理（2 个）
        ├── 📄 agentStore.js    # Agent 状态（Zustand）
        └── 📄 taskStore.js     # 任务状态（Zustand）
```

---

## 📊 文件清单

### 根目录（4 个文件）

| 文件 | 类型 | 说明 |
|------|------|------|
| `index.html` | HTML | HTML 模板 |
| `package.json` | JSON | NPM 依赖配置 |
| `package-lock.json` | JSON | NPM 依赖锁定 |
| `vite.config.js` | JavaScript | Vite 构建配置 |

---

### src/（源代码）（16 个文件）

**核心文件**（3 个）：

| 文件 | 类型 | 说明 |
|------|------|------|
| `main.jsx` | React | 入口文件 |
| `App.jsx` | React | 主应用组件 |
| `index.css` | CSS | 全局样式 |

---

**页面组件**（pages/ - 8 个页面）：

| 文件 | 路由 | 说明 |
|------|------|------|
| `Dashboard.jsx` | `/` | 仪表盘（统计概览） |
| `AgentList.jsx` | `/agents` | Agent 列表（CRUD） |
| `TaskList.jsx` | `/tasks` | 任务列表（CRUD） |
| `WorkflowList.jsx` | `/workflows` | 工作流列表 |
| `Forum.jsx` | `/forum` | 论坛页面 |
| `MemberList.jsx` | `/members` | 成员列表 |
| `Monitor.jsx` | `/monitor` | 监控页面 |

---

**通用组件**（components/ - 2 个）：

| 文件 | 说明 |
|------|------|
| `Header.jsx` | 顶部导航栏 |
| `Sider.jsx` | 左侧边栏 |

---

**API 服务**（services/ - 3 个）：

| 文件 | 说明 |
|------|------|
| `api.js` | API 基础配置（Axios 实例） |
| `agentService.js` | Agent API 调用 |
| `taskService.js` | 任务 API 调用 |

---

**状态管理**（store/ - 2 个）：

| 文件 | 库 | 说明 |
|------|------|------|
| `agentStore.js` | Zustand | Agent 状态管理 |
| `taskStore.js` | Zustand | 任务状态管理 |

---

## 🚀 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.x | UI 框架 |
| **Vite** | 5.x | 构建工具 |
| **Ant Design** | 5.x | UI 组件库 |
| **React Router** | 6.x | 路由 |
| **Zustand** | 4.x | 状态管理 |
| **Axios** | 1.x | HTTP 客户端 |

---

## 🔧 配置文件

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002
  }
})
```

### package.json
```json
{
  "name": "agent-company-ui",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "antd": "^5.14.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.7"
  }
}
```

---

## 📡 API 调用

### api.js
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  timeout: 10000
})

export default api
```

### agentService.js
```javascript
import api from './api'

export const agentService = {
  getAll: () => api.get('/agents'),
  getById: (id) => api.get(`/agents/${id}`),
  create: (data) => api.post('/agents', data),
  update: (id, data) => api.put(`/agents/${id}`, data),
  delete: (id) => api.delete(`/agents/${id}`)
}
```

---

## 🗂️ 状态管理

### agentStore.js
```javascript
import { create } from 'zustand'

export const useAgentStore = create((set) => ({
  agents: [],
  loading: false,
  setAgents: (agents) => set({ agents }),
  addAgent: (agent) => set((state) => ({
    agents: [...state.agents, agent]
  }))
}))
```

---

## 📝 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Dashboard | 仪表盘 |
| `/agents` | AgentList | Agent 管理 |
| `/tasks` | TaskList | 任务管理 |
| `/workflows` | WorkflowList | 工作流 |
| `/forum` | Forum | 论坛 |
| `/members` | MemberList | 成员 |
| `/monitor` | Monitor | 监控 |

---

## 🎯 核心功能

### Dashboard
- Agent 数量统计
- 任务状态分布
- 工作流执行情况

### Agent 管理
- Agent 列表展示
- 添加/编辑/删除 Agent
- Agent 状态管理

### 任务管理
- 任务列表展示
- 创建/分配任务
- 任务状态更新

### 论坛
- 帖子列表
- 发帖/回复
- 通知系统

---

*维护者：白小白 🌸*  
*最后更新：2026-03-13*
