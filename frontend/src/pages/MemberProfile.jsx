import React, { useEffect, useState } from 'react'
import { 
  Card, Row, Col, Avatar, Tag, Button, Space, Typography, Progress, 
  Descriptions, Statistic, Timeline, Switch, Select, Slider, Modal, 
  message, Badge, Divider, Tooltip, Alert, Tabs, List, Icon 
} from 'antd'
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  RestOutlined,
  TeamOutlined,
  TrophyOutlined,
  LineChartOutlined,
  BellOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  RocketOutlined,
  CoffeeOutlined,
  BarChartOutlined,
  CalendarOutlined,
  HistoryOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import memberService from '../services/memberService'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select

// 团队成员配置（从 MemberList 复用）
const TEAM_MEMBERS = {
  main: { 
    id: 'main', 
    name: '白小白', 
    emoji: '🌸', 
    role: '管理者',
    status: 'online',
    avatar: '#667eea',
    skills: ['团队管理', '任务分配', '代码审核', '架构设计'],
    description: '团队领导者，负责整体架构和技术决策'
  },
  xiaoruan: { 
    id: 'xiaoruan', 
    name: '小软', 
    emoji: '🤖', 
    role: '全栈工程师',
    status: 'busy',
    avatar: '#13c2c2',
    skills: ['React', 'Node.js', 'Python', 'Three.js', '数据库设计'],
    description: '全栈开发工程师，负责核心功能开发'
  },
  xiaoce: { 
    id: 'xiaoce', 
    name: '小测', 
    emoji: '🔍', 
    role: '测试工程师',
    status: 'online',
    avatar: '#722ed1',
    skills: ['自动化测试', '性能测试', '安全测试', '质量保障'],
    description: '测试工程师，负责质量保证和测试'
  },
}

// 工作模式配置
const WORK_MODES = {
  focus: { label: '专注模式', icon: <RocketOutlined />, color: '#52c41a', desc: '最大化工作效率，减少干扰' },
  normal: { label: '普通模式', icon: <DashboardOutlined />, color: '#1890ff', desc: '平衡工作与休息' },
  relax: { label: '休闲模式', icon: <CoffeeOutlined />, color: '#faad14', desc: '轻松工作，适当休息' },
}

// 颜色配置
const CHART_COLORS = ['#667eea', '#13c2c2', '#52c41a', '#faad14', '#722ed1', '#f5222d']

function MemberProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [configVisible, setConfigVisible] = useState(false)
  const [workMode, setWorkMode] = useState('normal')
  const [concurrency, setConcurrency] = useState(5)
  const [isOnline, setIsOnline] = useState(true)
  const [efficiencyData, setEfficiencyData] = useState([])
  const [workTimeData, setWorkTimeData] = useState([])
  const [taskHistory, setTaskHistory] = useState([])

  // 加载成员数据
  useEffect(() => {
    loadMemberData()
  }, [id])

  const loadMemberData = async () => {
    try {
      setLoading(true)
      const memberId = id || 'xiaoruan' // 默认显示小软
      
      // 获取成员详情
      const memberData = TEAM_MEMBERS[memberId] || TEAM_MEMBERS.xiaoruan
      setMember(memberData)
      setIsOnline(memberData.status === 'online' || memberData.status === 'busy')
      
      // 模拟统计数据（实际应该从 API 获取）
      setStats({
        total_tasks: 15,
        completed_tasks: 12,
        pending_tasks: 2,
        failed_tasks: 1,
        efficiency: 85,
        work_hours_today: 6.5,
        work_hours_week: 35,
      })
      
      // 模拟效率数据
      setEfficiencyData([
        { day: '周一', efficiency: 75, tasks: 5 },
        { day: '周二', efficiency: 82, tasks: 7 },
        { day: '周三', efficiency: 88, tasks: 8 },
        { day: '周四', efficiency: 85, tasks: 6 },
        { day: '周五', efficiency: 90, tasks: 9 },
        { day: '周六', efficiency: 70, tasks: 3 },
        { day: '周日', efficiency: 65, tasks: 2 },
      ])
      
      // 模拟工作时间数据
      setWorkTimeData([
        { hour: '09:00', work: 100, rest: 0 },
        { hour: '10:00', work: 95, rest: 5 },
        { hour: '11:00', work: 90, rest: 10 },
        { hour: '12:00', work: 20, rest: 80 },
        { hour: '13:00', work: 30, rest: 70 },
        { hour: '14:00', work: 85, rest: 15 },
        { hour: '15:00', work: 80, rest: 20 },
        { hour: '16:00', work: 75, rest: 25 },
      ])
      
      // 模拟任务历史
      setTaskHistory([
        { id: 1, title: '开发舞台系统', status: 'completed', time: '2026-03-14 16:00', icon: <CheckCircleOutlined /> },
        { id: 2, title: 'Three.js 3D 场景搭建', status: 'completed', time: '2026-03-14 15:30', icon: <CheckCircleOutlined /> },
        { id: 3, title: 'WebSocket 服务实现', status: 'completed', time: '2026-03-14 14:00', icon: <CheckCircleOutlined /> },
        { id: 4, title: '成员面板完善', status: 'processing', time: '2026-03-14 16:43', icon: <ClockCircleOutlined /> },
        { id: 5, title: '工作流管理开发', status: 'pending', time: '待开始', icon: <ClockCircleOutlined /> },
      ])
      
    } catch (error) {
      console.error('加载成员数据失败:', error)
      message.error('加载成员数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 切换在线状态
  const handleToggleOnline = async () => {
    try {
      const newStatus = !isOnline
      setIsOnline(newStatus)
      await memberService.updateMemberStatus(id || 'xiaoruan', newStatus ? 'online' : 'offline')
      message.success(newStatus ? '已上线' : '已下线')
    } catch (error) {
      console.error('切换状态失败:', error)
      message.error('切换状态失败')
      setIsOnline(!isOnline)
    }
  }

  // 更新工作模式
  const handleUpdateWorkMode = async (mode) => {
    try {
      setWorkMode(mode)
      await memberService.updateWorkMode(id || 'xiaoruan', mode)
      message.success(`已切换到${WORK_MODES[mode].label}`)
    } catch (error) {
      console.error('更新工作模式失败:', error)
      message.error('更新工作模式失败')
    }
  }

  // 更新并发数
  const handleUpdateConcurrency = async (value) => {
    setConcurrency(value)
    // 防抖，实际应该在停止滑动后调用
    try {
      await memberService.updateConcurrency(id || 'xiaoruan', value)
    } catch (error) {
      console.error('更新并发数失败:', error)
    }
  }

  // 发送休息提醒
  const handleRestReminder = async () => {
    try {
      await memberService.sendRestReminder(id || 'xiaoruan')
      message.success('休息提醒已发送')
    } catch (error) {
      console.error('发送休息提醒失败:', error)
      message.error('发送休息提醒失败')
    }
  }

  // 打开配置面板
  const handleOpenConfig = () => {
    setConfigVisible(true)
  }

  // 如果没有加载完成
  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Title level={3}>加载中...</Title>
      </div>
    )
  }

  if (!member) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Alert message="成员不存在" type="error" showIcon />
      </div>
    )
  }

  const completionRate = stats ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0

  return (
    <div>
      {/* 头部 - 个人信息 */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar 
              size={100} 
              style={{ backgroundColor: member.avatar, fontSize: 48 }}
              icon={<UserOutlined />}
            >
              {member.emoji}
            </Avatar>
          </Col>
          <Col flex="auto">
            <Row align="middle" gutter={16}>
              <Col>
                <Title level={2} style={{ marginBottom: 8 }}>
                  {member.emoji} {member.name}
                </Title>
                <Space size="middle">
                  <Tag color={member.avatar}>{member.role}</Tag>
                  <Badge 
                    status={isOnline ? 'success' : 'default'} 
                    text={isOnline ? '在线' : '离线'} 
                  />
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button 
                    type={isOnline ? 'primary' : 'default'}
                    icon={isOnline ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={handleToggleOnline}
                  >
                    {isOnline ? '设为离线' : '设为在线'}
                  </Button>
                  <Button 
                    icon={<SettingOutlined />}
                    onClick={handleOpenConfig}
                  >
                    配置
                  </Button>
                </Space>
              </Col>
            </Row>
            <Paragraph type="secondary" style={{ marginTop: 12, fontSize: 14 }}>
              {member.description}
            </Paragraph>
          </Col>
        </Row>
        
        {/* 技能标签 */}
        <Divider style={{ margin: '16px 0' }} />
        <div>
          <Text strong style={{ marginRight: 12 }}>🎯 技能:</Text>
          <Space wrap>
            {member.skills.map((skill, index) => (
              <Tag key={index} color="blue">{skill}</Tag>
            ))}
          </Space>
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="总任务数"
              value={stats?.total_tasks || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="已完成"
              value={stats?.completed_tasks || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="进行中"
              value={stats?.pending_tasks || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="完成率"
              value={completionRate}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 选项卡 */}
      <Card>
        <Tabs defaultActiveKey="overview">
          {/* 概览 */}
          <TabPane 
            tab={
              <span>
                <DashboardOutlined />
                概览
              </span>
            } 
            key="overview"
          >
            <Row gutter={[16, 16]}>
              {/* 当前任务 */}
              <Col xs={24} lg={12}>
                <Card 
                  title="📋 当前任务" 
                  extra={<Button type="link" onClick={() => navigate('/tasks')}>查看全部</Button>}
                >
                  <Timeline>
                    {taskHistory.filter(t => t.status === 'processing' || t.status === 'pending').map((task) => (
                      <Timeline.Item 
                        key={task.id} 
                        dot={task.icon}
                        color={task.status === 'processing' ? 'blue' : 'gray'}
                      >
                        <div style={{ fontWeight: 500 }}>{task.title}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{task.time}</Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>

              {/* 工作效率 */}
              <Col xs={24} lg={12}>
                <Card title="📊 工作效率">
                  <div style={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={efficiencyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 100]} />
                        <RechartsTooltip />
                        <Area 
                          type="monotone" 
                          dataKey="efficiency" 
                          stroke="#667eea" 
                          fill="#667eea" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              {/* 工作时间 */}
              <Col xs={24} lg={12}>
                <Card title="⏰ 今日工作时间">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic 
                        title="今日工作" 
                        value={stats?.work_hours_today || 0} 
                        suffix="小时"
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="本周工作" 
                        value={stats?.work_hours_week || 0} 
                        suffix="小时"
                        prefix={<CalendarOutlined />}
                      />
                    </Col>
                  </Row>
                  <Divider />
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="work" name="工作" fill="#13c2c2" />
                        <Bar dataKey="rest" name="休息" fill="#faad14" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              {/* 快捷操作 */}
              <Col xs={24} lg={12}>
                <Card title="⚡ 快捷操作">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                      block 
                      icon={<RestOutlined />} 
                      onClick={handleRestReminder}
                    >
                      休息提醒
                    </Button>
                    <Button 
                      block 
                      icon={<BellOutlined />} 
                      onClick={() => message.info('通知设置开发中')}
                    >
                      通知设置
                    </Button>
                    <Button 
                      block 
                      icon={<HistoryOutlined />} 
                      onClick={() => message.info('历史记录开发中')}
                    >
                      历史记录
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 任务历史 */}
          <TabPane 
            tab={
              <span>
                <HistoryOutlined />
                任务历史
              </span>
            } 
            key="history"
          >
            <Timeline>
              {taskHistory.map((task) => (
                <Timeline.Item 
                  key={task.id} 
                  dot={task.icon}
                  color={task.status === 'completed' ? 'green' : task.status === 'processing' ? 'blue' : 'gray'}
                >
                  <div style={{ fontWeight: 500 }}>{task.title}</div>
                  <Space>
                    <Tag color={
                      task.status === 'completed' ? 'success' : 
                      task.status === 'processing' ? 'processing' : 'default'
                    }>
                      {task.status === 'completed' ? '已完成' : 
                       task.status === 'processing' ? '进行中' : '待开始'}
                    </Tag>
                    <Text type="secondary">{task.time}</Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>

          {/* 效率分析 */}
          <TabPane 
            tab={
              <span>
                <LineChartOutlined />
                效率分析
              </span>
            } 
            key="efficiency"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="📈 每日效率趋势">
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={efficiencyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 100]} />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="efficiency" name="效率" stroke="#667eea" strokeWidth={2} />
                        <Line type="monotone" dataKey="tasks" name="任务数" stroke="#52c41a" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="📊 任务完成分布">
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: '已完成', value: stats?.completed_tasks || 0 },
                            { name: '进行中', value: stats?.pending_tasks || 0 },
                            { name: '失败', value: stats?.failed_tasks || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {['#52c41a', '#1890ff', '#f5222d'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* 配置模态框 */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            <span>配置管理</span>
          </Space>
        }
        open={configVisible}
        onCancel={() => setConfigVisible(false)}
        footer={[
          <Button key="close" onClick={() => setConfigVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="save" 
            type="primary"
            onClick={() => {
              setConfigVisible(false)
              message.success('配置已保存')
            }}
          >
            保存
          </Button>,
        ]}
        width={700}
      >
        <Tabs defaultActiveKey="mode">
          <TabPane tab="工作模式" key="mode">
            <Card size="small" title="⚙️ 工作模式设置" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.entries(WORK_MODES).map(([key, config]) => (
                  <Card
                    key={key}
                    hoverable
                    size="small"
                    onClick={() => handleUpdateWorkMode(key)}
                    style={{ 
                      cursor: 'pointer',
                      border: workMode === key ? `2px solid ${config.color}` : '1px solid #d9d9d9',
                      backgroundColor: workMode === key ? `${config.color}10` : 'white',
                    }}
                  >
                    <Row align="middle" gutter={16}>
                      <Col style={{ fontSize: 24, color: config.color }}>
                        {config.icon}
                      </Col>
                      <Col flex="auto">
                        <div style={{ fontWeight: 600 }}>{config.label}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{config.desc}</Text>
                      </Col>
                      <Col>
                        {workMode === key && (
                          <Badge status="success" text="当前模式" />
                        )}
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="性能配置" key="performance">
            <Card size="small" title="🚀 并发数设置" style={{ marginBottom: 16 }}>
              <div style={{ padding: '20px 0' }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>并发任务数</Text>
                    <Text type="secondary">{concurrency} 个</Text>
                  </div>
                  <Slider 
                    min={1} 
                    max={20} 
                    value={concurrency}
                    onChange={handleUpdateConcurrency}
                    marks={{
                      1: '1',
                      5: '5',
                      10: '10',
                      15: '15',
                      20: '20',
                    }}
                  />
                </div>
                <Alert 
                  message="并发数说明"
                  description="增加并发数可以提高工作效率，但可能会影响单个任务的质量。建议根据任务复杂度调整。"
                  type="info"
                  showIcon
                />
              </div>
            </Card>

            <Card size="small" title="⚡ 参数调优">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>响应延迟阈值</Text>
                    <Text type="secondary" style={{ float: 'right' }}>500ms</Text>
                  </div>
                  <Slider defaultValue={500} min={100} max={2000} marks={{ 100: '100ms', 500: '500ms', 1000: '1s', 2000: '2s' }} />
                </div>
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>超时时间</Text>
                    <Text type="secondary" style={{ float: 'right' }}>30s</Text>
                  </div>
                  <Slider defaultValue={30} min={10} max={120} marks={{ 10: '10s', 30: '30s', 60: '1min', 120: '2min' }} />
                </div>
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="手动干预" key="intervention">
            <Alert 
              message="⚠️ 手动干预"
              description="以下操作会立即影响 Agent 的运行状态，请谨慎使用。"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block danger icon={<ThunderboltOutlined />} onClick={() => message.info('重置状态开发中')}>
                重置 Agent 状态
              </Button>
              <Button block icon={<RefreshOutlined />} onClick={() => message.info('刷新缓存开发中')}>
                刷新缓存
              </Button>
              <Button block icon={<ExportOutlined />} onClick={() => message.info('导出数据开发中')}>
                导出当前状态
              </Button>
            </Space>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  )
}

export default MemberProfile
