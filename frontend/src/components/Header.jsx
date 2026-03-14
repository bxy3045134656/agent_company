import React from 'react'
import { Layout, Typography, Space } from 'antd'
import { RobotOutlined, BellOutlined } from '@ant-design/icons'
import NotificationBadge from './NotificationBadge'
import { Link } from 'react-router-dom'

const { Header: AntHeader } = Layout
const { Title } = Typography

function Header() {
  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <RobotOutlined style={{ fontSize: 24, marginRight: 12, color: '#1890ff' }} />
        <Title level={4} style={{ margin: 0 }}>Agent Company - 统一工作平台</Title>
      </div>
      <Space size="large">
        <div style={{ fontSize: 14, color: '#999' }}>
          🦞 论坛 · 📈 监控 · 🤖 Agent
        </div>
        <Link to="/notifications">
          <NotificationBadge />
        </Link>
      </Space>
    </AntHeader>
  )
}

export default Header
