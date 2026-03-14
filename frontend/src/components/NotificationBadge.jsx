import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Typography, Button, Empty, Tag, Space } from 'antd';
import { 
  BellOutlined, 
  CheckOutlined, 
  DeleteOutlined, 
  DashboardOutlined,
  MessageOutlined,
  AlertOutlined,
  UserOutlined
} from '@ant-design/icons';
import notificationService from '../services/notificationService';
import './NotificationBadge.css';

const { Text } = Typography;

/**
 * 通知徽章组件
 * 显示未读通知数量，点击展开通知列表
 */
const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  // 获取未读数量
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('获取未读数量失败:', error);
    }
  };

  // 获取通知列表
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications({ limit: 10 });
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('获取通知列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    fetchUnreadCount();
    
    // 连接 WebSocket
    notificationService.connect();

    // 监听新通知
    const unsubscribe = notificationService.on('notification', (data) => {
      setNotifications(prev => [data, ...prev].slice(0, 10));
      fetchUnreadCount();
    });

    // 定时获取未读数（每 30 秒）
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // 下拉菜单展开时加载通知列表
  const handleVisibleChange = (newVisible) => {
    setVisible(newVisible);
    if (newVisible) {
      fetchNotifications();
    }
  };

  // 标记为已读
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, unread: false } : n)
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 批量标记为已读
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      setUnreadCount(0);
    } catch (error) {
      console.error('批量标记失败:', error);
    }
  };

  // 删除通知
  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchUnreadCount();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // 获取通知图标
  const getNotificationIcon = (category) => {
    switch (category) {
      case 'dashboard':
        return <DashboardOutlined />;
      case 'forum':
        return <MessageOutlined />;
      case 'monitor':
        return <AlertOutlined />;
      case 'agent':
        return <UserOutlined />;
      default:
        return <BellOutlined />;
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'normal':
        return 'blue';
      default:
        return 'default';
    }
  };

  // 通知列表内容
  const notificationList = (
    <div className="notification-dropdown" style={{ width: 400 }}>
      <div className="notification-header">
        <Space split={<span>|</span>}>
          <Text strong>通知中心</Text>
          {unreadCount > 0 && (
            <Button type="link" size="small" onClick={handleMarkAllAsRead}>
              全部标记为已读
            </Button>
          )}
        </Space>
      </div>
      
      <List
        loading={loading}
        dataSource={notifications}
        locale={{ emptyText: <Empty description="暂无通知" /> }}
        renderItem={(item) => (
          <List.Item
            className={`notification-item ${item.unread ? 'unread' : ''}`}
            actions={[
              item.unread && (
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleMarkAsRead(item.id)}
                />
              ),
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(item.id)}
              />
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={
                <Badge dot={item.unread} color={getPriorityColor(item.priority)}>
                  <div className="notification-icon">
                    {getNotificationIcon(item.category)}
                  </div>
                </Badge>
              }
              title={
                <Space>
                  <Text strong>{item.title || '系统通知'}</Text>
                  <Tag color={getPriorityColor(item.priority)}>
                    {item.priority}
                  </Tag>
                </Space>
              }
              description={
                <div className="notification-content">
                  <Text type="secondary" ellipsis>{item.message}</Text>
                  <div className="notification-time">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.createdAt).toLocaleString('zh-CN')}
                    </Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      
      <div className="notification-footer">
        <Button type="link" block href="/notifications">
          查看全部通知
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown
      overlay={notificationList}
      trigger={['click']}
      visible={visible}
      onVisibleChange={handleVisibleChange}
      overlayClassName="notification-dropdown-wrapper"
    >
      <Badge count={unreadCount > 99 ? '99+' : unreadCount} offset={[-5, 5]}>
        <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBadge;
