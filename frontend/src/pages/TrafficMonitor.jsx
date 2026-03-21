import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Spin, Alert, Typography, Select, DatePicker, Line, Area } from 'antd'
import { ReloadOutlined, DownloadOutlined, ApiOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

// 从环境变量读取 API 地址
const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost'
const API_PORT = import.meta.env.VITE_API_PORT || '3001'
const API_BASE = `${API_HOST}:${API_PORT}/api/v1`

/**
 * 流量监控页面
 * 显示整体和单 Agent 的流量数据
 */
function TrafficMonitor() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [agentData, setAgentData] = useState([])
  const [timeRange, setTimeRange] = useState('7d')
  const [error, setError] = useState(null)

  // 加载流量数据
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // 调用流量监控 API（待实现）
      const response = await axios.get(`${API_BASE}/monitor/traffic`, {
        params: { range: timeRange }
      })
      if (response.data.success) {
        setData(response.data.data)
        setAgentData(response.data.data.agents || [])
      }
    } catch (err) {
      console.error('加载流量数据失败:', err)
      setError('加载失败，请检查后端服务')
      // 使用模拟数据
      setData(getMockData())
      setAgentData(getMockAgentData())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [timeRange])

  const handleRefresh = () => loadData()

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      total: data,
      agents: agentData
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `traffic-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 头部 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            <ApiOutlined style={{ marginRight: 12 }} />
            流量监控
          </Title>
          <Text type="secondary">实时监控 API 请求量和 Token 消耗</Text>
        </div>
        <Space wrap>
          <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
            <Option value="24h">最近 24 小时</Option>
            <Option value="7d">最近 7 天</Option>
            <Option value="30d">最近 30 天</Option>
          </Select>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
          <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      {error && <Alert message={error} type="warning" showIcon style={{ marginBottom: 16 }} />}

      <Spin spinning={loading}>
        {/* 整体统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="API 请求总量"
                value={data?.totalRequests || 0}
                prefix={<ApiOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Token 消耗总量"
                value={data?.totalTokens || 0}
                prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
                suffix="tokens"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="平均响应时间"
                value={data?.avgResponseTime || 0}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
                suffix="ms"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="活跃 Agent"
                value={data?.activeAgents || 0}
                prefix={<ApiOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 流量趋势图 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="📈 请求量趋势">
              <Line
                height={300}
                data={data?.requestTrend || getMockTrendData()}
                xField="date"
                yField="value"
                seriesField="type"
                smooth
                animation={{ appear: { animation: 'path-in', duration: 1000 } }}
                color={['#1890ff', '#52c41a']}
              />
            </Card>
          </Col>
        </Row>

        {/* Token 消耗趋势 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="⚡ Token 消耗趋势">
              <Area
                height={250}
                data={data?.tokenTrend || getMockTokenTrend()}
                xField="date"
                yField="value"
                seriesField="type"
                animation={{ appear: { animation: 'path-in', duration: 1000 } }}
                color="#52c41a"
              />
            </Card>
          </Col>
        </Row>

        {/* 单 Agent 流量统计 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="🤖 单 Agent 流量统计">
              <Table
                dataSource={agentData}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                columns={[
                  {
                    title: 'Agent',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text, record) => (
                      <Space>
                        <span>{record.emoji}</span>
                        <span>{text}</span>
                      </Space>
                    )
                  },
                  {
                    title: '请求数',
                    dataIndex: 'requests',
                    key: 'requests',
                    sorter: (a, b) => a.requests - b.requests,
                  },
                  {
                    title: 'Token 消耗',
                    dataIndex: 'tokens',
                    key: 'tokens',
                    sorter: (a, b) => a.tokens - b.tokens,
                  },
                  {
                    title: '平均响应时间',
                    dataIndex: 'avgTime',
                    key: 'avgTime',
                    sorter: (a, b) => a.avgTime - b.avgTime,
                    render: (val) => `${val}ms`
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      <Tag color={status === 'online' ? 'green' : 'default'}>
                        {status === 'online' ? '在线' : '离线'}
                      </Tag>
                    )
                  }
                ]}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

// 模拟数据
function getMockData() {
  return {
    totalRequests: 12580,
    totalTokens: 4582300,
    avgResponseTime: 245,
    activeAgents: 5
  }
}

function getMockAgentData() {
  return [
    { id: 'mama', name: '玛玛', emoji: '👩', requests: 3250, tokens: 1250000, avgTime: 180, status: 'online' },
    { id: 'nuonuo', name: '诺诺', emoji: '🦞', requests: 2800, tokens: 980000, avgTime: 220, status: 'online' },
    { id: 'mamameng', name: '码码', emoji: '🦀', requests: 2100, tokens: 850000, avgTime: 250, status: 'online' },
    { id: 'xiaoruan', name: '小软', emoji: '🤖', requests: 1800, tokens: 720000, avgTime: 300, status: 'online' },
    { id: 'xiaoce', name: '小测', emoji: '🔍', requests: 1630, tokens: 580000, avgTime: 280, status: 'offline' },
  ]
}

function getMockTrendData() {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({ date: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }), value: Math.floor(Math.random() * 1000) + 500, type: 'API请求' })
  }
  return data
}

function getMockTokenTrend() {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({ date: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }), value: Math.floor(Math.random() * 500000) + 200000, type: 'Token消耗' })
  }
  return data
}

export default TrafficMonitor