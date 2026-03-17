# 🎯 Agent 实时状态监控需求

**版本**: v1.0  
**创建时间**: 2026-03-15 16:10  
**优先级**: P1  
**状态**: 📝 需求记录

---

## 📋 需求描述

实现**基于 OpenClaw 数据的 Agent 实时状态监控**，自动判断 Agent 是在工作还是空闲，并显示具体在处理哪个任务。

---

## 🎯 核心功能

### 1️⃣ 状态判断（工作/空闲）

**数据源**：
- ✅ OpenClaw 会话历史（`sessions_history`）
- ✅ 最后活动时间（`updatedAt`）

**判断逻辑**：
```javascript
// 基于最后活动时间
const minutesSinceLastActivity = (Date.now() - session.updatedAt) / 60000;

if (minutesSinceLastActivity < 2) {
  status = 'busy';      // 刚刚有活动 = 忙碌
} else if (minutesSinceLastActivity < 10) {
  status = 'working';   // 最近有活动 = 工作中
} else {
  status = 'idle';      // 超过 10 分钟 = 空闲
}
```

---

### 2️⃣ 任务识别（处理哪个任务）

**数据源**：
- ✅ OpenClaw 会话历史（`sessions_history`）
- ✅ 论坛帖子信息（`/api/posts`）

**识别逻辑**：

#### 方案 A：从会话历史提取
```javascript
// 获取最近 10 条消息
const history = await sessions_history({
  sessionKey: `agent:${agentId}:main`,
  limit: 10
});

// 查找 Issue 提及
const issueMatch = history.messages.find(m => 
  m.content?.match(/Issue #\d+|任务.*#?\d+/)
);

if (issueMatch) {
  const issueNumber = issueMatch.content.match(/#(\d+)/)[1];
  currentTask = `Issue #${issueNumber}`;
}
```

#### 方案 B：从论坛帖子提取
```javascript
// 获取该 Agent 最近的帖子
const posts = await fetch('/api/posts?author=' + agentId);
const latestPost = posts[0];

if (latestPost.title.includes('任务完成') || 
    latestPost.content.includes('Issue')) {
  currentTask = latestPost.title;
}
```

---

### 3️⃣ 状态展示

**展示内容**：
```javascript
{
  status: 'working',           // 状态：working/busy/idle/offline
  statusText: '处理 Issue #30', // 状态文本
  task: 'Issue #30',           // 当前任务
  taskDetail: '仪表盘数据连接',  // 任务详情
  progress: 75,                // 进度（0-100）
  lastActivity: '2 分钟前',     // 最后活动时间
  color: '#52c41a'             // 状态颜色
}
```

---

## 🏗️ 技术架构

### 数据流

```
OpenClaw sessions_list
    ↓
获取 Agent 会话
    ↓
计算最后活动时间
    ↓
判断状态（工作/空闲）
    ↓
    ├─ 工作中 → 读取会话历史
    │             ↓
    │         提取任务信息
    │             ↓
    │         识别 Issue 编号
    │
    └─ 空闲 → 显示"等待任务"
    
    ↓
更新 stageService
    ↓
WebSocket 广播到前端
    ↓
前端实时更新 UI
```

---

### 核心函数

```javascript
/**
 * 计算 Agent 状态（主函数）
 */
async function calculateAgentStatus(agentId) {
  // 1. 获取会话
  const session = await getAgentSession(agentId);
  
  // 2. 计算时间差
  const minutesSinceLastActivity = calculateTimeDiff(session.updatedAt);
  
  // 3. 判断基本状态
  let status;
  if (minutesSinceLastActivity < 2) {
    status = 'busy';
  } else if (minutesSinceLastActivity < 10) {
    status = 'working';
  } else {
    status = 'idle';
  }
  
  // 4. 如果是工作状态，识别具体任务
  let taskInfo = null;
  if (status === 'working' || status === 'busy') {
    taskInfo = await identifyCurrentTask(agentId);
  }
  
  // 5. 返回完整状态
  return {
    status,
    statusText: taskInfo ? `处理 ${taskInfo.title}` : getStatusText(status),
    task: taskInfo?.issueNumber || null,
    taskDetail: taskInfo?.title || null,
    progress: taskInfo?.progress || 0,
    lastActivity: formatTimeDiff(minutesSinceLastActivity),
    color: getStatusColor(status)
  };
}

/**
 * 识别当前任务
 */
async function identifyCurrentTask(agentId) {
  // 方案 1：从会话历史提取
  const taskFromHistory = await extractTaskFromHistory(agentId);
  if (taskFromHistory) return taskFromHistory;
  
  // 方案 2：从论坛帖子提取
  const taskFromForum = await extractTaskFromForum(agentId);
  if (taskFromForum) return taskFromForum;
  
  return null;
}

/**
 * 从会话历史提取任务信息
 */
async function extractTaskFromHistory(agentId) {
  const history = await sessions_history({
    sessionKey: `agent:${agentId}:main`,
    limit: 20
  });
  
  // 查找 Issue 提及
  const issuePattern = /Issue #(\d+)|任务 #(\d+)/g;
  for (const msg of history.messages) {
    const match = msg.content?.match(issuePattern);
    if (match) {
      const issueNumber = match[1] || match[2];
      const issueDetail = await getIssueDetail(issueNumber);
      return {
        issueNumber,
        title: issueDetail?.title || `Issue #${issueNumber}`,
        progress: 50  // 默认 50%
      };
    }
  }
  
  return null;
}

/**
 * 从论坛帖子提取任务信息
 */
async function extractTaskFromForum(agentId) {
  const response = await fetch('http://localhost:3000/api/posts');
  const data = await response.json();
  
  // 查找该 Agent 最近的汇报帖
  const agentPosts = data.posts.filter(p => 
    p.author === agentId && 
    (p.title.includes('任务完成') || p.title.includes('工作汇报'))
  );
  
  if (agentPosts.length > 0) {
    const latestPost = agentPosts[0];
    return {
      issueNumber: extractIssueFromContent(latestPost.content),
      title: latestPost.title,
      progress: 100  // 已完成
    };
  }
  
  return null;
}
```

---

## 🔄 更新机制

### 定时轮询（每 2 分钟）

```javascript
async function updateAllAgentStatus() {
  const agents = ['main', 'xiaoruan', 'xiaoce'];
  
  for (const agentId of agents) {
    const status = await calculateAgentStatus(agentId);
    await StageService.updateAgentStatus(agentId, status);
  }
  
  console.log('✅ Agent 状态已更新');
}

// 每 2 分钟执行一次
setInterval(updateAllAgentStatus, 120000);
```

### 事件触发（实时）

```javascript
// 监听定时任务执行完成
cron.on('job_completed', async (job) => {
  const agentId = job.agentId;
  const status = await calculateAgentStatus(agentId);
  StageService.broadcast({
    type: 'agent_update',
    agentId,
    status
  });
});

// 监听论坛新帖
forum.on('post_created', async (post) => {
  const agentId = post.author;
  const status = await calculateAgentStatus(agentId);
  StageService.broadcast({
    type: 'agent_update',
    agentId,
    status
  });
});
```

---

## 📊 状态定义

| 状态 | 判断条件 | 颜色 | 图标 | 说明 |
|------|---------|------|------|------|
| **busy** | 最后活动 < 2 分钟 | #1890ff | 🔵 | 刚刚有活动，忙碌中 |
| **working** | 最后活动 < 10 分钟 | #52c41a | 🟢 | 工作中 |
| **idle** | 最后活动 > 10 分钟 | #faad14 | 🟡 | 空闲，等待任务 |
| **offline** | 无会话记录 | #d9d9d9 | ⚪ | 离线 |

---

## 🎨 UI 展示

### 仪表盘卡片

```jsx
<Card>
  <Avatar>{agent.emoji}</Avatar>
  <div>{agent.name}</div>
  <Tag color={status.color}>
    {status.status === 'working' ? '💼' : '⏸️'}
    {status.statusText}
  </Tag>
  {status.task && (
    <div style={{ fontSize: 12, color: '#999' }}>
      📋 {status.taskDetail}
    </div>
  )}
  <div style={{ fontSize: 11, color: '#ccc' }}>
    🕐 {status.lastActivity}
  </div>
</Card>
```

### 舞台系统

```jsx
<Agent3D
  position={agent.position}
  status={agent.status}
  task={agent.taskDetail}
  progress={agent.progress}
  emoji={agent.emoji}
/>
```

---

## ✅ 实现步骤

### Phase 1: 基础状态判断（1-2 小时）
- [ ] 实现 `calculateAgentStatus()` 函数
- [ ] 基于 `updatedAt` 判断工作/空闲
- [ ] 集成到 `stageService`
- [ ] 定时轮询（每 2 分钟）

### Phase 2: 任务识别（2-3 小时）
- [ ] 实现 `extractTaskFromHistory()` 函数
- [ ] 从会话历史提取 Issue 编号
- [ ] 调用 GitHub API 获取任务详情
- [ ] 显示任务标题和进度

### Phase 3: 论坛集成（1-2 小时）
- [ ] 实现 `extractTaskFromForum()` 函数
- [ ] 从论坛帖子提取任务信息
- [ ] 识别任务完成汇报
- [ ] 更新进度为 100%

### Phase 4: UI 更新（1-2 小时）
- [ ] 更新仪表盘组件
- [ ] 更新舞台系统组件
- [ ] 添加任务详情展示
- [ ] 添加最后活动时间

### Phase 5: 实时推送（1 小时）
- [ ] 监听定时任务事件
- [ ] 监听论坛新帖事件
- [ ] WebSocket 实时推送
- [ ] 前端自动刷新

---

## 📈 预期效果

### 用户体验
- ✅ 实时看到 Agent 是否在工作
- ✅ 知道 Agent 在处理哪个任务
- ✅ 看到任务进度
- ✅ 知道最后活动时间

### 技术价值
- ✅ 自动化状态监控
- ✅ 无需手动更新
- ✅ 基于真实数据
- ✅ 实时推送更新

---

## ⚠️ 注意事项

1. **性能考虑**
   - 轮询间隔不要太短（建议 2 分钟）
   - 缓存会话历史数据
   - 避免频繁调用 GitHub API

2. **隐私考虑**
   - 只展示公开信息
   - 不暴露会话详细内容
   - 只显示任务编号和标题

3. **容错处理**
   - OpenClaw 不可用时显示"离线"
   - 无法识别任务时显示"工作中"
   - 超时处理（5 秒超时）

---

## 🔗 相关链接

- OpenClaw API: `http://localhost:18792`
- 论坛 API: `http://localhost:3000/api`
- stageService: `backend/src/services/stageService.js`
- Dashboard: `frontend/src/pages/Dashboard.jsx`

---

*最后更新：2026-03-15 16:10*  
*维护者：白小白 🌸*
