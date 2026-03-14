/**
 * 通知系统 WebSocket 服务
 * 实现 Dashboard、Forum、Monitor 的实时数据推送
 * 
 * @author 小软 🤖
 * @version 1.0.0
 */

const WebSocket = require('ws');

class NotificationWebSocketService {
  constructor(server) {
    this.wss = null;
    this.clients = new Set();
    this.server = server;
  }

  /**
   * 初始化 WebSocket 服务
   */
  init() {
    // 创建 WebSocket 服务器
    this.wss = new WebSocket.Server({ 
      server: this.server,
      path: '/ws/notifications'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('🔔 新的通知连接');
      this.clients.add(ws);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('❌ 解析消息失败:', error);
        }
      });

      ws.on('close', () => {
        console.log('🔔 通知连接关闭');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket 错误:', error);
        this.clients.delete(ws);
      });

      // 发送欢迎消息
      ws.send(JSON.stringify({
        type: 'connected',
        message: '已连接到通知系统',
        timestamp: new Date().toISOString()
      }));
    });

    console.log('🔔 通知 WebSocket 服务已启动：ws://localhost:3001/ws/notifications');
  }

  /**
   * 处理客户端消息
   */
  handleMessage(ws, data) {
    const { type, payload } = data;

    switch (type) {
      case 'subscribe':
        // 订阅特定类型的通知
        ws.subscriptions = ws.subscriptions || new Set();
        if (payload && Array.isArray(payload.types)) {
          payload.types.forEach(t => ws.subscriptions.add(t));
        }
        ws.send(JSON.stringify({
          type: 'subscribed',
          types: Array.from(ws.subscriptions),
          timestamp: new Date().toISOString()
        }));
        break;

      case 'unsubscribe':
        // 取消订阅
        if (ws.subscriptions && payload && payload.type) {
          ws.subscriptions.delete(payload.type);
        }
        break;

      case 'heartbeat':
        // 心跳检测
        ws.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        }));
        break;

      default:
        console.warn('⚠️ 未知消息类型:', type);
    }
  }

  /**
   * 广播通知给所有客户端
   */
  broadcast(notification) {
    const message = JSON.stringify({
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // 检查客户端是否订阅了该类型
        if (!client.subscriptions || 
            !notification.type || 
            client.subscriptions.has(notification.type) ||
            client.subscriptions.has('all')) {
          client.send(message);
        }
      }
    });

    console.log(`🔔 已广播通知：${notification.type}`, notification);
  }

  /**
   * 发送 Dashboard 实时数据更新
   */
  sendDashboardUpdate(data) {
    this.broadcast({
      type: 'dashboard_update',
      category: 'dashboard',
      priority: 'normal',
      data: data
    });
  }

  /**
   * 发送 Forum 新回复通知
   */
  sendForumReply(data) {
    this.broadcast({
      type: 'forum_reply',
      category: 'forum',
      priority: 'normal',
      data: data
    });
  }

  /**
   * 发送 Forum @提及通知
   */
  sendForumMention(data) {
    this.broadcast({
      type: 'forum_mention',
      category: 'forum',
      priority: 'high',
      data: data
    });
  }

  /**
   * 发送 Monitor 告警通知
   */
  sendMonitorAlert(data) {
    this.broadcast({
      type: 'monitor_alert',
      category: 'monitor',
      priority: data.priority || 'high',
      data: data
    });
  }

  /**
   * 发送 Agent 状态更新
   */
  sendAgentStatusUpdate(data) {
    this.broadcast({
      type: 'agent_status',
      category: 'agent',
      priority: 'normal',
      data: data
    });
  }

  /**
   * 获取在线客户端数量
   */
  getClientCount() {
    return this.clients.size;
  }
}

module.exports = NotificationWebSocketService;
