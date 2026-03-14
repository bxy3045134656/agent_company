/**
 * 通知系统路由
 * 提供通知的 CRUD 操作和 WebSocket 集成
 * 
 * @author 小软 🤖
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// 通知数据存储（内存 + 文件持久化）
const NOTIFICATIONS_FILE = path.join(__dirname, '../../data/notifications.json');
let notifications = [];

// 加载历史通知
function loadNotifications() {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
      notifications = JSON.parse(data);
      // 只保留最近 100 条
      notifications = notifications.slice(-100);
    }
  } catch (error) {
    console.error('❌ 加载通知失败:', error);
    notifications = [];
  }
}

// 保存通知到文件
function saveNotifications() {
  try {
    const dataDir = path.dirname(NOTIFICATIONS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf-8');
  } catch (error) {
    console.error('❌ 保存通知失败:', error);
  }
}

// 初始化加载
loadNotifications();

let notificationService = null;

/**
 * 设置通知服务（WebSocket）
 */
router.setNotificationService = (service) => {
  notificationService = service;
};

/**
 * 获取所有通知（支持分页和筛选）
 */
router.get('/', (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      category, 
      priority,
      unread 
    } = req.query;

    let filtered = [...notifications];

    // 筛选
    if (type) filtered = filtered.filter(n => n.type === type);
    if (category) filtered = filtered.filter(n => n.category === category);
    if (priority) filtered = filtered.filter(n => n.priority === priority);
    if (unread !== undefined) {
      const unreadBool = unread === 'true';
      filtered = filtered.filter(n => n.unread === unreadBool);
    }

    // 分页
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = filtered.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginated = filtered.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        notifications: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('❌ 获取通知失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取通知失败' }
    });
  }
});

/**
 * 获取未读通知数量
 */
router.get('/unread/count', (req, res) => {
  try {
    const unreadCount = notifications.filter(n => n.unread !== false).length;
    res.json({
      success: true,
      data: { count: unreadCount }
    });
  } catch (error) {
    console.error('❌ 获取未读数失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取未读数失败' }
    });
  }
});

/**
 * 创建新通知
 */
router.post('/', (req, res) => {
  try {
    const { type, category, priority, title, message, data } = req.body;

    if (!type || !message) {
      return res.status(400).json({
        success: false,
        error: { message: 'type 和 message 是必填字段' }
      });
    }

    const notification = {
      id: Date.now().toString(),
      type,
      category: category || 'general',
      priority: priority || 'normal',
      title: title || '',
      message,
      data: data || {},
      unread: true,
      createdAt: new Date().toISOString()
    };

    notifications.push(notification);
    
    // 只保留最近 100 条
    if (notifications.length > 100) {
      notifications = notifications.slice(-100);
    }

    saveNotifications();

    // 通过 WebSocket 广播
    if (notificationService) {
      notificationService.broadcast(notification);
    }

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('❌ 创建通知失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '创建通知失败' }
    });
  }
});

/**
 * 标记通知为已读
 */
router.put('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    const notification = notifications.find(n => n.id === id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: '通知不存在' }
      });
    }

    notification.unread = false;
    notification.readAt = new Date().toISOString();
    saveNotifications();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('❌ 标记已读失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '标记已读失败' }
    });
  }
});

/**
 * 批量标记为已读
 */
router.put('/read/all', (req, res) => {
  try {
    const { ids } = req.body;

    if (ids && Array.isArray(ids)) {
      notifications.forEach(n => {
        if (ids.includes(n.id)) {
          n.unread = false;
          n.readAt = new Date().toISOString();
        }
      });
    } else {
      // 标记所有为已读
      notifications.forEach(n => {
        n.unread = false;
        n.readAt = new Date().toISOString();
      });
    }

    saveNotifications();

    res.json({
      success: true,
      message: '已成功标记为已读'
    });
  } catch (error) {
    console.error('❌ 批量标记失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '批量标记失败' }
    });
  }
});

/**
 * 删除通知
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = notifications.findIndex(n => n.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: { message: '通知不存在' }
      });
    }

    notifications.splice(index, 1);
    saveNotifications();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('❌ 删除通知失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '删除通知失败' }
    });
  }
});

/**
 * 获取通知统计
 */
router.get('/stats', (req, res) => {
  try {
    const total = notifications.length;
    const unread = notifications.filter(n => n.unread !== false).length;
    const byCategory = {};
    const byPriority = {};

    notifications.forEach(n => {
      byCategory[n.category] = (byCategory[n.category] || 0) + 1;
      byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total,
        unread,
        byCategory,
        byPriority
      }
    });
  } catch (error) {
    console.error('❌ 获取统计失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取统计失败' }
    });
  }
});

module.exports = router;
