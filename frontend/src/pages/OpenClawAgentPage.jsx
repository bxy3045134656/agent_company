/**
 * OpenClawAgentPage.jsx
 * OpenClaw Agent 连接页面 - 显示 OpenClaw 中所有活跃 Agent
 * @author 小软 🤖
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Space, Button, Typography, Spin, Alert, Empty, Statistic, Row, Col, Tooltip } from 'antd'
import { ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Title, Text } = Typography

// API 基础 URL
const API_BASE = 'http://localhost:3001/api/v1'

function OpenClawAgentPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  /**
   * 获取 OpenClaw 活跃 Agent
   */
  const fetchOpenClawAgents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get(`${API_BASE}/agents/openclaw/active`)
      
      if (response.data.success) {
        setAgents(response.data.data || [])
        setLastUpdate(new Date())
      } else {
        setError('获取失败')
      }
    } catch (err) {
      console.error('获取 OpenClaw Agent 失败:', err)
      setError(err.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 刷新 Agent 列表
   */
  const handleRefresh = async () => {
    try {
      const response = await axios.post(`${API_BASE}/agents/openclaw/refresh`)
      
      if (response.data.success) {
        setAgents(response.data.data || [])
        setLastUpdate(new Date())
      }
    } catch (err) {
      console.error('刷新失败:', err)
    }
  }

  useEffect(() => {
    fetchOpenClawAgents()
    
    // 每 10 秒自动刷新
    const interval = setInterval(fetchOpenClawAgents, 10000)
    
    return () => clearInterval(interval)
  }, [])

  /**
   * 状态标签渲染
   */
  const renderStatusTag = (status) => {
    if (status === 'working') {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          工作中
        </Tag>
      )
    } else if (status === 'idle') {
      return (
        <Tag icon={<ClockCircleOutlined />} color="default">
          空闲
        </Tag>
      )
    } else {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          离线
        </Tag>
      )
    }
  }

  /**
   * 表格列定义
   */
  const columns = [
    {
      title: 'Agent ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => renderStatusTag(status),
    },
    {
      title: '当前任务',
      dataIndex: 'statusText',
      key: 'statusText',
      width: 200,
      ellipsis: true,
    },
    {
      title: '任务详情',
      dataIndex: 'task',
      key: 'task',
      ellipsis: true,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 100,
      render: (progress) => (
        <span style={{ color: progress > 0 ? '#1890ff' : '#999' }}>
          {progress}%
        </span>
      ),
    },
  ]

  /**
   * 统计信息
   */
  const workingCount = agents.filter(a => a.status === 'working').length
  const idleCount = agents.filter(a => a.status === 'idle').length
  const totalCount = agents.length

  return (
    <div style={{ padding: '24px' }}>
      {/* 头部 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space>
              <Title level={2} style={{ margin: 0 }}>
                🤖 OpenClaw Agent 连接
              </Title>
              <Tooltip title="手动刷新">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={handleRefresh}
                  loading={loading}
                >
                  刷新
                </Button>
              </Tooltip>
            </Space>
            {lastUpdate && (
              <Text type="secondary" style={{ marginLeft: 16 }}>
                最后更新：{lastUpdate.toLocaleTimeString()}
              </Text>
            )}
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic 
              title="活跃 Agent" 
              value={totalCount}
              prefix="👥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="工作中" 
              value={workingCount}
              prefix="💼"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="空闲" 
              value={idleCount}
              prefix="☕"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 错误提示 */}
      {error && (
        <Alert
          message="获取失败"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" onClick={fetchOpenClawAgents}>
              重试
            </Button>
          }
        />
      )}

      {/* Agent 列表 */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" tip="正在获取 OpenClaw Agent..." />
          </div>
        ) : agents.length === 0 ? (
          <Empty 
            description="暂无活跃 Agent"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={agents}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading}
          />
        )}
      </Card>
    </div>
  )
}

export default OpenClawAgentPage
