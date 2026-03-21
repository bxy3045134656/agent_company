import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Button, Space, Spin, Tag, Typography, Table, BackTop } from 'antd'
import { Line } from '@ant-design/charts'
import { ReloadOutlined, ArrowLeftOutlined, ApiOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const { Title, Text } = Typography

// API 配置
const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost'
const API_PORT = import.meta.env.VITE_API_PORT || '3001'
const API_BASE = `${API_HOST}:${API_PORT}/api/v1`

/**
 * 单 Agent 流量详情页
 */
function AgentTrafficDetail() {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [agentData, setAgentData] = useState(null)
  const [trendData, setTrendData] = useState([])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE}/monitor/traffic/agent/${agentId}`)
      if (response.data.success) {
        setAgentData(response.data.data)
        setTrendData(response.data.data.trend || [])
      }
    } catch (err) {
      console.error('加载失败:', err)
      // 模拟数据
      setAgentData({
        id: agentId,
        name: agentId === 'mama' ? '玛玛' : 'Agent',
        emoji: '🤖',
        requests: 3250,
        tokens: 1250000,
        avgTime: 180,
        status: 'online'
      })
      setTrendData(generateMockTrend())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [agentId])

  const generateMockTrend = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        requests: Math.floor(Math.random() * 200) + 50,
        tokens: Math.floor(Math.random() * 50000) + 10000,
        avgTime: Math.floor(Math.random() * 100) + 150
      })
    }
    return data
  }

  return (
    <div style={{ padding: '24px' }}>
      <BackTop />
      
      {/* 头部 */}
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <Title level={2} style={{ display: 'inline' }}>
          {agentData?.emoji} {agentData?.name} - 流量详情
        </Title>
      </div>

      <Spin spinning={loading}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="总请求数"
                value={agentData?.requests || 0}
                prefix={<ApiOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Token 消耗"
                value={agentData?.tokens || 0}
                prefix={<ThunderboltOutlined />}
                suffix="tokens"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="平均响应时间"
                value={agentData?.avgTime || 0}
                prefix={<ClockCircleOutlined />}
                suffix="ms"
              />
            </Card>
          </Col>
        </Row>

        {/* 趋势图 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="📈 请求量趋势">
              <Line
                height={250}
                data={trendData}
                xField="date"
                yField="requests"
                smooth
                color="#1890ff"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="⚡ Token 消耗趋势">
              <Line
                height={250}
                data={trendData}
                xField="date"
                yField="tokens"
                smooth
                color="#52c41a"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="⏱️ 响应时间趋势">
              <Line
                height={250}
                data={trendData}
                xField="date"
                yField="avgTime"
                smooth
                color="#faad14"
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default AgentTrafficDetail