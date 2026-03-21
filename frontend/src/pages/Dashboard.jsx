import React, { useEffect, useState, useCallback } from 'react'
import { Card, Row, Col, Statistic, Progress, List, Tag, Button, Space, Spin, Alert, Typography, Badge, Switch, Divider } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ReloadOutlined,
  PlusOutlined,
  WifiOutlined,
  DisconnectOutlined,
  SunOutlined,
  MoonOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import useDashboardWebSocket from '../hooks/useDashboardWebSocket'
import { Line } from '@ant-design/charts'

const { Title, Text } = Typography

// 从环境变量读取 API 地址
const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost'
const API_PORT = import.meta.env.VITE_API_PORT || '3001'
const API_BASE = `${API_HOST}:${API_PORT}/api/v1`

function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  const handleWebSocketUpdate = useCallback((wsData) => {
    if (wsData.type === 'heartbeat' || wsData.type === 'agent_update' || wsData.type === 'task_update') {
      loadDashboard(true)
    }
  }, [])

  const { connected } = useDashboardWebSocket(handleWebSocketUpdate)

  const loadDashboard = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE}/dashboard`)
      if (response.data.success) {
        setData(response.data.data)
      }
    } catch (err) {
      console.error('加载仪表盘失败:', err)
      if (!silent) setError('加载失败，请检查后端服务')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleRefresh = () => loadDashboard()

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      agents: data?.agents,
      tasks: data?.tasks,
      projects: data?.projects,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const themeStyles = darkMode
    ? {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
      }
    : {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
      }

  return (
    <div style={{ padding: '24px', minHeight: '100vh', transition: 'all 0.3s' }}>
      {/* 头部 */}
      <div style={{ ...themeStyles, margin: '-24px -24px 24px -24px', padding: '48px 24px', borderRadius: '0 0 24px 24px', boxShadow: '0 4px 24px rgba(102, 126, 234, 0.3)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={1} style={{ color: 'white', marginBottom: 8, margin: 0 }}>
              <DashboardOutlined style={{ marginRight: 12 }} />
              仪表盘
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>实时监控团队状态和项目进度</Text>
          </div>
          <Space wrap>
            <Tag icon={connected ? <WifiOutlined /> : <DisconnectOutlined />} color={connected ? 'success' : 'error'}>
              {connected ? '实时连接中' : '连接断开'}
            </Tag>
            <Switch
              checked={darkMode}
              onChange={setDarkMode}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              style={{ background: darkMode ? '#1890ff' : '#faad14' }}
            />
            <Button size="large" type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button size="large" type="primary" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
            <Button size="large" type="default" icon={<PlusOutlined />} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
              创建任务
            </Button>
          </Space>
        </div>
      </div>

      {error && <Alert message="⚠️ 加载失败" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      <Spin spinning={loading}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ transition: 'transform 0.3s', ':hover': { transform: 'translateY(-5px)' } }}>
              <Statistic title="活跃 Agent" value={data?.agents?.online || 0} suffix={`/ ${data?.agents?.total || 0}`} prefix={<TeamOutlined style={{ color: '#667eea' }} />} valueStyle={{ color: '#667eea' }} />
              <div style={{ marginTop: 16 }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">在线</Text><Badge status="success" text={data?.agents?.online || 0} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">忙碌</Text><Badge status="processing" text={data?.agents?.busy || 0} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">离线</Text><Badge status="default" text={data?.agents?.offline || 0} /></div>
                </Space>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic title="任务总数" value={data?.tasks?.total || 0} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
              <div style={{ marginTop: 16 }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">进行中</Text><Badge status="processing" text={data?.tasks?.inProgress || 0} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">已完成</Text><Badge status="success" text={data?.tasks?.completed || 0} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">待处理</Text><Badge status="default" text={data?.tasks?.pending || 0} /></div>
                </Space>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic title="今日完成" value={data?.tasks?.todayCompleted || 0} prefix={<FireOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} />
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary">本周完成</Text>
                  <Tag color="blue">{data?.tasks?.weekCompleted || 0}</Tag>
                </div>
                <Progress percent={Math.round((data?.tasks?.todayCompleted || 0) / Math.max((data?.tasks?.total || 1), 1) * 100)} size="small" strokeColor={{ '0%': '#faad14', '100%': '#52c41a' }} style={{ marginTop: 8 }} />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic title="项目进度" value={data?.projects?.[0]?.progress || 0} suffix="%" prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1' }} />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">{data?.projects?.[0]?.name || 'Agent Company'}</Text>
                <Progress percent={data?.projects?.[0]?.progress || 0} strokeColor={{ '0%': '#722ed1', '100%': '#13c2c2' }} style={{ marginTop: 8 }} />
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" size="small">已完成 {data?.projects?.[0]?.completedTasks || 0}/{data?.projects?.[0]?.totalTasks || 0}</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 图表和最近活动 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="📊 任务趋势">
              <Line
                height={300}
                data={[
                  { date: '周一', value: 5 },
                  { date: '周二', value: 8 },
                  { date: '周三', value: 12 },
                  { date: '周四', value: 15 },
                  { date: '周五', value: data?.tasks?.completed || 0 },
                ]}
                xField="date"
                yField="value"
                smooth
                animation={{ appear: { animation: 'path-in', duration: 1000 } }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="📝 最近活动" extra={<Button type="link" onClick={handleRefresh}><ReloadOutlined /> 刷新</Button>}>
              <List dataSource={data?.activities || []} locale={{ emptyText: '暂无活动' }} renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Space><Tag color={item.status === 'completed' ? 'green' : item.status === 'in_progress' ? 'blue' : item.status === 'failed' ? 'red' : 'default'}>{item.action}</Tag><Text strong>{item.title}</Text></Space>}
                    description={<Space><Text type="secondary">负责人：{item.agent}</Text><Text type="secondary">•</Text><Text type="secondary">{new Date(item.timestamp).toLocaleString('zh-CN')}</Text></Space>}
                  />
                </List.Item>
              )} />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default Dashboard
