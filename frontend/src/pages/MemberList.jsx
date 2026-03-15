import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Table, Tag, Button, Avatar, Space, Typography, Statistic, Progress, Badge, Spin, Alert } from 'antd'
import {
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { stageService } from '../services/stageService'

const { Title, Text, Paragraph } = Typography

// 默认成员配置（降级方案）
const DEFAULT_MEMBERS = [
  { 
    id: 'main', 
    name: '白小白', 
    emoji: '🌸', 
    role: '管理者',
    status: 'online',
    avatar: '#667eea',
    tasks: 5,
    completed: 3,
    files: ['IDENTITY.md', 'MEMORY.md', 'TOOLS.md']
  },
  { 
    id: 'xiaoruan', 
    name: '小软', 
    emoji: '🤖', 
    role: '全栈工程师',
    status: 'busy',
    avatar: '#13c2c2',
    tasks: 8,
    completed: 6,
    files: ['memory.md', 'task.md']
  },
  { 
    id: 'xiaoce', 
    name: '小测', 
    emoji: '🔍', 
    role: '测试工程师',
    status: 'online',
    avatar: '#722ed1',
    tasks: 6,
    completed: 4,
    files: ['memory.md', 'task.md']
  },
]

function MemberList() {
  const navigate = useNavigate()
  const [members, setMembers] = useState(DEFAULT_MEMBERS)
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState('local') // 'openclaw' | 'local'
  const [error, setError] = useState(null)

  // 加载成员列表
  const loadMembers = async (useOpenClaw = true) => {
    setLoading(true)
    setError(null)
    try {
      const agents = await stageService.getAgents({
        source: useOpenClaw ? 'openclaw' : 'local',
      })
      
      // 如果从 OpenClaw 获取到数据，转换格式
      if (agents.length > 0 && agents[0].metadata?.source === 'openclaw') {
        const transformedAgents = agents.map(agent => ({
          id: agent.id || agent.name,
          name: agent.display_name || agent.name,
          emoji: '🤖',
          role: agent.description || 'OpenClaw Agent',
          status: agent.status || 'offline',
          avatar: agent.config?.model ? '#52c41a' : '#667eea',
          tasks: 0,
          completed: 0,
          files: [],
          metadata: agent.metadata,
        }))
        setMembers(transformedAgents)
        setDataSource('openclaw')
        console.log('✅ 从 OpenClaw 加载成员列表成功:', transformedAgents.length)
      } else {
        // 使用本地数据
        setMembers(agents.length > 0 ? agents : DEFAULT_MEMBERS)
        setDataSource('local')
        console.log('⚠️ 使用本地数据')
      }
    } catch (err) {
      console.error('❌ 加载成员列表失败:', err)
      setError('加载失败，使用默认数据')
      setMembers(DEFAULT_MEMBERS)
      setDataSource('local')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadMembers(true) // 优先尝试 OpenClaw
  }, [])

  // 手动刷新
  const handleRefresh = () => {
    loadMembers(dataSource === 'openclaw')
  }

  // 获取状态标签
  const getStatusBadge = (status) => {
    const statusMap = {
      online: { color: 'success', text: '在线' },
      busy: { color: 'processing', text: '工作中' },
      offline: { color: 'default', text: '离线' },
    }
    const s = statusMap[status] || statusMap.offline
    return <Badge color={s.color} text={s.text} />
  }

  // 查看成员详情 - 跳转到个人面板
  const handleViewDetail = (record) => {
    navigate(`/members/${record.id}`)
  }

  // 成员表格列
  const memberColumns = [
    {
      title: '成员',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar size="large" style={{ backgroundColor: record.avatar, fontSize: 24 }}>
            {record.emoji}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 13 }}>{record.role}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusBadge(status),
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
      key: 'completion',
      width: 200,
      render: (_, record) => {
        const rate = Math.round((record.completed / record.tasks) * 100)
        return (
          <Progress 
            percent={rate} 
            size="small"
            strokeColor={{
              '0%': '#667eea',
              '100%': '#52c41a',
            }}
            format={(percent) => `${percent}%`}
          />
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 头部 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        margin: '-24px -24px 24px -24px', 
        padding: '48px 24px', 
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 24px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
            <TeamOutlined style={{ marginRight: 12 }} />
            成员管理
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
            AI 智能体团队 - 查看成员状态、配置文件和工作进度
          </Text>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="团队成员"
              value={members.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="在线成员"
              value={members.filter(m => m.status === 'online').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="工作中"
              value={members.filter(m => m.status === 'busy').length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="总任务数"
              value={members.reduce((sum, m) => sum + m.tasks, 0)}
              prefix={<CheckSquareOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 数据源提示 */}
      {dataSource === 'openclaw' && (
        <Alert
          message="✅ 实时数据模式"
          description="当前显示的是从 OpenClaw Gateway 获取的真实 Agent 数据"
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary" onClick={handleRefresh}>
              <ReloadOutlined /> 刷新
            </Button>
          }
        />
      )}
      
      {/* 错误提示 */}
      {error && (
        <Alert
          message="⚠️ 数据加载提示"
          description={error}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 成员列表 */}
      <Card 
        title="👥 团队成员"
        extra={
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={memberColumns}
            dataSource={members}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              onClick: () => handleViewDetail(record),
              style: { cursor: 'pointer' },
            })}
          />
        </Spin>
      </Card>

    </div>
  )
}

export default MemberList
