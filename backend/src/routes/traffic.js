/**
 * 流量监控 API
 * 获取整体和单 Agent 的流量统计数据
 */

const express = require('express')
const router = express.Router()

// 模拟数据（实际需要从 OpenClaw Gateway API 获取）
function getMockData() {
  const now = Date.now()
  const agents = [
    { id: 'mama', name: '玛玛', emoji: '👩', requests: 3250, tokens: 1250000, avgTime: 180, status: 'online' },
    { id: 'nuonuo', name: '诺诺', emoji: '🦞', requests: 2800, tokens: 980000, avgTime: 220, status: 'online' },
    { id: 'mamameng', name: '码码', emoji: '🦀', requests: 2100, tokens: 850000, avgTime: 250, status: 'online' },
    { id: 'xiaoruan', name: '小软', emoji: '🤖', requests: 1800, tokens: 720000, avgTime: 300, status: 'online' },
    { id: 'xiaoce', name: '小测', emoji: '🔍', requests: 1630, tokens: 580000, avgTime: 280, status: 'offline' },
  ]

  // 生成趋势数据
  const requestTrend = []
  const tokenTrend = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000)
    requestTrend.push({
      date: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      value: Math.floor(Math.random() * 1000) + 500,
      type: 'API请求'
    })
    tokenTrend.push({
      date: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      value: Math.floor(Math.random() * 500000) + 200000,
      type: 'Token消耗'
    })
  }

  return {
    totalRequests: 12580,
    totalTokens: 4582300,
    avgResponseTime: 245,
    activeAgents: 5,
    agents,
    requestTrend,
    tokenTrend
  }
}

// 获取整体流量数据
router.get('/traffic', (req, res) => {
  const { range = '7d' } = req.query
  
  // TODO: 从 OpenClaw Gateway API 获取真实数据
  const data = getMockData()
  
  res.json({
    success: true,
    data,
    source: 'mock', // 'openclaw' or 'mock'
    range
  })
})

// 获取单 Agent 流量数据
router.get('/traffic/agent/:agentId', (req, res) => {
  const { agentId } = req.params
  const mockData = getMockData()
  
  const agentData = mockData.agents.find(a => a.id === agentId)
  
  if (!agentData) {
    return res.status(404).json({
      success: false,
      error: 'Agent 不存在'
    })
  }
  
  // 生成单个 Agent 的趋势数据
  const trend = []
  const now = Date.now()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000)
    trend.push({
      date: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      requests: Math.floor(Math.random() * 200) + 50,
      tokens: Math.floor(Math.random() * 50000) + 10000,
      avgTime: Math.floor(Math.random() * 100) + 150
    })
  }
  
  res.json({
    success: true,
    data: {
      ...agentData,
      trend
    }
  })
})

module.exports = router