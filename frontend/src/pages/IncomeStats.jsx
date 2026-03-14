import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Table, Tag, Space, Typography, Statistic, Progress, DatePicker, Button, Input } from 'antd'
import {
  DollarOutlined,
  RiseOutlined,
  PieChartOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { Line, Pie } from '@ant-design/plots'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

// 收入分类颜色
const CATEGORY_COLORS = {
  '软件开发': '#667eea',
  'AI 咨询': '#13c2c2',
  '技术服务': '#52c41a',
  '产品设计': '#722ed1',
  '其他': '#faad14',
}

function IncomeStats() {
  const [incomes, setIncomes] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)
  const [searchText, setSearchText] = useState('')

  // 加载收入数据
  useEffect(() => {
    loadIncomes()
  }, [])

  const loadIncomes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (dateRange && dateRange[0]) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'))
      }
      if (dateRange && dateRange[1]) {
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'))
      }
      
      const response = await fetch(`/api/v1/finance/incomes?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setIncomes(result.data.list)
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('加载收入数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 导出报表
  const handleExport = () => {
    const startDate = dateRange ? dateRange[0].format('YYYY-MM-DD') : '2026-03-01'
    const endDate = dateRange ? dateRange[1].format('YYYY-MM-DD') : '2026-03-31'
    window.open(`/api/v1/finance/report?startDate=${startDate}&endDate=${endDate}`, '_blank')
  }

  // 收入趋势图配置
  const trendConfig = {
    data: stats ? Object.entries(stats.byMonth).map(([month, value]) => ({
      month,
      value,
      type: '收入'
    })) : [],
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#667eea'],
    point: {
      size: 5,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  }

  // 收入分类饼图配置
  const pieConfig = {
    appendPadding: 10,
    data: stats ? Object.entries(stats.byCategory).map(([category, value]) => ({
      type: category,
      value
    })) : [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    color: Object.values(CATEGORY_COLORS),
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  }

  // 表格列定义
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      width: 120,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      filters: Object.keys(CATEGORY_COLORS).map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value,
      render: (category) => (
        <Tag color={CATEGORY_COLORS[category] || 'default'}>
          {category}
        </Tag>
      ),
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          project: { text: '项目', color: 'blue' },
          service: { text: '服务', color: 'green' },
          other: { text: '其他', color: 'default' },
        }
        const config = typeMap[type] || typeMap.other
        return <Tag color={config.color}>{config.text}</Tag>
      },
      width: 80,
    },
    {
      title: '客户',
      dataIndex: 'client',
      key: 'client',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          ¥{amount.toLocaleString()}
        </Text>
      ),
      width: 120,
    },
  ]

  // 筛选后的数据
  const filteredIncomes = incomes.filter(item => {
    if (!searchText) return true
    return (
      item.description?.includes(searchText) ||
      item.client?.includes(searchText) ||
      item.category?.includes(searchText)
    )
  })

  return (
    <div>
      {/* 头部 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #52c41a 0%, #13c2c2 100%)', 
        margin: '-24px -24px 24px -24px', 
        padding: '48px 24px', 
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 24px rgba(82, 196, 26, 0.3)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
              <DollarOutlined style={{ marginRight: 12 }} />
              💰 收入统计
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
              实时追踪公司收入情况，分析收入趋势和分类
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleExport}
            size="large"
            style={{ background: 'white', color: '#52c41a' }}
          >
            导出报表
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="总收入"
                value={stats.total}
                prefix="¥"
                precision={2}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="收入笔数"
                value={stats.count}
                suffix="笔"
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="平均单笔"
                value={stats.count > 0 ? stats.total / stats.count : 0}
                prefix="¥"
                precision={2}
                valueStyle={{ color: '#667eea' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="月度增长"
                value={12.5}
                suffix="%"
                valueStyle={{ color: '#faad14' }}
              />
              <Progress percent={65} size="small" style={{ marginTop: 8 }} />
            </Card>
          </Col>
        </Row>
      )}

      {/* 筛选工具栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <RangePicker 
            onChange={setDateRange}
            onOk={loadIncomes}
          />
          <Input.Search
            placeholder="搜索描述、客户、分类"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={loadIncomes}
            style={{ width: 300 }}
            allowClear
          />
          <Button type="primary" onClick={loadIncomes}>
            查询
          </Button>
        </Space>
      </Card>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<><RiseOutlined /> 收入趋势</>}>
            <Line {...trendConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><PieChartOutlined /> 收入分类</>}>
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* 数据表格 */}
      <Card title="📊 收入明细">
        <Table
          columns={columns}
          dataSource={filteredIncomes}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  )
}

export default IncomeStats
