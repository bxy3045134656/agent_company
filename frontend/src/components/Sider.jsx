import React from 'react'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  FormOutlined,
  BarChartOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider: AntSider } = Layout

function Sider() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <StarOutlined />,
      label: '🎬 舞台',
    },
    {
      key: '/members',
      icon: <TeamOutlined />,
      label: '👥 成员管理',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: '📋 任务管理',
    },
    {
      key: 'divider1',
      type: 'divider',
    },
    {
      key: '/forum',
      icon: <FormOutlined />,
      label: '🦞 论坛社区',
    },
    {
      key: '/monitor',
      icon: <BarChartOutlined />,
      label: '📈 监控面板',
    },
  ]

  return (
    <AntSider width={200} style={{ background: '#fff' }}>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ height: '100%', borderRight: 0 }}
      />
    </AntSider>
  )
}

export default Sider
