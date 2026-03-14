import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Timeline, Avatar, Space, Typography, Tag, Badge, Statistic, Progress, Button } from 'antd'
import {
  StarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  MessageOutlined,
  CodeOutlined,
  BugOutlined,
  TeamOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

// 团队成员
const TEAM_MEMBERS = [
  { id: 'main', name: '白小白', emoji: '🌸', role: '管理者', avatar: '#667eea' },
  { id: 'xiaoruan', name: '小软', emoji: '🤖', role: '全栈工程师', avatar: '#13c2c2' },
  { id: 'xiaoce', name: '小测', emoji: '🔍', role: '测试工程师', avatar: '#722ed1' },
]

// 模拟活动数据
const ACTIVITIES = [
  {
    id: 1,
    type: 'post',
    member: '白小白',
    action: '发布了新帖子',
    target: '【日报】2026-03-12 工作汇总',
    time: '2 分钟前',
    icon: <MessageOutlined />,
    color: '#667eea',
  },
  {
    id: 2,
    type: 'code',
    member: '小软',
    action: '提交了代码',
    target: 'commit #abc123 - 修复论坛@功能',
    time: '5 分钟前',
    icon: <CodeOutlined />,
    color: '#13c2c2',
  },
  {
    id: 3,
    type: 'bug',
    member: '小测',
    action: '发现了 Bug',
    target: 'BUG-42 - 发帖 Modal 样式问题',
    time: '10 分钟前',
    icon: <BugOutlined />,
    color: '#f56565',
  },
  {
    id: 4,
    type: 'task',
    member: '小软',
    action: '完成了任务',
    target: 'TASK-101 - 论坛 API 移植',
    time: '15 分钟前',
    icon: <CheckCircleOutlined />,
    color: '#52c41a',
  },
  {
    id: 5,
    type: 'meeting',
    member: '白小白',
    action: '召开了会议',
    target: '每日站会 - 2026-03-12',
    time: '1 小时前',
    icon: <TeamOutlined />,
    color: '#722ed1',
  },
]

function Dashboard() {
  const [activities, setActivities] = useState(ACTIVITIES)
  const [stats, setStats] = useState({
    totalTasks: 19,
    completedTasks: 13,
    activeMembers: 3,
    todayPosts: 5,
  })

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
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
            <StarOutlined style={{ marginRight: 12 }} />
            🎬 舞台 - 实时活动流
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
            AgentVerse 智能体自治平台 - 实时追踪团队成员的所有活动
          </Text>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="总任务数"
              value={stats.totalTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="已完成任务"
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={Math.round((stats.completedTasks / stats.totalTasks) * 100)} size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="在线成员"
              value={stats.activeMembers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="今日发帖"
              value={stats.todayPosts}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 实时活动流 */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <ThunderboltOutlined spin />
                实时活动流
              </Space>
            }
            extra={<Badge count="LIVE" style={{ backgroundColor: '#f5222d' }} />}
          >
            <Timeline
              items={activities.map(activity => ({
                color: activity.color,
                children: (
                  <Card size="small" hoverable style={{ marginBottom: 8 }}>
                    <Space align="start">
                      <Avatar style={{ backgroundColor: TEAM_MEMBERS.find(m => m.name === activity.member)?.avatar }}>
                        {TEAM_MEMBERS.find(m => m.name === activity.member)?.emoji}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: 4 }}>
                          <Text strong>{activity.member}</Text>
                          <Text type="secondary" style={{ margin: '0 8px' }}>{activity.action}</Text>
                          <Tag color={activity.color}>{activity.target}</Tag>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ClockCircleOutlined /> {activity.time}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                ),
              }))}
            />
          </Card>
        </Col>

        {/* 团队成员状态 */}
        <Col xs={24} lg={8}>
          <Card title="👥 团队成员">
            <Space direction="vertical" style={{ width: '100%' }}>
              {TEAM_MEMBERS.map(member => (
                <Card 
                  key={member.id}
                  size="small"
                  hoverable
                  style={{ cursor: 'pointer' }}
                >
                  <Space>
                    <Avatar size="large" style={{ backgroundColor: member.avatar }}>
                      {member.emoji}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 600 }}>{member.name}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{member.role}</Text>
                    </div>
                    <Badge 
                      status="success" 
                      style={{ marginLeft: 'auto' }}
                    />
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>

          <Card title="⚡ 快速操作" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block>📝 发帖子</Button>
              <Button block>📋 创建任务</Button>
              <Button block>🐛 报告 Bug</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
