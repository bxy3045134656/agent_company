import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Spin, Alert, Typography, Progress, Badge } from 'antd'
import {
  AppstoreOutlined,
  ReloadOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import axios from 'axios'

const { Title, Text } = Typography

const API_BASE = 'http://localhost:3001/api/v1'

function WorkflowManagement() {
  const [loading, setLoading] = useState(false)
  const [queueData, setQueueData] = useState(null)
  const [agents, setAgents] = useState([])
  const [error, setError] = useState(null)

  const loadWorkflowData = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const [queueRes, agentsRes] = await Promise.all([
        axios.get(`${API_BASE}/workflow/queue`),
        axios.get(`${API_BASE}/workflow/agents/load`),
      ])
      if (queueRes.data.success) setQueueData(queueRes.data.data)
      if (agentsRes.data.success) setAgents(agentsRes.data.data)
    } catch (err) {
      console.error('加载工作流数据失败:', err)
      setError('加载失败，请检查后端服务')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflowData()
  }, [])

  const handleRefresh = () => loadWorkflowData()

  const handleProcessQueue = async () => {
    try {
      await axios.post(`${API_BASE}/workflow/process`)
      loadWorkflowData(true)
    } catch (err) {
      console.error('处理队列失败:', err)
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      pending: { color: 'default', text: '待分配' },
      assigned: { color: 'processing', text: '已分配' },
      completed: { color: 'success', text: '已完成' },
    }
    const s = map[status] || map.pending
    return <Badge color={s.color} text={s.text} />
  }

  const queueColumns = [
    { title: '任务 ID', dataIndex: 'id', key: 'id', width: 180 },
    { title: '任务标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '优先级', dataIndex: 'priority', key: 'priority', render: (v) => (
      <Tag color={v === 'high' ? 'red' : v === 'normal' ? 'blue' : 'gray'}>
        {v === 'high' ? '高' : v === 'normal' ? '中' : '低'}
      </Tag>
    )},
    { title: '状态', dataIndex: 'status', key: 'status', render: (v) => getStatusBadge(v) },
    { title: '负责 Agent', dataIndex: 'agentId', key: 'agentId', render: (v) => v || '-' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
  ]

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      {/* 头部 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        margin: '-24px -24px 24px -24px', 
        padding: '48px 24px', 
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 24px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={1} style={{ color: 'white', marginBottom: 8, margin: 0 }}>
              <AppstoreOutlined style={{ marginRight: 12 }} />
              工作流管理
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>自动任务分配 + 智能调度</Text>
          </div>
          <Space wrap>
            <Button size="large" type="primary" icon={<PlayCircleOutlined />} onClick={handleProcessQueue}>
              处理队列
            </Button>
            <Button size="large" type="primary" icon={<PlusOutlined />}>
              添加任务
            </Button>
            <Button size="large" type="default" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
          </Space>
        </div>
      </div>

      {error && <Alert message="⚠️ 加载失败" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      <Spin spinning={loading}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic title="总任务数" value={queueData?.status?.total || 0} prefix={<AppstoreOutlined style={{ color: '#667eea' }} />} valueStyle={{ color: '#667eea' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic title="待分配" value={queueData?.status?.pending || 0} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic title="已分配" value={queueData?.status?.assigned || 0} prefix={<PlayCircleOutlined style={{ color: '#1890ff' }} />} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic title="已完成" value={queueData?.status?.completed || 0} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
        </Row>

        {/* Agent 负载状态 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="🤖 Agent 负载状态">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {agents.map(agent => (
                  <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Badge status={agent.status === 'idle' ? 'success' : 'processing'} style={{ marginRight: 8 }} />
                    <Text strong style={{ width: 100 }}>{agent.name}</Text>
                    <Progress percent={Math.min(agent.load * 20, 100)} status={agent.load > 4 ? 'exception' : 'normal'} style={{ flex: 1 }} />
                    <Tag color={agent.status === 'idle' ? 'green' : 'blue'}>{agent.status === 'idle' ? '空闲' : '工作中'}</Tag>
                    <Text type="secondary">负载：{agent.load}</Text>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 任务队列 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="📋 任务队列" extra={<Button type="link" onClick={handleRefresh}><ReloadOutlined /> 刷新</Button>}>
              <Table
                dataSource={queueData?.queue?.map((item, i) => ({ ...item, key: i })) || []}
                columns={queueColumns}
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: '暂无任务' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default WorkflowManagement
