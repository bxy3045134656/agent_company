# ➕ Agent 管理功能需求文档

**版本**: v1.0  
**创建时间**: 2026-03-15 16:25  
**优先级**: P1  
**状态**: 📝 需求记录

---

## 📋 需求描述

实现**从前端直接创建和管理 Agent**的功能，支持：
1. ✅ 从成员列表直接新建 Agent
2. ✅ 新建后自动同步到 OpenClaw
3. ✅ 点击 Agent 直接显示配置文件（在界面上）

**核心要求**：
- ✅ 无需手动操作 OpenClaw
- ✅ 前端一键创建
- ✅ 自动同步配置
- ✅ 实时显示配置内容

---

## 🎯 核心功能

### 1️⃣ 新建 Agent（从成员列表）

**入口**：
- 成员列表页面（`/members`）
- 添加"新建 Agent"按钮

**UI 设计**：
```
┌─────────────────────────────────┐
│ 👥 成员管理              [+ 新建] │
├─────────────────────────────────┤
│ 🌸 白小白  [查看] [编辑] [删除]  │
│ 🤖 小软    [查看] [编辑] [删除]  │
│ 🔍 小测    [查看] [编辑] [删除]  │
└─────────────────────────────────┘
```

**点击"新建"后**：
- 弹出表单对话框
- 填写 Agent 信息

---

### 2️⃣ 新建 Agent 表单

**表单字段**：

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| **Agent ID** | 文本 | ✅ | 唯一标识符 | `xiaoruan` |
| **显示名称** | 文本 | ✅ | 显示的名字 | `小软` |
| **Emoji** | 选择 | ✅ | 头像表情 | `🤖` |
| **角色** | 下拉 | ✅ | 职位角色 | `全栈工程师` |
| **描述** | 文本域 | ⏳ | 详细描述 | `负责前后端开发` |
| **能力标签** | 多选 | ⏳ | 技能标签 | `React`, `Node.js` |
| **状态** | 下拉 | ✅ | 初始状态 | `active` |

**表单设计**：
```
┌──────────────────────────────────────┐
│ ➕ 新建 Agent                        │
├──────────────────────────────────────┤
│ Agent ID:     [___________] *必填    │
│ 显示名称：   [___________] *必填    │
│ Emoji:       [🤖 ▼]      *必填       │
│ 角色：       [工程师 ▼]  *必填       │
│ 描述：       [___________] 可选      │
│              [___________]           │
│ 能力标签：   [x] React  [x] Node.js  │
│              [ ] Python [ ] Java     │
│ 状态：       [active ▼]  *必填       │
├──────────────────────────────────────┤
│          [取消]      [确认创建]      │
└──────────────────────────────────────┘
```

---

### 3️⃣ 创建流程

**步骤**：

```
1. 用户点击"新建 Agent"
   ↓
2. 填写表单
   ↓
3. 点击"确认创建"
   ↓
4. 前端调用 API：POST /api/v1/agents
   ↓
5. 后端创建 Agent（数据库）
   ↓
6. 后端调用 OpenClaw API 创建会话
   ↓
7. 返回创建结果
   ↓
8. 前端刷新成员列表
   ↓
9. 显示成功提示
```

**API 调用**：
```javascript
// 前端调用
const createAgent = async (agentData) => {
  const response = await fetch('/api/v1/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: agentData.agentId,
      name: agentData.displayName,
      emoji: agentData.emoji,
      role: agentData.role,
      description: agentData.description,
      capabilities: agentData.tags,
      status: agentData.status
    })
  })
  
  const result = await response.json()
  return result
}
```

---

### 4️⃣ OpenClaw 同步

**后端实现**：

```javascript
// backend/src/controllers/AgentController.js
static async create(req, res, next) {
  try {
    const { id, name, emoji, role, description, capabilities, status } = req.body
    
    // 1. 在数据库创建 Agent
    const agent = await Agent.create({
      name: id,
      display_name: `${emoji} ${name}`,
      description: `${role} - ${description}`,
      capabilities: JSON.stringify(capabilities),
      config: JSON.stringify({ status })
    })
    
    // 2. 调用 OpenClaw API 创建会话
    const openclawResponse = await fetch('http://localhost:18792/sessions/spawn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: id,
        task: `欢迎 ${name} 加入团队！`,
        model: 'bailian/qwen3.5-plus'
      })
    })
    
    // 3. 返回结果
    res.json({
      success: true,
      data: agent,
      message: 'Agent 创建成功，已同步到 OpenClaw'
    })
    
  } catch (error) {
    next(error)
  }
}
```

---

### 5️⃣ 查看 Agent 配置文件

**入口**：
- 成员列表点击"查看"
- 或点击 Agent 头像/名字

**UI 设计**：
```
┌─────────────────────────────────────────┐
│ 🤖 小软 - Agent 配置                    │
├─────────────────────────────────────────┤
│ 基本信息                                │
│ ┌─────────────────────────────────┐    │
│ │ Agent ID:     xiaoruan          │    │
│ │ 显示名称：   小软 🤖             │    │
│ │ 角色：       全栈工程师          │    │
│ │ 状态：       🟢 在线            │    │
│ │ 描述：       负责前后端开发      │    │
│ └─────────────────────────────────┘    │
│                                         │
│ 能力标签                                │
│ ┌─────────────────────────────────┐    │
│ │ React  Node.js  Python  MySQL   │    │
│ └─────────────────────────────────┘    │
│                                         │
│ OpenClaw 配置                           │
│ ┌─────────────────────────────────┐    │
│ │ 会话 Key:   agent:xiaoruan:main │    │
│ │ 模型：      qwen3.5-plus        │    │
│ │ 最后活动：  2 分钟前             │    │
│ │ Token 使用：187,232             │    │
│ └─────────────────────────────────┘    │
│                                         │
│ 配置文件内容（只读显示）                │
│ ┌─────────────────────────────────┐    │
│ │ {                               │    │
│ │   "agentId": "xiaoruan",        │    │
│ │   "workspace": "...",           │    │
│ │   "model": "qwen3.5-plus",      │    │
│ │   "tasks": [...]                │    │
│ │ }                               │    │
│ └─────────────────────────────────┘    │
│                                         │
│              [关闭]  [编辑] [删除]      │
└─────────────────────────────────────────┘
```

---

### 6️⃣ 配置文件显示内容

**显示信息**：

#### 基本信息
- Agent ID
- 显示名称（含 Emoji）
- 角色
- 状态（在线/离线/忙碌）
- 描述

#### 能力标签
- 技能标签列表
- 可视化展示

#### OpenClaw 配置
- 会话 Key（`agent:{id}:main`）
- 使用的模型
- 最后活动时间
- Token 使用统计

#### 配置文件内容
- JSON 格式显示
- 只读模式
- 可复制
- 语法高亮

---

### 7️⃣ 编辑 Agent 配置

**入口**：
- 查看页面点击"编辑"按钮

**可编辑字段**：
- ✅ 显示名称
- ✅ Emoji
- ✅ 角色
- ✅ 描述
- ✅ 能力标签
- ✅ 状态

**不可编辑字段**：
- ❌ Agent ID（创建后不可改）

**编辑流程**：
```
1. 点击"编辑"
   ↓
2. 弹出编辑表单（预填充当前值）
   ↓
3. 修改字段
   ↓
4. 点击"保存"
   ↓
5. 调用 API：PUT /api/v1/agents/:id
   ↓
6. 更新数据库
   ↓
7. 同步到 OpenClaw
   ↓
8. 刷新显示
```

---

### 8️⃣ 删除 Agent

**入口**：
- 成员列表点击"删除"
- 或查看页面点击"删除"

**删除流程**：
```
1. 点击"删除"
   ↓
2. 弹出确认对话框
   ↓
3. 确认后调用 API：DELETE /api/v1/agents/:id
   ↓
4. 从数据库删除
   ↓
5. 从 OpenClaw 删除会话
   ↓
6. 刷新成员列表
   ↓
7. 显示成功提示
```

**确认对话框**：
```
┌─────────────────────────────────┐
│ ⚠️ 确认删除                      │
├─────────────────────────────────┤
│ 确定要删除 Agent "小软 🤖" 吗？  │
│                                 │
│ 此操作将：                       │
│ - 从数据库删除 Agent            │
│ - 从 OpenClaw 删除会话          │
│ - 删除相关任务数据              │
│                                 │
│ ⚠️ 此操作不可恢复！              │
├─────────────────────────────────┤
│          [取消]  [确认删除]      │
└─────────────────────────────────┘
```

---

## 🏗️ 技术架构

### 前端架构

```
MemberList.jsx
├── 新建 Agent 按钮
│   └── 点击 → 打开 CreateAgentModal
│
├── CreateAgentModal（新建对话框）
│   ├── 表单字段验证
│   ├── 提交创建请求
│   └── 成功后刷新列表
│
├── AgentList（成员列表）
│   ├── 显示所有 Agent
│   ├── 每个 Agent 有操作按钮
│   └── 点击"查看" → 打开 AgentDetailModal
│
└── AgentDetailModal（详情对话框）
    ├── 显示 Agent 信息
    ├── 显示配置文件（JSON）
    ├── 显示 OpenClaw 配置
    └── 操作按钮（编辑/删除）
```

---

### 后端架构

```
Agent API (/api/v1/agents)
├── Controller (AgentController.js)
│   ├── list()          # GET / - 获取列表
│   ├── create()        # POST / - 创建 Agent
│   ├── get()           # GET /:id - 获取详情
│   ├── update()        # PUT /:id - 更新
│   └── delete()        # DELETE /:id - 删除
│
├── Service (agentService.js)
│   ├── createAgent()
│   │   ├── 创建数据库记录
│   │   └── 调用 OpenClaw API
│   │
│   ├── syncToOpenClaw()
│   │   └── 调用 sessions/spawn API
│   │
│   └── deleteAgent()
│       ├── 删除数据库记录
│       └── 删除 OpenClaw 会话
│
└── OpenClaw API 集成
    └── POST /sessions/spawn
```

---

### 数据流

```
用户新建 Agent
    ↓
前端表单提交
    ↓
POST /api/v1/agents
    ↓
AgentController.create()
    ↓
AgentService.createAgent()
    ├── Agent.create() → 数据库
    └── OpenClaw sessions/spawn → OpenClaw
    ↓
返回创建结果
    ↓
前端刷新列表
    ↓
显示成功提示
```

---

## 📊 API 接口设计

### GET /api/v1/agents

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "xiaoruan",
      "name": "小软",
      "display_name": "🤖 小软",
      "role": "全栈工程师",
      "description": "负责前后端开发",
      "capabilities": ["React", "Node.js", "Python"],
      "status": "active",
      "created_at": "2026-03-15T16:30:00Z"
    }
  ]
}
```

---

### POST /api/v1/agents

**请求**：
```json
{
  "id": "xiaoruan",
  "name": "小软",
  "emoji": "🤖",
  "role": "全栈工程师",
  "description": "负责前后端开发",
  "capabilities": ["React", "Node.js", "Python"],
  "status": "active"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "xiaoruan",
    "name": "小软",
    "display_name": "🤖 小软",
    ...
  },
  "message": "Agent 创建成功，已同步到 OpenClaw"
}
```

---

### GET /api/v1/agents/:id

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "xiaoruan",
    "name": "小软",
    "display_name": "🤖 小软",
    "role": "全栈工程师",
    "description": "负责前后端开发",
    "capabilities": ["React", "Node.js", "Python"],
    "status": "active",
    "config": {
      "session_key": "agent:xiaoruan:main",
      "model": "qwen3.5-plus",
      "last_activity": "2026-03-15T16:30:00Z",
      "token_usage": 187232
    },
    "created_at": "2026-03-15T16:30:00Z"
  }
}
```

---

### PUT /api/v1/agents/:id

**请求**：
```json
{
  "name": "小软",
  "emoji": "🤖",
  "role": "高级全栈工程师",
  "description": "负责前后端开发和技术架构",
  "capabilities": ["React", "Node.js", "Python", "MySQL"],
  "status": "active"
}
```

**响应**：
```json
{
  "success": true,
  "data": {...},
  "message": "Agent 更新成功"
}
```

---

### DELETE /api/v1/agents/:id

**响应**：
```json
{
  "success": true,
  "message": "Agent 已删除"
}
```

---

## 🎨 UI 组件设计

### CreateAgentModal.jsx

```jsx
function CreateAgentModal({ visible, onCancel, onSuccess }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      const result = await response.json()
      
      if (result.success) {
        message.success('Agent 创建成功！')
        onSuccess()
        form.resetFields()
      }
    } catch (error) {
      message.error('创建失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="➕ 新建 Agent"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="agentId" label="Agent ID" rules={[{ required: true }]}>
          <Input placeholder="例如：xiaoruan" />
        </Form.Item>
        
        <Form.Item name="displayName" label="显示名称" rules={[{ required: true }]}>
          <Input placeholder="例如：小软" />
        </Form.Item>
        
        <Form.Item name="emoji" label="Emoji" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="🤖">🤖 机器人</Select.Option>
            <Select.Option value="🌸">🌸 花朵</Select.Option>
            <Select.Option value="🔍">🔍 放大镜</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item name="role" label="角色" rules={[{ required: true }]}>
          <Input placeholder="例如：全栈工程师" />
        </Form.Item>
        
        <Form.Item name="description" label="描述">
          <TextArea rows={3} placeholder="描述 Agent 的职责" />
        </Form.Item>
        
        <Form.Item name="capabilities" label="能力标签">
          <Select mode="multiple">
            <Select.Option value="React">React</Select.Option>
            <Select.Option value="Node.js">Node.js</Select.Option>
            <Select.Option value="Python">Python</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            确认创建
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
```

---

### AgentDetailModal.jsx

```jsx
function AgentDetailModal({ agent, visible, onCancel, onEdit, onDelete }) {
  if (!agent) return null

  return (
    <Modal
      title={`${agent.emoji} ${agent.name} - Agent 配置`}
      open={visible}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>关闭</Button>
          <Button onClick={() => onEdit(agent)}>编辑</Button>
          <Button danger onClick={() => onDelete(agent)}>删除</Button>
        </Space>
      }
    >
      <Descriptions title="基本信息" bordered column={1}>
        <Descriptions.Item label="Agent ID">{agent.id}</Descriptions.Item>
        <Descriptions.Item label="显示名称">{agent.display_name}</Descriptions.Item>
        <Descriptions.Item label="角色">{agent.role}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={agent.status === 'active' ? 'green' : 'default'}>
            {agent.status === 'active' ? '🟢 在线' : '⚪ 离线'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="描述">{agent.description}</Descriptions.Item>
      </Descriptions>
      
      <Divider>能力标签</Divider>
      <Space wrap>
        {agent.capabilities?.map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Space>
      
      <Divider>OpenClaw 配置</Divider>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="会话 Key">
          <code>agent:{agent.id}:main</code>
        </Descriptions.Item>
        <Descriptions.Item label="模型">qwen3.5-plus</Descriptions.Item>
        <Descriptions.Item label="最后活动">2 分钟前</Descriptions.Item>
        <Descriptions.Item label="Token 使用">
          {agent.config?.token_usage?.toLocaleString() || 0}
        </Descriptions.Item>
      </Descriptions>
      
      <Divider>配置文件（JSON）</Divider>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: 16, 
        borderRadius: 8,
        overflow: 'auto',
        maxHeight: 300
      }}>
        {JSON.stringify(agent.config || {}, null, 2)}
      </pre>
    </Modal>
  )
}
```

---

## ⚠️ 注意事项

### 1. 权限控制
- ✅ 只有管理员可以创建 Agent
- ✅ 只能编辑/删除自己创建的 Agent
- ✅ 删除需要二次确认

### 2. 数据验证
- ✅ Agent ID 唯一性检查
- ✅ 必填字段验证
- ✅ 格式验证（ID 只能包含字母数字下划线）

### 3. 错误处理
- ✅ OpenClaw 不可用时显示警告
- ✅ 创建失败时回滚数据库
- ✅ 显示详细错误信息

### 4. 同步机制
- ✅ 创建时同步到 OpenClaw
- ✅ 更新时同步配置
- ✅ 删除时清理 OpenClaw 会话

---

## ✅ 实现步骤

### Phase 1: 后端 API（3-4 小时）
- [ ] 创建 AgentController
- [ ] 实现 create() 函数
- [ ] 实现 get() 函数
- [ ] 实现 update() 函数
- [ ] 实现 delete() 函数
- [ ] 集成 OpenClaw API
- [ ] 单元测试

### Phase 2: 前端组件（3-4 小时）
- [ ] 创建 CreateAgentModal 组件
- [ ] 创建 AgentDetailModal 组件
- [ ] 修改 MemberList.jsx 添加按钮
- [ ] 实现 API 调用
- [ ] 错误处理
- [ ] 加载状态

### Phase 3: 测试优化（1-2 小时）
- [ ] 功能测试
- [ ] 边界测试
- [ ] UI 优化
- [ ] 性能优化
- [ ] 文档更新

---

## 📈 预期效果

### 用户体验
- ✅ 一键创建 Agent
- ✅ 自动同步到 OpenClaw
- ✅ 实时显示配置信息
- ✅ 无需手动操作

### 技术价值
- ✅ 自动化管理
- ✅ 减少人工操作
- ✅ 提高开发效率
- ✅ 配置可视化

---

## 🔗 相关链接

- 前端文件：
  - `frontend/src/pages/MemberList.jsx`
  - `frontend/src/components/CreateAgentModal.jsx`（待创建）
  - `frontend/src/components/AgentDetailModal.jsx`（待创建）

- 后端文件：
  - `backend/src/controllers/AgentController.js`
  - `backend/src/services/agentService.js`（待创建）

- OpenClaw API：
  - `POST /sessions/spawn`
  - `GET /sessions/list`
  - `DELETE /sessions/:id`

---

*最后更新：2026-03-15 16:25*  
*维护者：白小白 🌸*
