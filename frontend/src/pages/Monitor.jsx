import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Progress, Button, Table, Avatar, Space, Typography, Tag, Spin, Alert } from 'antd'
import {
  DashboardOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'

const { Title, Text } = Typography

const API_BASE = 'http://localhost:3001/api/v1'

function Monitor() {
  const [searchParams] = useSearchParams()
  const memberParam = searchParams.get('member')
  
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE}/agents`)
      if (response.data.success) {
        setMembers(response.data.data || [])
      }
    } catch (err) {
      console.error('获取成员数据失败:', err)
      setError('加载失败，请检查后端服务')
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
      dataIndex: 'display_name',
      key: 'display_name',
      render: (name, record) => (
        <Space>
          <Avatar size="large" style={{ backgroundColor: record.avatar || '#1890ff', fontSize: 20 }}>
            {record.emoji || '🤖'}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.description || record.role || 'Agent'}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status === 'online' ? 'green' : status === 'busy' ? 'blue' : 'default'}>
          {status === 'online' ? '在线' : status === 'busy' ? '忙碌' : '离线'}
        </Tag>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* 头部 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        margin: '-24px -24px 24px -24px', 
        padding: '48px 24px', 
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 24px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={1} style={{ color: 'white', marginBottom: 8, margin: 0 }}>
              <DashboardOutlined style={{ marginRight: 12 }} />
              监控面板
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>实时监控系统状态和 Agent 活动</Text>
          </div>
          <Button 
            size="large"
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={fetchMembers}
            loading={loading}
          >
            刷新
          </Button>
        </div>
      </div>

      {error && <Alert message="⚠️ 加载失败" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      <Spin spinning={loading}>
        {/* 系统状态 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="系统状态"
                value="运行中"
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="AI 模型"
                value="Qwen3.5-Plus"
                suffix={<span style={{ fontSize: 14, color: '#999' }}>bailian</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Agent 数量"
                value={members.length}
                suffix={`个`}
              />
            </Card>
          </Col>
        </Row>

        {/* 成员列表 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="🤖 Agent 列表" extra={<Button type="link" onClick={fetchMembers}>刷新</Button>}>
              <Table
                dataSource={members.map((m, i) => ({ ...m, key: i }))}
                columns={memberColumns}
                pagination={false}
                locale={{ emptyText: '暂无 Agent 数据' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default Monitor
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
