/**
 * Dashboard WebSocket Service
 * 仪表盘实时更新 WebSocket 服务
 */

const WebSocket = require('ws');

class DashboardWebSocketService {
  constructor(server) {
    this.wss = null;
    this.clients = new Set();
    this.server = server;
    this.updateInterval = null;
  }

  /**
   * 初始化 WebSocket 服务器
   */
  init() {
    this.wss = new WebSocket.Server({
      server: this.server,
      path: '/ws/dashboard'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('✅ Dashboard WebSocket 新连接');
      this.clients.add(ws);

      // 发送欢迎消息
      this.sendToClient(ws, {
        type: 'connected',
        message: '已连接到仪表盘实时更新',
        timestamp: new Date().toISOString(),
      });

      ws.on('close', () => {
        console.log('⚠️ Dashboard WebSocket 连接关闭');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ Dashboard WebSocket 错误:', error);
        this.clients.delete(ws);
      });
    });

    // 定时推送更新（每 10 秒）
    this.startPeriodicUpdates();

    console.log('✅ Dashboard WebSocket 服务已启动');
  }

  /**
   * 发送消息给单个客户端
   */
  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  /**
   * 广播消息给所有客户端
   */
  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * 定时推送更新
   */
  startPeriodicUpdates() {
    this.updateInterval = setInterval(() => {
      this.broadcast({
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
        message: '仪表盘数据更新',
      });
    }, 10000); // 每 10 秒
  }

  /**
   * 推送 Agent 状态更新
   */
  pushAgentUpdate(agentData) {
    this.broadcast({
      type: 'agent_update',
      data: agentData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 推送任务状态更新
   */
  pushTaskUpdate(taskData) {
    this.broadcast({
      type: 'task_update',
      data: taskData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 推送活动更新
   */
  pushActivityUpdate(activityData) {
    this.broadcast({
      type: 'activity_update',
      data: activityData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 停止服务
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    this.clients.clear();
    console.log('⚠️ Dashboard WebSocket 服务已停止');
  }
}

module.exports = DashboardWebSocketService;
