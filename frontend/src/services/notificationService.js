/**
 * 通知系统前端服务
 * 实现 WebSocket 连接和通知管理
 * 
 * @author 小软 🤖
 * @version 1.0.0
 */

const API_BASE_URL = 'http://127.0.0.1:3001/api/v1';
const WS_URL = 'ws://127.0.0.1:3001/ws/notifications';

class NotificationService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
    this.connected = false;
  }

  /**
   * 连接 WebSocket
   */
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('🔔 WebSocket 已连接');
      return;
    }

    // 检查浏览器是否支持 WebSocket
    if (typeof WebSocket === 'undefined') {
      console.warn('⚠️ 浏览器不支持 WebSocket，通知功能不可用');
      return;
    }

    try {
      console.log('🔔 正在连接 WebSocket:', WS_URL);
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('🔔 已连接到通知系统');
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // 订阅所有类型的通知
        this.subscribe(['all']);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ 解析通知消息失败:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔔 通知连接已关闭');
        this.connected = false;
        // 只在未达到最大重连次数时尝试重连
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.warn('⚠️ WebSocket 连接失败（可能是服务未启动或网络问题）:', error.message || error);
        this.connected = false;
        // 不立即重连，等待 onclose 触发
      };
    } catch (error) {
      console.error('❌ 创建 WebSocket 连接失败:', error);
      // 只在未达到最大重连次数时尝试重连
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    }
  }

  /**
   * 尝试重连
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.warn('⚠️ 达到最大重连次数，停止重连。通知功能将不可用，但其他功能正常。');
      // 不再输出错误，只输出警告
    }
  }

  /**
   * 处理收到的消息
   */
  handleMessage(message) {
    const { type, data } = message;

    console.log('🔔 收到通知消息:', type, data);

    // 特殊处理 @提及通知
    if (type === 'forum_mention' || (data && data.type === 'forum_mention')) {
      console.log('💬 收到 @提及通知:', data);
      // 可以添加特殊提示音或弹窗
      this.playMentionSound();
    }

    // 触发对应的监听器
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ 通知监听器错误:', error);
        }
      });
    }

    // 触发通用监听器
    if (this.listeners.has('all')) {
      this.listeners.get('all').forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('❌ 通用监听器错误:', error);
        }
      });
    }
  }

  /**
   * 播放 @提及提示音
   */
  playMentionSound() {
    // 简单的提示音（可以使用 Audio API）
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // 频率
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('⚠️ 播放提示音失败:', error);
    }
  }

  /**
   * 添加监听器
   */
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
    return () => this.off(type, callback);
  }

  /**
   * 移除监听器
   */
  off(type, callback) {
    if (this.listeners.has(type)) {
      const index = this.listeners.get(type).indexOf(callback);
      if (index > -1) {
        this.listeners.get(type).splice(index, 1);
      }
    }
  }

  /**
   * 订阅通知类型
   */
  subscribe(types) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        payload: { types }
      }));
    }
  }

  /**
   * 取消订阅
   */
  unsubscribe(type) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        payload: { type }
      }));
    }
  }

  /**
   * 发送心跳
   */
  heartbeat() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'heartbeat'
      }));
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }

  /**
   * 获取通知列表
   */
  async getNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/notifications${queryParams ? '?' + queryParams : ''}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('❌ 获取通知失败:', error);
      throw error;
    }
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread/count`);
      const result = await response.json();
      return result.data.count;
    } catch (error) {
      console.error('❌ 获取未读数失败:', error);
      return 0;
    }
  }

  /**
   * 创建通知
   */
  async createNotification(notification) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('❌ 创建通知失败:', error);
      throw error;
    }
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT'
      });
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('❌ 标记已读失败:', error);
      throw error;
    }
  }

  /**
   * 批量标记为已读
   */
  async markAllAsRead(ids = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read/all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ 批量标记失败:', error);
      throw error;
    }
  }

  /**
   * 删除通知
   */
  async deleteNotification(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ 删除通知失败:', error);
      throw error;
    }
  }

  /**
   * 获取通知统计
   */
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/stats`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('❌ 获取统计失败:', error);
      throw error;
    }
  }
}

// 导出单例
const notificationService = new NotificationService();
export default notificationService;
