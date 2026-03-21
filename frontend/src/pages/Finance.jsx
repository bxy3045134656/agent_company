import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Spin, Alert, Typography, Divider, Select } from 'antd'
import {
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  PieChartOutlined,
  LineChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Pie, Line } from '@ant-design/charts'
import axios from 'axios'

const { Title, Text } = Typography
const { Option } = Select

// 从环境变量读取 API 地址
const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost'
const API_PORT = import.meta.env.VITE_API_PORT || '3001'
const API_BASE = `${API_HOST}:${API_PORT}/api/v1`

function Finance() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [trendMonths, setTrendMonths] = useState(12)

  const loadFinanceData = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE}/finance/overview`)
      if (response.data.success) {
        setData(response.data.data)
      }
    } catch (err) {
      console.error('加载财务数据失败:', err)
      setError('加载失败，请检查后端服务')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadFinanceData()
  }, [])

  const handleRefresh = () => loadFinanceData()

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      ...data,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 收入来源饼图
  const incomePieConfig = {
    appendPadding: 10,
    data: data?.income?.bySource || [],
    angleField: 'amount',
    colorField: 'source',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  }

  // 成本分类饼图
  const costPieConfig = {
    appendPadding: 10,
    data: data?.cost?.byCategory || [],
    angleField: 'amount',
    colorField: 'category',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  }

  // 利润趋势图
  const profitLineConfig = {
    data: data?.profit?.trend?.map(d => [
      { month: d.month, type: '收入', value: d.income },
      { month: d.month, type: '成本', value: d.cost },
      { month: d.month, type: '利润', value: d.profit },
    ]).flat() || [],
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: { appear: { animation: 'path-in', duration: 1000 } },
    color: ['#52c41a', '#ff4d4f', '#1890ff'],
  }

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
              <DollarOutlined style={{ marginRight: 12 }} />
              财务系统
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>收入追踪 + 成本分析 + 利润趋势</Text>
          </div>
          <Space wrap>
            <Select value={trendMonths} onChange={setTrendMonths} style={{ width: 120 }}>
              <Option value={6}>最近 6 月</Option>
              <Option value={12}>最近 12 月</Option>
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
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic title="总收入" value={data?.income?.total || 0} prefix={<RiseOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} suffix="元" />
              <Divider style={{ margin: '12px 0' }} />
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">今日</Text><Text strong>{data?.income?.today?.toLocaleString() || 0}</Text></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">本周</Text><Text strong>{data?.income?.thisWeek?.toLocaleString() || 0}</Text></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">本月</Text><Text strong>{data?.income?.thisMonth?.toLocaleString() || 0}</Text></div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic title="总成本" value={data?.cost?.total || 0} prefix={<FallOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: '#ff4d4f' }} suffix="元" />
              <Divider style={{ margin: '12px 0' }} />
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">今日</Text><Text strong>{data?.cost?.today?.toLocaleString() || 0}</Text></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">本周</Text><Text strong>{data?.cost?.thisWeek?.toLocaleString() || 0}</Text></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">本月</Text><Text strong>{data?.cost?.thisMonth?.toLocaleString() || 0}</Text></div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic title="总利润" value={data?.profit?.total || 0} prefix={<DollarOutlined style={{ color: '#1890ff' }} />} valueStyle={{ color: '#1890ff' }} suffix="元" />
              <Divider style={{ margin: '12px 0' }} />
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">利润率</Text><Text strong>{data?.profit?.margin?.toFixed(1) || 0}%</Text></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">净利润</Text><Text strong>{(data?.profit?.total || 0).toLocaleString()}</Text></div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 图表 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title={<><PieChartOutlined /> 收入来源</>}>
              <Pie {...incomePieConfig} height={300} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title={<><PieChartOutlined /> 成本分类</>}>
              <Pie {...costPieConfig} height={300} />
            </Card>
          </Col>
        </Row>

        {/* 利润趋势 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title={<><LineChartOutlined /> 利润趋势</>}>
              <Line {...profitLineConfig} height={350} />
            </Card>
          </Col>
        </Row>

        {/* 明细表格 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="💰 收入来源明细">
              <Table
                dataSource={data?.income?.bySource?.map((item, i) => ({ ...item, key: i })) || []}
                pagination={false}
                columns={[
                  { title: '来源', dataIndex: 'source', render: (v) => <Tag color="green">{v}</Tag> },
                  { title: '金额 (元)', dataIndex: 'amount', render: (v) => `¥${v?.toLocaleString()}` },
                  { title: '占比', dataIndex: 'percent', render: (v) => `${v?.toFixed(1)}%` },
                ]}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="💸 成本分类明细">
              <Table
                dataSource={data?.cost?.byCategory?.map((item, i) => ({ ...item, key: i })) || []}
                pagination={false}
                columns={[
                  { title: '分类', dataIndex: 'category', render: (v) => <Tag color="orange">{v}</Tag> },
                  { title: '金额 (元)', dataIndex: 'amount', render: (v) => `¥${v?.toLocaleString()}` },
                  { title: '占比', dataIndex: 'percent', render: (v) => `${v?.toFixed(1)}%` },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default Finance
