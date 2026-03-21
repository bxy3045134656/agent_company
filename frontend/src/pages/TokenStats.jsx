import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Space, Spin, Alert, Typography, Select, Divider } from 'antd'
import {
  DashboardOutlined,
  ReloadOutlined,
  DownloadOutlined,
  RiseOutlined,
  PieChartOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import { Column, Pie } from '@ant-design/charts'
import axios from 'axios'

const { Title, Text } = Typography
const { Option } = Select

// 从环境变量读取 API 地址
const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost'
const API_PORT = import.meta.env.VITE_API_PORT || '3001'
const API_BASE = `${API_HOST}:${API_PORT}/api/v1`

function TokenStats() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [trendDays, setTrendDays] = useState(7)

  const loadTokenStats = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE}/token-stats`, {
        params: { days: trendDays },
      })
      if (response.data.success) {
        setData(response.data.data)
      }
    } catch (err) {
      console.error('加载 Token 统计失败:', err)
      setError('加载失败，请检查后端服务')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadTokenStats()
  }, [trendDays])

  const handleRefresh = () => loadTokenStats()

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      ...data,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `token-stats-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 饼图配置 - 模型分布
  const pieConfig = {
    appendPadding: 10,
    data: data?.byModel?.map(item => ({
      type: item.model,
      value: item.input + item.output,
    })) || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  }

  // 柱状图配置 - 趋势
  const columnConfig = {
    data: data?.trend || [],
    isGroup: true,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    columnWidthRatio: 0.5,
    animation: { appear: { animation: 'path-in', duration: 1000 } },
  }

  const trendData = data?.trend?.map(d => [
    { date: d.date, type: '输入', value: d.input },
    { date: d.date, type: '输出', value: d.output },
  ]).flat() || []

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
              <DashboardOutlined style={{ marginRight: 12 }} />
              Token 使用统计
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>监控各模型 Token 使用量和成本</Text>
          </div>
          <Space wrap>
            <Select value={trendDays} onChange={setTrendDays} style={{ width: 120 }}>
              <Option value={7}>最近 7 天</Option>
              <Option value={30}>最近 30 天</Option>
            </Select>
            <Button size="large" type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button size="large" type="primary" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
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
              <Statistic title="总 Token 使用量" value={data?.overview?.total || 0} prefix={<RiseOutlined style={{ color: '#667eea' }} />} valueStyle={{ color: '#667eea' }} suffix="tokens" />
              <Divider style={{ margin: '12px 0' }} />
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">输入</Text><Text strong>{data?.overview?.input?.toLocaleString() || 0}</Text></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">输出</Text><Text strong>{data?.overview?.output?.toLocaleString() || 0}</Text></div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic title="总成本" value={data?.cost?.total || 0} prefix={<DollarOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} suffix="元" />
              <Divider style={{ margin: '12px 0' }} />
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">今日</Text><Text strong>{data?.cost?.today?.toFixed(2) || 0}</Text></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">本周</Text><Text strong>{data?.cost?.thisWeek?.toFixed(2) || 0}</Text></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">本月</Text><Text strong>{data?.cost?.thisMonth?.toFixed(2) || 0}</Text></div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <Card hoverable title={<><PieChartOutlined /> 模型分布</>}>
              <Pie {...pieConfig} height={200} />
            </Card>
          </Col>
        </Row>

        {/* 趋势图表 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="📈 使用趋势">
              <Column {...columnConfig} height={300} xField="date" yField="value" seriesField="type" />
            </Card>
          </Col>
        </Row>

        {/* 模型详情表格 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="🤖 模型使用详情">
              <Table
                dataSource={data?.byModel?.map((item, index) => ({ ...item, key: index })) || []}
                pagination={false}
                columns={[
                  { title: '模型', dataIndex: 'model', key: 'model', render: (text) => <Tag color="blue">{text}</Tag> },
                  { title: '输入 Token', dataIndex: 'input', key: 'input', render: (v) => v?.toLocaleString() },
                  { title: '输出 Token', dataIndex: 'output', key: 'output', render: (v) => v?.toLocaleString() },
                  { title: '总计', key: 'total', render: (_, r) => (r.input + r.output).toLocaleString() },
                  { title: '成本 (元)', dataIndex: 'cost', key: 'cost', render: (v) => `¥${v?.toFixed(2)}` },
                  {
                    title: '占比',
                    key: 'percent',
                    render: (_, r) => {
                      const total = data?.byModel?.reduce((sum, m) => sum + m.input + m.output, 0) || 1
                      const percent = Math.round((r.input + r.output) / total * 100)
                      return <Progress percent={percent} size="small" />
                    },
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default TokenStats
