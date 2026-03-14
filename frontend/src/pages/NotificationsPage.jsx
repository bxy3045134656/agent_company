import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Empty,
  Select,
  Input,
  Row,
  Col,
  Statistic,
  Badge
} from 'antd';
import { 
  BellOutlined, 
  CheckOutlined, 
  DeleteOutlined,
  DashboardOutlined,
  MessageOutlined,
  AlertOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import notificationService from '../services/notificationService';
import './NotificationsPage.css';

const { Text, Title } = Typography;
const { Option } = Select;

/**
 * 通知中心页面
 */
const NotificationsPage = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const [filter, setFilter] = useState({
    category: 'all',
    priority: 'all',
    status: 'all'
  });
  const [search, setSearch] = useState('');

  // 加载通知列表
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter.category !== 'all') params.category = filter.category;
      if (filter.priority !== 'all') params.priority = filter.priority;
      if (filter.status !== 'all') params.unread = filter.status === 'unread';
      
      const data = await notificationService.getNotifications(params);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载统计
  const loadStats = async () => {
    try {
      const data = await notificationService.getStats();
      setStats(data);
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadStats();

    // 监听新通知
    const unsubscribe = notificationService.on('notification', () => {
      loadNotifications();
      loadStats();
    });

    return () => unsubscribe();
  }, [filter]);

  // 标记为已读
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
      loadStats();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 批量标记为已读
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
      loadStats();
    } catch (error) {
      console.error('批量标记失败:', error);
    }
  };

  // 删除通知
  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      loadNotifications();
      loadStats();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // 获取图标
  const getIcon = (category) => {
    switch (category) {
      case 'dashboard':
        return <DashboardOutlined style={{ color: '#1890ff' }} />;
      case 'forum':
        return <MessageOutlined style={{ color: '#52c41a' }} />;
      case 'monitor':
        return <AlertOutlined style={{ color: '#ff4d4f' }} />;
      case 'agent':
        return <UserOutlined style={{ color: '#722ed1' }} />;
      default:
        return <BellOutlined style={{ color: '#999' }} />;
    }
  };

  // 获取优先级标签
  const getPriorityTag = (priority) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      normal: 'blue',
      low: 'default'
    };
    return <Tag color={colors[priority] || 'default'}>{priority}</Tag>;
  };

  // 过滤通知
  const filteredNotifications = notifications.filter(n => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      (n.title && n.title.toLowerCase().includes(searchLower)) ||
      (n.message && n.message.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <Title level={2}>
          <BellOutlined /> 通知中心
        </Title>
        <Space>
          <Button onClick={loadNotifications}>刷新</Button>
          <Button onClick={handleMarkAllAsRead} disabled={stats.unread === 0}>
            全部标记为已读
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="notifications-stats">
        <Col span={6}>
          <Card>
            <Statistic 
              title="总通知数" 
              value={stats.total} 
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="未读通知" 
              value={stats.unread} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="已读通知" 
              value={stats.total - stats.unread}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="告警通知" 
              value={stats.byPriority?.high || 0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选器 */}
      <Card className="notification-filters">
        <Space wrap size="middle">
          <Select 
            value={filter.category} 
            onChange={(v) => setFilter({ ...filter, category: v })}
            style={{ width: 120 }}
          >
            <Option value="all">全部类别</Option>
            <Option value="dashboard">Dashboard</Option>
            <Option value="forum">Forum</Option>
            <Option value="monitor">Monitor</Option>
            <Option value="agent">Agent</Option>
          </Select>

          <Select 
            value={filter.priority} 
            onChange={(v) => setFilter({ ...filter, priority: v })}
            style={{ width: 120 }}
          >
            <Option value="all">全部优先级</Option>
            <Option value="high">高</Option>
            <Option value="medium">中</Option>
            <Option value="normal">普通</Option>
          </Select>

          <Select 
            value={filter.status} 
            onChange={(v) => setFilter({ ...filter, status: v })}
            style={{ width: 120 }}
          >
            <Option value="all">全部状态</Option>
            <Option value="unread">未读</Option>
            <Option value="read">已读</Option>
          </Select>

          <Input
            placeholder="搜索通知..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
        </Space>
      </Card>

      {/* 通知列表 */}
      <Card>
        <List
          loading={loading}
          dataSource={filteredNotifications}
          locale={{ emptyText: <Empty description="暂无通知" /> }}
          renderItem={(item) => (
            <List.Item
              className={`notification-list-item ${item.unread ? 'unread' : 'read'}`}
              actions={[
                item.unread && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => handleMarkAsRead(item.id)}
                  >
                    标记已读
                  </Button>
                ),
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(item.id)}
                >
                  删除
                </Button>
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={item.unread} color={item.priority === 'high' ? 'red' : 'blue'}>
                    <div className="notification-icon-avatar">
                      {getIcon(item.category)}
                    </div>
                  </Badge>
                }
                title={
                  <Space>
                    <Text strong className="notification-title">
                      {item.title || '系统通知'}
                    </Text>
                    {getPriorityTag(item.priority)}
                    <Tag>{item.category}</Tag>
                  </Space>
                }
                description={
                  <div className="notification-item-content">
                    <Text>{item.message}</Text>
                    <div className="notification-item-time">
                      <Text type="secondary">
                        {new Date(item.createdAt).toLocaleString('zh-CN')}
                      </Text>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default NotificationsPage;
