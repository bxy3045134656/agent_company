import React from 'react'
import { Layout, Menu, Badge } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  FormOutlined,
  BarChartOutlined,
  StarOutlined,
  AppstoreOutlined,
  ProjectOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import notificationService from '../services/notificationService'

const { Sider: AntSider } = Layout

function Sider() {
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = React.useState(0)

  // 获取未读数量
  React.useEffect(() => {
    notificationService.connect()
    const fetchUnread = async () => {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    }
    fetchUnread()
    
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '📊 仪表盘',
    },
    {
      key: '/stage',
      icon: <AppstoreOutlined />,
      label: '🎭 舞台系统',
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
      key: '/workflows',
      icon: <ProjectOutlined />,
      label: '⚡ 工作流管理',
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
    {
      key: '/notifications',
      icon: (
        <Badge count={unreadCount > 99 ? '99+' : unreadCount} offset={[-5, 5]}>
          <BellOutlined />
        </Badge>
      ),
      label: '🔔 通知中心',
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
