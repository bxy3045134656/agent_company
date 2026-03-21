/**
 * 对话 API
 * 与 OpenClaw Agent 对话
 */

const express = require('express')
const router = express.Router()

// Agent 列表配置
const agents = [
  { id: 'mama', name: '玛玛', emoji: '👩', role: '主助手' },
  { id: 'nuonuo', name: '诺诺', emoji: '🦞', role: '系统管理' },
  { id: 'mamameng', name: '码码', emoji: '🦀', role: '全栈开发' },
  { id: 'xiaoruan', name: '小软', emoji: '🤖', role: '全栈工程师' },
  { id: 'xiaoce', name: '小测', emoji: '🔍', role: '测试工程师' },
]

// 获取 Agent 列表
router.get('/agents', (req, res) => {
  res.json({
    success: true,
    data: agents
  })
})

// 与 Agent 对话
router.post('/agents/:agentId/chat', async (req, res) => {
  const { agentId } = req.params
  const { message } = req.body

  if (!message) {
    return res.status(400).json({
      success: false,
      error: '消息不能为空'
    })
  }

  const agent = agents.find(a => a.id === agentId)
  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Agent 不存在'
    })
  }

  try {
    // TODO: 调用 OpenClaw Gateway API 发送消息
    // 实际实现需要根据 OpenClaw 的 API 来调用
    
    // 模拟响应（等 OpenClaw API 实现后替换）
    const mockResponses = [
      `收到你的消息：${message}\n\n有什么我可以帮你的吗？`,
      `我听到了：${message}\n让我想想...`,
      `好的，关于「${message}」，我可以帮你分析一下。`,
    ]
    
    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    
    res.json({
      success: true,
      message: response,
      agent: agent,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('对话请求失败:', error)
    res.status(500).json({
      success: false,
      error: '对话服务出错'
    })
  }
})

// 获取 Agent 状态
router.get('/agents/:agentId/status', (req, res) => {
  const { agentId } = req.params
  
  // TODO: 从 OpenClaw 获取真实状态
  
  res.json({
    success: true,
    data: {
      id: agentId,
      status: 'online', // online, busy, offline
      lastActive: new Date().toISOString()
    }
  })
})

module.exports = router