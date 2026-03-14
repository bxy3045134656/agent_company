import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Table, Tag, Space, Typography, Statistic, Progress, DatePicker, Button, Input } from 'antd'
import {
  WalletOutlined,
  FallOutlined,
  PieChartOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { Line, Pie } from '@ant-design/plots'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

// 成本分类颜色
const CATEGORY_COLORS = {
  '人力成本': '#f56565',
  '基础设施': '#ed8936',
  '软件订阅': '#ecc94b',
  '办公费用': '#48bb78',
  '其他': '#a0aec0',
}

function CostCalculation() {
  const [costs, setCosts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)
  const [searchText, setSearchText] = useState('')

  // 加载成本数据
  useEffect(() => {
    loadCosts()
  }, [])

  const loadCosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (dateRange && dateRange[0]) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'))
      }
      if (dateRange && dateRange[1]) {
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'))
      }
      
      const response = await fetch(`/api/v1/finance/costs?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setCosts(result.data.list)
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('加载成本数据失败:', error)
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

  // 成本趋势图配置
  const trendConfig = {
    data: stats ? Object.entries(stats.byMonth).map(([month, value]) => ({
      month,
      value,
      type: '成本'
    })) : [],
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#f56565'],
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

  // 成本分类饼图配置
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
          labor: { text: '人力', color: 'red' },
          infrastructure: { text: '基础设施', color: 'orange' },
          software: { text: '软件', color: 'gold' },
          office: { text: '办公', color: 'green' },
          other: { text: '其他', color: 'default' },
        }
        const config = typeMap[type] || typeMap.other
        return <Tag color={config.color}>{config.text}</Tag>
      },
      width: 80,
    },
    {
      title: '支付方',
      dataIndex: 'payer',
      key: 'payer',
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
        <Text strong style={{ color: '#f56565' }}>
          -¥{amount.toLocaleString()}
        </Text>
      ),
      width: 120,
    },
  ]

  // 筛选后的数据
  const filteredCosts = costs.filter(item => {
    if (!searchText) return true
    return (
      item.description?.includes(searchText) ||
      item.payer?.includes(searchText) ||
      item.category?.includes(searchText)
    )
  })

  return (
    <div>
      {/* 头部 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f56565 0%, #ed8936 100%)', 
        margin: '-24px -24px 24px -24px', 
        padding: '48px 24px', 
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 24px rgba(245, 101, 101, 0.3)'
      }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
              <WalletOutlined style={{ marginRight: 12 }} />
              💸 成本计算
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
              实时追踪公司成本支出，分析成本结构和趋势
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleExport}
            size="large"
            style={{ background: 'white', color: '#f56565' }}
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
                title="总成本"
                value={stats.total}
                prefix="¥"
                precision={2}
                valueStyle={{ color: '#f56565' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="成本笔数"
                value={stats.count}
                suffix="笔"
                valueStyle={{ color: '#ed8936' }}
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
                valueStyle={{ color: '#ecc94b' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="成本占比"
                value={45.8}
                suffix="%"
                valueStyle={{ color: '#48bb78' }}
              />
              <Progress percent={45.8} size="small" style={{ marginTop: 8 }} />
            </Card>
          </Col>
        </Row>
      )}

      {/* 筛选工具栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <RangePicker 
            onChange={setDateRange}
            onOk={loadCosts}
          />
          <Input.Search
            placeholder="搜索描述、支付方、分类"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={loadCosts}
            style={{ width: 300 }}
            allowClear
          />
          <Button type="primary" onClick={loadCosts}>
            查询
          </Button>
        </Space>
      </Card>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<><FallOutlined /> 成本趋势</>}>
            <Line {...trendConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><PieChartOutlined /> 成本分类</>}>
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* 数据表格 */}
      <Card title="📊 成本明细">
        <Table
          columns={columns}
          dataSource={filteredCosts}
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

export default CostCalculation
