# Agent Company - 前端设置文档

## 🚀 快速开始

### 1. 安装依赖

```bash
cd projects/agent-company/ui
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:3002

### 3. 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
ui/
├── src/
│   ├── main.jsx              # 入口文件
│   ├── App.jsx               # 主应用（路由配置）
│   ├── index.css             # 全局样式
│   ├── components/           # 公共组件
│   │   ├── Header.jsx        # 顶部导航
│   │   └── Sider.jsx         # 侧边栏
│   ├── pages/                # 页面组件
│   │   ├── Dashboard.jsx     # 首页概览
│   │   ├── AgentList.jsx     # Agent 管理
│   │   ├── TaskList.jsx      # 任务管理
│   │   └── WorkflowList.jsx  # 工作流（占位）
│   ├── store/                # 状态管理（Zustand）
│   │   ├── agentStore.js     # Agent 状态
│   │   └── taskStore.js      # 任务状态
│   ├── services/             # API 服务
│   │   ├── api.js            # Axios 配置
│   │   ├── agentService.js   # Agent API
│   │   └── taskService.js    # Task API
│   └── utils/                # 工具函数
├── index.html
├── package.json
└── vite.config.js
```

## 🛠 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 18.3.1 |
| 路由 | React Router | 6.22.0 |
| UI 库 | Ant Design | 5.14.0 |
| 状态管理 | Zustand | 4.5.0 |
| HTTP 客户端 | Axios | 1.6.7 |
| 构建工具 | Vite | 5.4.0 |

## 📄 页面说明

### Dashboard（首页）
- 显示统计数据（Agent 总数、任务总数、完成情况）
- 快速概览系统状态

### Agent 管理
- 查看 Agent 列表
- 创建/编辑/删除 Agent
- 显示 Agent 状态

### 任务管理
- 查看任务列表
- 创建/编辑/删除任务
- 更新任务状态（完成）
- 分配任务给 Agent

### 工作流
- 占位页面（功能开发中）

## 🔌 API 对接

**后端地址**: http://localhost:3001

**代理配置**: 开发模式下，Vite 配置了 API 代理：
- 前端：http://localhost:3002
- API 代理：/api → http://localhost:3001/api

## 🎨 组件库

使用 Ant Design 5.x，主题色为默认蓝色（#1890ff）。

## 📝 开发规范

- 使用函数组件 + Hooks
- 状态管理使用 Zustand
- API 调用封装在 services 层
- 页面组件放在 pages 目录
- 公共组件放在 components 目录

## 🤝 贡献者

- 小软 🤖

## 📄 许可证

MIT

---

*最后更新：2026-03-12*
