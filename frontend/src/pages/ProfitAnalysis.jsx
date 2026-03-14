import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Table, Tag, Space, Typography, Statistic, Progress, DatePicker, Button, Alert } from 'antd'
import {
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { Line, Column } from '@ant-design/plots'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

function ProfitAnalysis() {
  const [profitData, setProfitData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)

  // 加载利润数据
  useEffect(() => {
    loadProfitData()
  }, [])

  const loadProfitData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/finance/profit')
      const result = await response.json()
      
      if (result.success) {
        setProfitData(result.data)
      }
    } catch (error) {
      console.error('加载利润数据失败:', error)
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

  // 利润趋势图配置
  const trendConfig = {
    data: profitData?.trend || [],
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  }

  // 收支对比柱状图配置
  const columnConfig = {
    data: profitData?.trend.map(item => [
      { month: item.month, type: '收入', value: item.income },
      { month: item.month, type: '成本', value: item.cost },
      { month: item.month, type: '利润', value: item.profit },
    ]).flat() || [],
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    color: ['#52c41a', '#f56565', '#667eea'],
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  }

  // 利润率仪表数据
  const profitMargin = profitData?.profitMargin || 0
  const profitMarginColor = profitMargin > 30 ? '#52c41a' : profitMargin > 15 ? '#faad14' : '#f56565'

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
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
              <LineChartOutlined style={{ marginRight: 12 }} />
              📈 利润分析
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
              全面分析公司盈利能力，追踪利润趋势和利润率
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleExport}
            size="large"
            style={{ background: 'white', color: '#667eea' }}
          >
            导出报表
          </Button>
        </div>
      </div>

      {/* 利润预警 */}
      {profitData && profitData.totalProfit < 0 && (
        <Alert
          message="⚠️ 利润预警"
          description="当前处于亏损状态，建议审查成本结构或增加收入来源"
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          closable
        />
      )}

      {/* 统计卡片 */}
      {profitData && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="总收入"
                value={profitData.totalIncome}
                prefix="¥"
                precision={2}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="总成本"
                value={profitData.totalCost}
                prefix="¥"
                precision={2}
                valueStyle={{ color: '#f56565' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="总利润"
                value={profitData.totalProfit}
                prefix="¥"
                precision={2}
                valueStyle={{ color: profitData.totalProfit >= 0 ? '#667eea' : '#f56565' }}
                suffix={profitData.totalProfit >= 0 ? '' : '(亏损)'}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="利润率"
                value={profitData.profitMargin}
                suffix="%"
                precision={2}
                valueStyle={{ color: profitMarginColor }}
              />
              <Progress 
                percent={Math.min(100, Math.max(0, profitData.profitMargin))} 
                size="small" 
                style={{ marginTop: 8 }}
                strokeColor={profitMarginColor}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 筛选工具栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <RangePicker 
            onChange={setDateRange}
          />
          <Button type="primary" onClick={loadProfitData}>
            查询
          </Button>
        </Space>
      </Card>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><RiseOutlined /> 收支对比</>}>
            <Column {...columnConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><LineChartOutlined /> 利润趋势</>}>
            <Line 
              data={profitData?.trend.map(item => ({
                month: item.month,
                value: item.profit,
                type: '利润'
              })) || []}
              xField="month"
              yField="value"
              seriesField="type"
              smooth={true}
              color={['#667eea']}
              point={{ size: 5, shape: 'circle' }}
              height={300}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细数据表格 */}
      <Card title="📊 月度利润明细">
        {profitData && (
          <Table
            columns={[
              {
                title: '月份',
                dataIndex: 'month',
                key: 'month',
                width: 120,
              },
              {
                title: '收入',
                dataIndex: 'income',
                key: 'income',
                render: (value) => (
                  <Text strong style={{ color: '#52c41a' }}>
                    ¥{value.toLocaleString()}
                  </Text>
                ),
                width: 150,
              },
              {
                title: '成本',
                dataIndex: 'cost',
                key: 'cost',
                render: (value) => (
                  <Text strong style={{ color: '#f56565' }}>
                    ¥{value.toLocaleString()}
                  </Text>
                ),
                width: 150,
              },
              {
                title: '利润',
                dataIndex: 'profit',
                key: 'profit',
                sorter: (a, b) => a.profit - b.profit,
                render: (value) => (
                  <Text strong style={{ color: value >= 0 ? '#667eea' : '#f56565' }}>
                    {value >= 0 ? '+' : ''}¥{value.toLocaleString()}
                  </Text>
                ),
                width: 150,
              },
              {
                title: '利润率',
                key: 'margin',
                render: (_, record) => {
                  const margin = record.income > 0 
                    ? ((record.profit / record.income) * 100).toFixed(2) 
                    : 0
                  return (
                    <Tag color={margin > 30 ? 'green' : margin > 15 ? 'gold' : 'red'}>
                      {margin}%
                    </Tag>
                  )
                },
                width: 120,
              },
            ]}
            dataSource={profitData.trend}
            rowKey="month"
            pagination={false}
            summary={(pageData) => {
              const totalIncome = pageData.reduce((sum, item) => sum + item.income, 0)
              const totalCost = pageData.reduce((sum, item) => sum + item.cost, 0)
              const totalProfit = pageData.reduce((sum, item) => sum + item.profit, 0)
              const avgMargin = totalIncome > 0 
                ? ((totalProfit / totalIncome) * 100).toFixed(2) 
                : 0

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ fontWeight: 'bold', background: '#fafafa' }}>
                    <Table.Summary.Cell>合计</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text strong style={{ color: '#52c41a' }}>¥{totalIncome.toLocaleString()}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text strong style={{ color: '#f56565' }}>¥{totalCost.toLocaleString()}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text strong style={{ color: totalProfit >= 0 ? '#667eea' : '#f56565' }}>
                        {totalProfit >= 0 ? '+' : ''}¥{totalProfit.toLocaleString()}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Tag color={avgMargin > 30 ? 'green' : avgMargin > 15 ? 'gold' : 'red'}>
                        {avgMargin}%
                      </Tag>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )
            }}
          />
        )}
      </Card>

      {/* 分析建议 */}
      <Card title="💡 分析建议" style={{ marginTop: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {profitData && profitData.profitMargin < 20 && (
            <Alert
              message="💰 提升利润率建议"
              description={
                <ul>
                  <li>审查成本结构，寻找可以优化的支出项</li>
                  <li>考虑提高产品或服务定价</li>
                  <li>增加高利润率业务的投入</li>
                  <li>降低运营成本，提高自动化程度</li>
                </ul>
              }
              type="info"
              showIcon
            />
          )}
          {profitData && profitData.profitMargin >= 20 && profitData.profitMargin < 40 && (
            <Alert
              message="✅ 利润状况良好"
              description={
                <ul>
                  <li>保持当前业务模式，持续优化</li>
                  <li>考虑扩大业务规模</li>
                  <li>投资研发，提升竞争力</li>
                </ul>
              }
              type="success"
              showIcon
            />
          )}
          {profitData && profitData.profitMargin >= 40 && (
            <Alert
              message="🌟 利润状况优秀"
              description={
                <ul>
                  <li>继续保持优秀的盈利能力</li>
                  <li>考虑多元化投资</li>
                  <li>建立风险储备金</li>
                </ul>
              }
              type="success"
              showIcon
            />
          )}
        </Space>
      </Card>
    </div>
  )
}

export default ProfitAnalysis
