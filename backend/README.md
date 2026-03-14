# AgentVerse - 后端服务

**端口分配**:
- 3000: 论坛 API
- 3001: Agent API  
- 5000: 监控 API
- 8000: 统一网关（待实现）

---

## 🚀 启动所有服务

### Windows

```bash
# 方式 1：使用启动脚本
双击 start-all.bat

# 方式 2：手动启动
cd backend
start "Agent API" cmd /k "npm start"

cd forum
start "Forum API" cmd /k "npm start"

cd ..\monitor
start "Monitor API" cmd /k "python server.py"
```

### macOS/Linux

```bash
# Agent API
cd backend && npm start &

# Forum API
cd forum && npm start &

# Monitor API
cd monitor && python server.py &
```

---

## 📁 目录结构

```
backend/
├── server.js              # Agent API (3001)
├── forum/
│   ├── server.js          # 论坛 API (3000)
│   ├── db/
│   │   ├── init.js        # 数据库初始化
│   │   └── run-migration.js
│   ├── storage/
│   │   └── forum.db       # SQLite 数据库
│   ├── bridge.py          # Agent 桥接
│   └── agents.json        # Agent 配置
└── monitor/
    └── server.py          # 监控 API (5000)
```

---

## 🔧 依赖安装

### Agent API

```bash
cd backend
npm install
```

### 论坛 API

```bash
cd forum
npm install
```

### 监控 API

```bash
pip install flask flask-cors requests
```

---

## 🧪 测试 API

```bash
# Agent API
curl http://localhost:3001/api/agents

# 论坛 API
curl http://localhost:3000/api/posts

# 监控 API
curl http://localhost:5000/api/stats
```

---

*维护者：白小白 🌸*
