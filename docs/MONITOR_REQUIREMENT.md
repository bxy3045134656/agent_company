# 📊 监控面板（Monitor）需求文档

**版本**: v1.0  
**创建时间**: 2026-03-15 16:15  
**优先级**: P1  
**状态**: 📝 需求记录

---

## 📋 需求描述

实现**基于真实数据的监控面板**，实时监控 Token 消耗、模型请求次数、系统状态等核心指标。

**核心要求**：
- ✅ 所有数据必须来自真实数据源
- ✅ 禁用模拟数据和硬编码
- ✅ 实时或准实时更新
- ✅ 数据准确可靠

---

## 🎯 核心功能

### 1️⃣ Token 消耗监控

**数据源**：OpenClaw 会话数据（`sessions_list`）

**监控指标**：
| 指标 | 说明 | 计算方式 | 更新频率 |
|------|------|----------|----------|
| **输入 Token** | 所有请求的输入 Token 总和 | ∑ sessions.contextTokens | 每 5 分钟 |
| **输出 Token** | 所有请求的输出 Token 总和 | ∑ sessions.totalTokens - contextTokens | 每 5 分钟 |
| **总 Token** | 输入 + 输出 | inputTokens + outputTokens | 每 5 分钟 |
| **人均 Token** | 每个 Agent 的 Token 使用 | 按 agentId 分组统计 | 每 5 分钟 |

**获取方式**：
```javascript
// 调用 OpenClaw API
const sessions = await sessions_list({ limit: 100 })

// 计算 Token 使用
const inputTokens = sessions.sessions.reduce((sum, s) => 
  sum + (s.contextTokens || 0), 0)

const outputTokens = sessions.sessions.reduce((sum, s) => 
  sum + ((s.totalTokens || 0) - (s.contextTokens || 0)), 0)

const totalTokens = inputTokens + outputTokens
```

---

### 2️⃣ 模型请求次数监控

**数据源**：OpenClaw 会话数据（`sessions_list`）

**监控指标**：
| 指标 | 说明 | 计算方式 | 更新频率 |
|------|------|----------|----------|
| **总请求数** | 总会话数 | sessions.length | 每 5 分钟 |
| **成功请求** | 未中断的请求 | sessions.filter(s => !s.abortedLastRun).length | 每 5 分钟 |
| **失败请求** | 中断的请求 | sessions.filter(s => s.abortedLastRun).length | 每 5 分钟 |
| **成功率** | 成功/总数 | successRequests / totalRequests * 100 | 每 5 分钟 |

**获取方式**：
```javascript
// 调用 OpenClaw API
const sessions = await sessions_list({ limit: 100 })

// 计算请求统计
const totalRequests = sessions.sessions.length
const successRequests = sessions.sessions.filter(s => !s.abortedLastRun).length
const failedRequests = sessions.sessions.filter(s => s.abortedLastRun).length
const successRate = totalRequests > 0 
  ? (successRequests / totalRequests * 100).toFixed(2) 
  : 0
```

---

### 3️⃣ 模型使用情况

**数据源**：OpenClaw 会话数据（`sessions_list`）

**监控指标**：
| 指标 | 说明 | 计算方式 | 更新频率 |
|------|------|----------|----------|
| **使用模型** | 使用的 AI 模型列表 | sessions[].model 去重 | 每 5 分钟 |
| **模型分布** | 各模型使用次数 | 按 model 分组统计 | 每 5 分钟 |
| **主流模型** | 使用最多的模型 | 按使用次数排序 | 每 5 分钟 |

**获取方式**：
```javascript
// 统计模型使用
const modelUsage = sessions.sessions.reduce((acc, s) => {
  const model = s.model || 'unknown'
  acc[model] = (acc[model] || 0) + 1
  return acc
}, {})

// 获取主流模型
const primaryModel = Object.entries(modelUsage)
  .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown'
```

---

### 4️⃣ Agent 状态监控

**数据源**：
- OpenClaw 会话数据（`sessions_list`）
- stageService（Agent 实时状态）

**监控指标**：
| 指标 | 说明 | 计算方式 | 更新频率 |
|------|------|----------|----------|
| **Agent 列表** | 所有 Agent | sessions_list + 配置 | 每 5 分钟 |
| **在线状态** | 是否活跃 | 基于最后活动时间 | 实时 |
| **任务数** | 当前任务数 | 从 Task 模型获取 | 每 5 分钟 |
| **完成率** | 任务完成百分比 | completed / total * 100 | 每 5 分钟 |
| **Token 使用** | 每个 Agent 的 Token | 按 agentId 分组 | 每 5 分钟 |

**获取方式**：
```javascript
// 获取 Agent 列表
const agents = ['main', 'xiaoruan', 'xiaoce']

// 计算每个 Agent 的状态
const agentStats = await Promise.all(agents.map(async (agentId) => {
  const agentSessions = sessions.sessions.filter(s => 
    s.key.includes(`agent:${agentId}:`)
  )
  
  const lastActivity = agentSessions[0]?.updatedAt
  const isActive = lastActivity && (Date.now() - lastActivity) < 600000
  
  const agentTokens = agentSessions.reduce((sum, s) => 
    sum + (s.totalTokens || 0), 0)
  
  return {
    id: agentId,
    name: getAgentName(agentId),
    status: isActive ? 'online' : 'offline',
    tasks: await getAgentTasks(agentId),
    completion: await getAgentCompletionRate(agentId),
    tokens: agentTokens
  }
}))
```

---

### 5️⃣ 系统状态监控

**数据源**：
- 服务健康检查
- 配置信息

**监控指标**：
| 指标 | 说明 | 数据源 | 更新频率 |
|------|------|--------|----------|
| **系统状态** | 运行中/离线 | 健康检查 API | 每 5 分钟 |
| **AI 模型** | 当前使用的模型 | 配置文件 | 启动时 |
| **服务来源** | 服务提供商 | 配置文件 | 启动时 |
| **运行时间** | 服务运行时长 | process.uptime() | 实时 |

---

## 🏗️ 技术架构

### 前端架构（Monitor.jsx）

```
Monitor 组件
├── 数据获取
│   ├── fetchStats() → GET /api/v1/monitor/stats
│   ├── fetchMembers() → GET /api/v1/monitor/members
│   └── WebSocket 连接 → ws://localhost:3001/ws/monitor
│
├── 状态管理
│   ├── stats: 监控统计
│   │   ├── inputTokens: 输入 Token
│   │   ├── outputTokens: 输出 Token
│   │   ├── totalTokens: 总 Token
│   │   ├── totalRequests: 总请求数
│   │   ├── successRequests: 成功请求
│   │   └── failedRequests: 失败请求
│   ├── members: 成员列表
│   └── loading: 加载状态
│
└── UI 展示
    ├── 系统状态卡片（3 个）
    ├── Token 统计卡片（3 个）
    ├── 请求统计卡片（3 个）
    └── 成员监控表格
```

---

### 后端架构

```
Monitor API (/api/v1/monitor)
├── Controller (MonitorController.js)
│   ├── getStats()        # GET /stats - 获取监控统计
│   ├── getTokens()       # GET /tokens - 获取 Token 使用
│   ├── getRequests()     # GET /requests - 获取请求统计
│   └── getMembers()      # GET /members - 获取成员列表
│
├── Service (monitorService.js)
│   ├── getStats()
│   │   ├── getOpenClawSessions()  # 获取 OpenClaw 会话
│   │   ├── calculateTokens()      # 计算 Token 使用
│   │   ├── calculateRequests()    # 计算请求统计
│   │   └── calculateCost()        # 计算成本（可选）
│   │
│   ├── getMembers()
│   │   ├── getAgentList()         # 获取 Agent 列表
│   │   ├── calculateActivity()    # 计算活跃度
│   │   └── calculateCompletion()  # 计算完成率
│   │
│   └── broadcastStats()           # WebSocket 推送
│
└── WebSocket (monitorWebSocketService.js)
    ├── 连接管理
    └── 定时推送（每 5 分钟）
```

---

### 数据流

```
用户访问 /monitor
    ↓
前端调用 GET /api/v1/monitor/stats
    ↓
后端 MonitorController.getStats()
    ↓
MonitorService 获取数据
    ├── sessions_list() → OpenClaw 会话数据
    ├── calculateTokens() → Token 统计
    ├── calculateRequests() → 请求统计
    └── getAgentList() → Agent 列表
    ↓
返回 JSON 数据
    ↓
前端渲染 UI
    ↓
WebSocket 连接建立
    ↓
每 5 分钟推送更新
    ↓
前端自动刷新
```

---

## 📊 API 接口设计

### GET /api/v1/monitor/stats

**响应**：
```json
{
  "success": true,
  "data": {
    "tokens": {
      "input": 125000,
      "output": 87000,
      "total": 212000
    },
    "requests": {
      "total": 1250,
      "success": 1180,
      "failed": 70,
      "successRate": 94.4
    },
    "models": {
      "primary": "qwen3.5-plus",
      "distribution": {
        "qwen3.5-plus": 1000,
        "qwen3-max": 250
      }
    },
    "system": {
      "status": "running",
      "model": "Qwen3.5-Plus",
      "provider": "阿里云百炼",
      "uptime": 86400
    }
  }
}
```

---

### GET /api/v1/monitor/members

**响应**：
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "main",
        "name": "白小白",
        "emoji": "🌸",
        "role": "管理者",
        "status": "online",
        "lastActivity": "2026-03-15T16:10:00Z",
        "tasks": {
          "total": 15,
          "completed": 15,
          "completion": 100
        },
        "tokens": 50000
      },
      {
        "id": "xiaoruan",
        "name": "小软",
        "emoji": "🤖",
        "role": "全栈工程师",
        "status": "online",
        "lastActivity": "2026-03-15T16:05:00Z",
        "tasks": {
          "total": 20,
          "completed": 18,
          "completion": 90
        },
        "tokens": 80000
      },
      {
        "id": "xiaoce",
        "name": "小测",
        "emoji": "🔍",
        "role": "测试工程师",
        "status": "online",
        "lastActivity": "2026-03-15T15:50:00Z",
        "tasks": {
          "total": 12,
          "completed": 10,
          "completion": 83.3
        },
        "tokens": 35000
      }
    ]
  }
}
```

---

## 🔄 更新机制

### 定时轮询（每 5 分钟）

```javascript
async function updateMonitorStats() {
  const stats = await monitorService.getStats()
  const members = await monitorService.getMembers()
  
  // 推送到前端
  broadcast({
    type: 'stats_update',
    stats,
    members
  })
}

// 每 5 分钟执行一次
setInterval(updateMonitorStats, 300000)
```

### 事件触发（实时）

```javascript
// 监听定时任务执行完成
cron.on('job_completed', async (job) => {
  const stats = await monitorService.getStats()
  broadcast({
    type: 'stats_update',
    stats
  })
})

// 监听会话变化
sessions.on('changed', async () => {
  const stats = await monitorService.getStats()
  broadcast({
    type: 'stats_update',
    stats
  })
})
```

---

## 🎨 UI 展示要求

### 系统状态卡片
- ✅ 显示运行状态（运行中/离线）
- ✅ 显示 AI 模型名称
- ✅ 显示服务提供商
- ✅ 显示运行时间

### Token 统计卡片
- ✅ 输入 Token（蓝色）
- ✅ 输出 Token（青色）
- ✅ 总 Token（紫色）
- ✅ 精确到个位数

### 请求统计卡片
- ✅ 成功请求（绿色）
- ✅ 失败请求（橙色）
- ✅ 总额度（蓝色）
- ✅ 成功率百分比

### 成员监控表格
- ✅ 成员信息（头像 + 名字 + 角色）
- ✅ 在线状态（绿色/灰色标签）
- ✅ 任务数（数字）
- ✅ 完成率（进度条）
- ✅ Token 使用（数字）
- ✅ 点击跳转到个人监控

---

## ⚠️ 注意事项

### 1. 数据准确性
- ✅ 所有数据必须来自真实数据源
- ✅ 禁止使用模拟数据
- ✅ 禁止硬编码
- ✅ 数据错误时显示"数据加载失败"

### 2. 性能考虑
- ✅ 轮询间隔不要太短（建议 5 分钟）
- ✅ 缓存会话数据（避免频繁调用 OpenClaw API）
- ✅ 大数据量时分页加载

### 3. 容错处理
- ✅ OpenClaw 不可用时显示"数据暂不可用"
- ✅ 超时处理（10 秒超时）
- ✅ 错误日志记录

---

## ✅ 实现步骤

### Phase 1: 后端 API（3-4 小时）
- [ ] 创建 MonitorController
- [ ] 实现 getStats() 函数
- [ ] 连接 OpenClaw sessions_list API
- [ ] 实现 Token 计算逻辑
- [ ] 实现请求统计逻辑
- [ ] 实现 getMembers() 函数
- [ ] 单元测试

### Phase 2: WebSocket（1-2 小时）
- [ ] 创建 monitorWebSocketService
- [ ] 实现定时推送（每 5 分钟）
- [ ] 前端连接 WebSocket
- [ ] 自动刷新数据
- [ ] 错误重连机制

### Phase 3: 前端更新（2-3 小时）
- [ ] 移除硬编码成员数据
- [ ] 连接真实 API
- [ ] 显示真实 Token 使用
- [ ] 显示真实成员状态
- [ ] 添加加载动画
- [ ] 错误处理

### Phase 4: 测试优化（1-2 小时）
- [ ] 功能测试
- [ ] 性能测试
- [ ] 数据准确性验证
- [ ] UI 优化
- [ ] 文档更新

---

## 📈 预期效果

### 用户体验
- ✅ 看到真实的 Token 消耗
- ✅ 看到真实的请求次数
- ✅ 看到 Agent 实时状态
- ✅ 数据自动更新（无需手动刷新）

### 技术价值
- ✅ 基于真实数据
- ✅ 自动化监控
- ✅ 实时推送更新
- ✅ 可扩展性强

---

## 🔗 相关链接

- OpenClaw API: `sessions_list`, `sessions_history`
- 前端文件：`frontend/src/pages/Monitor.jsx`
- 后端路由：`backend/src/routes/monitor.js`（待创建）
- 后端服务：`backend/src/services/monitorService.js`（待创建）

---

*最后更新：2026-03-15 16:15*  
*维护者：白小白 🌸*
