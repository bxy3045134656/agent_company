import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Tag, Spin, Alert, List, Typography, Progress, Space, Badge, Button } from 'antd'
import { GithubOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Title, Text, Paragraph } = Typography

// 从环境变量读取 API 地址
const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost'
const API_PORT = import.meta.env.VITE_API_PORT || '3001'
const API_BASE = `${API_HOST}:${API_PORT}/api/v1`

function GitHubTasks() {
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)
  const [agentId] = useState('xiaoruan') // 默认显示小软的任务

  // 加载任务
  const loadTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE}/tasks/github/${agentId}`)
      if (response.data.success) {
        setTasks(response.data.data || [])
      }
    } catch (err) {
      console.error('加载任务失败:', err)
      setError('加载失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [agentId])

  // 获取状态标签
  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
      in_progress: { color: 'processing', text: '进行中', icon: <ClockCircleOutlined /> },
      pending: { color: 'default', text: '待处理', icon: <ExclamationCircleOutlined /> },
    }
    const s = statusMap[status] || statusMap.pending
    return <Badge color={s.color} text={s.text} />
  }

  // 获取优先级标签
  const getPriorityTag = (priority) => {
    const priorityMap = {
      P0: { color: 'red', text: 'P0' },
      P1: { color: 'orange', text: 'P1' },
      P2: { color: 'blue', text: 'P2' },
      normal: { color: 'default', text: '普通' },
    }
    const p = priorityMap[priority] || priorityMap.normal
    return <Tag color={p.color}>{p.text}</Tag>
  }

  // 刷新任务
  const handleRefresh = () => {
    loadTasks()
  }

  return (
    <div>
      {/* 头部 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #24292e 0%, #0366d6 100%)', 
        margin: '-24px -24px 24px -24px', 
        padding: '48px 24px', 
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 24px rgba(36, 41, 46, 0.3)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
            <GithubOutlined style={{ marginRight: 12 }} />
            GitHub 任务管理
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
            从 GitHub 读取 task.md - 实时同步 Agent 任务数据
          </Text>
        </div>
      </div>

      {/* 数据源提示 */}
      <Alert
        message="✅ GitHub 实时数据"
        description="当前显示的是从 GitHub 仓库读取的 task.md 文件内容"
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
        icon={<GithubOutlined />}
        action={
          <Button size="small" type="primary" onClick={handleRefresh} loading={loading}>
            <ReloadOutlined /> 刷新
          </Button>
        }
      />

      {/* 错误提示 */}
      {error && (
        <Alert
          message="⚠️ 加载失败"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 任务列表 */}
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {tasks.length === 0 && !loading && (
            <Col span={24}>
              <Card>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text type="secondary">暂无任务数据</Text>
                </div>
              </Card>
            </Col>
          )}

          {tasks.map((task, index) => (
            <Col span={24} key={task.id || index}>
              <Card 
                hoverable
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16} align="middle">
                  <Col flex="auto">
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Title level={4} style={{ margin: 0, flex: 1 }}>
                          {task.title}
                        </Title>
                        <Space>
                          {getPriorityTag(task.priority)}
                          {getStatusBadge(task.status)}
                        </Space>
                      </div>
                      
                      {task.description && (
                        <Paragraph 
                          type="secondary" 
                          ellipsis={{ rows: 3, expandable: true }}
                          style={{ margin: 0 }}
                        >
                          {task.description}
                        </Paragraph>
                      )}

                      {(task.dueDate || task.progress > 0) && (
                        <Row gutter={16} align="middle">
                          {task.dueDate && (
                            <Col>
                              <Text type="secondary">
                                📅 截止：{task.dueDate}
                              </Text>
                            </Col>
                          )}
                          {task.progress > 0 && (
                            <Col flex="auto">
                              <Progress 
                                percent={task.progress} 
                                size="small"
                                strokeColor={{
                                  '0%': '#1890ff',
                                  '100%': '#52c41a',
                                }}
                              />
                            </Col>
                          )}
                        </Row>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  )
}

export default GitHubTasks
