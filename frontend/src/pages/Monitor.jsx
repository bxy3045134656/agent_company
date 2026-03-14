import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Progress, Button, Table, Avatar, Space, Typography, Tag } from 'antd'
import {
  DashboardOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DollarOutlined,
  ReloadOutlined,
  UserOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'

const { Title, Text } = Typography

function Monitor() {
  const [searchParams] = useSearchParams()
  const memberParam = searchParams.get('member')
  
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    inputTokens: 0,
    outputTokens: 0,
    successRequests: 0,
    remainingRequests: 0,
    totalQuota: 0,
    estimatedCost: 0,
    quotaType: 'monthly',
    resetTime: null,
  })

  // 团队成员数据
  const members = [
    { id: 'main', name: '白小白', emoji: '🌸', role: '管理者', status: 'online', tasks: 5, completion: 100 },
    { id: 'xiaoruan', name: '小软', emoji: '🤖', role: '全栈工程师', status: 'online', tasks: 8, completion: 92 },
    { id: 'xiaoce', name: '小测', emoji: '🔍', role: '测试工程师', status: 'online', tasks: 6, completion: 88 },
  ]

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/stats')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('获取监控数据失败:', error)
      // 模拟数据
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

  const totalTokens = stats.inputTokens + stats.outputTokens
  const usedPercent = stats.totalQuota > 0 
    ? Math.round(((stats.totalQuota - stats.remainingRequests) / stats.totalQuota) * 100)
    : 0

  // 成员监控表格
  const memberColumns = [
    {
      title: '成员',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar size="large" style={{ backgroundColor: '#1890ff', fontSize: 20 }}>
            {record.emoji}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.role}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={record.status === 'online' ? 'green' : 'default'}>
          {record.status === 'online' ? '在线' : '离线'}
        </Tag>
      ),
    },
    {
      title: '任务数',
      dataIndex: 'tasks',
      key: 'tasks',
      width: 100,
      sorter: (a, b) => a.tasks - b.tasks,
    },
    {
      title: '完成率',
      dataIndex: 'completion',
      key: 'completion',
      width: 200,
      render: (completion) => (
        <div>
          <Progress 
            percent={completion} 
            size="small"
            strokeColor={{
              '0%': '#1890ff',
              '100%': '#52c41a',
            }}
          />
        </div>
      ),
    },
    {
      title: 'Token 使用',
      key: 'tokens',
      width: 150,
      render: () => (
        <Text>{Math.floor(Math.random() * 50000) + 10000}</Text>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <DashboardOutlined style={{ marginRight: 12, color: '#722ed1' }} />
          监控面板 {memberParam && ` - ${members.find(m => m.id === memberParam)?.name}`}
        </Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={fetchStats}
          loading={loading}
        >
          刷新数据
        </Button>
      </div>

      {/* 系统状态 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="系统状态"
              value="运行中"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="AI 模型"
              value="Qwen3.5-Plus"
              suffix={<span style={{ fontSize: 14, color: '#999' }}>bailian</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="服务来源"
              value="阿里云百炼"
              suffix={<span style={{ fontSize: 14, color: '#999' }}>Coding Plan</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Token 统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="输入 Token"
              value={stats.inputTokens}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="输出 Token"
              value={stats.outputTokens}
              precision={0}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总计"
              value={totalTokens}
              precision={0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 请求统计 */}
      <Card title="🔢 请求统计" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Statistic
              title="成功请求"
              value={stats.successRequests}
              precision={0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Statistic
              title="剩余请求"
              value={stats.remainingRequests}
              precision={0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Statistic
              title="总额度"
              value={stats.totalQuota}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
        
        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 8 }}>额度使用进度</div>
          <Progress 
            percent={usedPercent} 
            strokeColor={{
              '0%': '#1890ff',
              '100%': '#faad14',
            }}
            format={(percent) => `${percent}% 已使用`}
          />
        </div>
      </Card>

      {/* 成员监控 */}
      <Card title="👥 成员监控">
        <Table
          columns={memberColumns}
          dataSource={members}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: () => {
              // 点击成员查看个人监控
              window.location.hash = `/monitor?member=${record.id}`
            },
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  )
}

export default Monitor
