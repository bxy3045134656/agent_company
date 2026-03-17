# 🚨 假数据清理需求文档

**版本**: v1.0  
**创建时间**: 2026-03-15 16:20  
**优先级**: P0（最高优先级）  
**状态**: 📝 需求记录

---

## 📋 问题描述

项目中存在多处使用**假数据、硬编码、随机数**的情况，需要全部替换为**真实数据**。

**核心要求**：
- ✅ 所有数据必须来自真实数据源
- ✅ 移除所有硬编码数据
- ✅ 移除所有随机数生成
- ✅ 移除所有模拟数据回退
- ✅ 连接真实后端 API

---

## ⚠️ 问题清单

### ❌ 1. Monitor.jsx（监控面板）- 最严重

**文件**：`frontend/src/pages/Monitor.jsx`

---

#### 问题 1.1：Token 使用随机数 🔴 严重

**位置**：第 134 行

**当前代码**：
```javascript
{
  title: 'Token 使用',
  key: 'tokens',
  width: 150,
  render: () => (
    <Text>{Math.floor(Math.random() * 50000) + 10000}</Text>  // ❌ 随机数！
  ),
}
```

**问题**：
- ❌ 每次渲染都是随机数
- ❌ 数据完全不准确
- ❌ 用户无法信任数据

**修复方案**：
```javascript
{
  title: 'Token 使用',
  dataIndex: 'tokens',  // ✅ 使用真实数据
  key: 'tokens',
  width: 150,
  render: (tokens) => (
    <Text>{tokens?.toLocaleString() || 0}</Text>
  ),
}
```

**数据源**：
- OpenClaw sessions_list API
- 按 Agent 分组统计 Token 使用

---

#### 问题 1.2：成员数据硬编码 🔴 严重

**位置**：第 34-38 行

**当前代码**：
```javascript
// 团队成员数据
const members = [
  { id: 'main', name: '白小白', emoji: '🌸', role: '管理者', status: 'online', tasks: 5, completion: 100 },
  { id: 'xiaoruan', name: '小软', emoji: '🤖', role: '全栈工程师', status: 'online', tasks: 8, completion: 92 },
  { id: 'xiaoce', name: '小测', emoji: '🔍', role: '测试工程师', status: 'online', tasks: 6, completion: 88 },
]
```

**问题**：
- ❌ 硬编码 3 个成员
- ❌ 状态固定为 `online`（永远在线）
- ❌ 任务数是固定值
- ❌ 完成率是固定值
- ❌ 不会随实际状态变化

**修复方案**：
```javascript
// ✅ 从 API 加载真实成员
const [members, setMembers] = useState([])

useEffect(() => {
  fetchMembers()
}, [])

const fetchMembers = async () => {
  const response = await fetch('http://localhost:3001/api/v1/monitor/members')
  const data = await response.json()
  setMembers(data.data.members)
}
```

**数据源**：
- OpenClaw sessions_list
- stageService Agent 状态
- Task 模型任务统计

---

#### 问题 1.3：API 失败时使用模拟数据 🔴 严重

**位置**：第 55-68 行

**当前代码**：
```javascript
const fetchStats = async () => {
  setLoading(true)
  try {
    const response = await fetch('http://localhost:5000/api/stats')  // ❌ 5000 端口不存在
    const result = await response.json()
    if (result.success) {
      setStats(result.data)
    }
  } catch (error) {
    console.error('获取监控数据失败:', error)
    // ❌ 模拟数据
    setStats({
      inputTokens: 125000,
      outputTokens: 87000,
      successRequests: 1250,
      remainingRequests: 8750,
      totalQuota: 10000,
      estimatedCost: 0.15,
      quotaType: 'monthly',
      resetTime: new Date().toISOString(),
    })
  } finally {
    setLoading(false)
  }
}
```

**问题**：
- ❌ API 端口 5000 不存在（应该是 3001）
- ❌ 失败时使用硬编码数据
- ❌ 所有数据都是假的
- ❌ 用户无法发现问题

**修复方案**：
```javascript
const fetchStats = async () => {
  setLoading(true)
  setError(null)
  try {
    const response = await fetch('http://localhost:3001/api/v1/monitor/stats')  // ✅ 正确端口
    const result = await response.json()
    if (result.success) {
      setStats(result.data)
    } else {
      setError('数据加载失败')
    }
  } catch (error) {
    console.error('获取监控数据失败:', error)
    setError('数据加载失败，请检查后端服务')
    // ✅ 不要设置模拟数据！显示错误状态
  } finally {
    setLoading(false)
  }
}
```

**数据源**：
- OpenClaw sessions_list API
- 真实 Token 统计
- 真实请求统计

---

### ❌ 2. MemberList.jsx（成员列表）

**文件**：`frontend/src/pages/MemberList.jsx`

---

#### 问题 2.1：默认成员配置 🟡 中等

**位置**：第 18-58 行

**当前代码**：
```javascript
const DEFAULT_MEMBERS = [
  { 
    id: 'main', 
    name: '白小白', 
    emoji: '🌸', 
    role: '管理者',
    // ... 硬编码配置
  },
  { 
    id: 'xiaoruan', 
    name: '小软', 
    emoji: '🤖', 
    role: '全栈工程师',
    // ... 硬编码配置
  },
  { 
    id: 'xiaoce', 
    name: '小测', 
    emoji: '🔍', 
    role: '测试工程师',
    // ... 硬编码配置
  },
]
```

**问题**：
- ❌ 虽然有 `loadMembers()` 函数尝试从 OpenClaw 加载
- ❌ 但失败时会回退到硬编码数据
- ❌ 成员信息固定

**修复方案**：
```javascript
const loadMembers = async () => {
  setLoading(true)
  try {
    const response = await fetch('http://localhost:3001/api/v1/agents')
    const data = await response.json()
    setMembers(data.data)
  } catch (error) {
    console.error('加载成员失败:', error)
    setError('加载失败，请检查后端服务')
    // ✅ 不要回退到 DEFAULT_MEMBERS
  } finally {
    setLoading(false)
  }
}
```

**数据源**：
- OpenClaw agents API
- 真实 Agent 列表

---

### ⚠️ 3. MemberProfile.jsx（成员详情）

**文件**：`frontend/src/pages/MemberProfile.jsx`

**位置**：第 112, 123, 134, 146 行

**问题**：注释显示有模拟数据（需要进一步检查）

**待确认**：
- ⚠️ 需要检查具体代码
- ⚠️ 确认是否有硬编码数据
- ⚠️ 确认是否有随机数

---

## 📊 影响范围

| 文件 | 问题类型 | 影响页面 | 影响程度 | 优先级 |
|------|---------|---------|---------|--------|
| **Monitor.jsx** | 随机数 | 监控面板 | 🔴 严重 | P0 |
| **Monitor.jsx** | 硬编码成员 | 监控面板 | 🔴 严重 | P0 |
| **Monitor.jsx** | 模拟数据回退 | 监控面板 | 🔴 严重 | P0 |
| **MemberList.jsx** | 硬编码回退 | 成员列表 | 🟡 中等 | P1 |
| **MemberProfile.jsx** | 待确认 | 成员详情 | 🟡 中等 | P1 |

---

## ✅ 修复方案

### Phase 1: Monitor.jsx 修复（2-3 小时）

#### 1.1 移除随机数
```javascript
// ❌ 删除
render: () => (
  <Text>{Math.floor(Math.random() * 50000) + 10000}</Text>
)

// ✅ 改为
render: (tokens) => (
  <Text>{tokens?.toLocaleString() || 0}</Text>
)
```

#### 1.2 移除硬编码成员
```javascript
// ❌ 删除
const members = [...]

// ✅ 改为
const [members, setMembers] = useState([])

useEffect(() => {
  const fetchMembers = async () => {
    const response = await fetch('/api/v1/monitor/members')
    const data = await response.json()
    setMembers(data.data.members)
  }
  fetchMembers()
}, [])
```

#### 1.3 修复 API 连接
```javascript
// ❌ 删除
const response = await fetch('http://localhost:5000/api/stats')

// ✅ 改为
const response = await fetch('http://localhost:3001/api/v1/monitor/stats')
```

#### 1.4 移除模拟数据回退
```javascript
// ❌ 删除 catch 中的模拟数据
catch (error) {
  console.error('获取监控数据失败:', error)
  setError('数据加载失败，请检查后端服务')
  // ❌ 不要设置模拟数据！
}
```

---

### Phase 2: MemberList.jsx 修复（1 小时）

#### 2.1 移除硬编码回退
```javascript
// ❌ 删除 DEFAULT_MEMBERS 的使用
const loadMembers = async () => {
  try {
    const response = await fetch('/api/v1/agents')
    const data = await response.json()
    setMembers(data.data)
  } catch (error) {
    console.error('加载成员失败:', error)
    setError('加载失败')
    // ❌ 不要回退到 DEFAULT_MEMBERS
  }
}
```

---

### Phase 3: MemberProfile.jsx 检查（1 小时）

#### 3.1 检查并修复
- [ ] 检查第 112, 123, 134, 146 行
- [ ] 确认是否有硬编码数据
- [ ] 确认是否有随机数
- [ ] 如有问题，立即修复

---

## 🎯 后端 API 需求

为了支持前端真实数据，需要实现以下后端 API：

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
    }
  }
}
```

**数据源**：
- OpenClaw sessions_list API

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
      }
    ]
  }
}
```

**数据源**：
- OpenClaw sessions_list
- Task 模型
- stageService

---

## ⚠️ 注意事项

### 1. 错误处理
- ✅ API 失败时显示错误信息
- ✅ 不要使用模拟数据回退
- ✅ 引导用户检查后端服务

### 2. 加载状态
- ✅ 显示加载动画
- ✅ 数据加载完成后隐藏
- ✅ 超时处理（10 秒超时）

### 3. 数据验证
- ✅ 验证 API 返回数据格式
- ✅ 验证数据完整性
- ✅ 异常数据处理

---

## ✅ 验收标准

### Monitor.jsx
- [ ] Token 使用显示真实数据
- [ ] 成员列表从 API 加载
- [ ] 连接正确的 API 端口（3001）
- [ ] 移除所有模拟数据
- [ ] 错误时显示错误信息

### MemberList.jsx
- [ ] 成员列表从 API 加载
- [ ] 移除硬编码回退
- [ ] 错误时显示错误信息

### MemberProfile.jsx
- [ ] 检查并修复所有硬编码数据
- [ ] 使用真实数据

---

## 📈 修复后效果

### 用户体验
- ✅ 看到真实的 Token 消耗
- ✅ 看到真实的成员状态
- ✅ 看到真实的任务统计
- ✅ 数据准确可靠

### 技术价值
- ✅ 基于真实数据
- ✅ 代码质量提升
- ✅ 可维护性增强
- ✅ 用户信任度提升

---

## 🔗 相关链接

- 前端文件：
  - `frontend/src/pages/Monitor.jsx`
  - `frontend/src/pages/MemberList.jsx`
  - `frontend/src/pages/MemberProfile.jsx`

- 后端 API：
  - `GET /api/v1/monitor/stats`
  - `GET /api/v1/monitor/members`

- 数据源：
  - OpenClaw sessions_list API
  - Task 模型
  - stageService

---

*最后更新：2026-03-15 16:20*  
*维护者：白小白 🌸*
