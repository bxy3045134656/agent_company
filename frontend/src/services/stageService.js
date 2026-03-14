/**
 * stageService.js
 * 舞台系统 WebSocket 服务 - 实时同步 Agent 工作状态
 * @author 小软 🤖
 * @version 1.0.0
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001/ws/stage';

/**
 * StageService - 舞台系统服务类
 */
class StageService {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.listeners = [];
    this.connected = false;
  }

  /**
   * 连接 WebSocket
   */
  connect() {
    if (this.ws) {
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('✅ 舞台 WebSocket 连接成功');
        this.connected = true;
        this.notifyListeners({ type: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📡 收到舞台数据:', data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('❌ 解析 WebSocket 消息失败:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('⚠️ 舞台 WebSocket 连接关闭');
        this.connected = false;
        this.notifyListeners({ type: 'disconnected' });
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ 舞台 WebSocket 错误:', error);
        this.connected = false;
      };
    } catch (error) {
      console.error('❌ 创建 WebSocket 连接失败:', error);
      this.reconnect();
    }
  }

  /**
   * 重连机制
   */
  reconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      console.log('🔄 尝试重新连接舞台 WebSocket...');
      this.connect();
    }, 3000); // 3 秒后重连
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
  }

  /**
   * 添加监听器
   * @param {Function} listener - 回调函数
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * 移除监听器
   * @param {Function} listener - 回调函数
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * 通知所有监听器
   * @param {Object} data - 数据
   */
  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('❌ 监听器执行失败:', error);
      }
    });
  }

  /**
   * 获取所有 Agent 状态（HTTP 备用方案）
   * @returns {Promise<Array>} Agent 列表
   */
  async getAgents() {
    try {
      const response = await axios.get(`${API_BASE_URL}/agents`);
      return response.data.data || [];
    } catch (error) {
      console.error('❌ 获取 Agent 列表失败:', error);
      // 返回示例数据用于开发测试
      return this.getMockAgents();
    }
  }

  /**
   * 获取示例 Agent 数据（开发测试用）
   * @returns {Array} Agent 列表
   */
  getMockAgents() {
    return [
      {
        id: 'xiaoruan',
        name: '小软 🤖',
        status: 'working',
        statusText: '开发舞台系统',
        task: 'Issue #1 - 舞台系统',
        progress: 75,
        color: '#4CAF50'
      },
      {
        id: 'xiaobai',
        name: '白小白 👨‍💼',
        status: 'idle',
        statusText: '审核代码',
        task: 'Code Review',
        progress: 0,
        color: '#2196F3'
      },
      {
        id: 'xiaoce',
        name: '小测 🧪',
        status: 'working',
        statusText: '执行测试',
        task: '自动化测试',
        progress: 45,
        color: '#FF9800'
      }
    ];
  }

  /**
   * 更新 Agent 状态
   * @param {string} agentId - Agent ID
   * @param {Object} status - 状态数据
   */
  async updateAgentStatus(agentId, status) {
    try {
      await axios.put(`${API_BASE_URL}/agents/${agentId}/status`, status);
    } catch (error) {
      console.error('❌ 更新 Agent 状态失败:', error);
    }
  }
}

// 导出单例
export const stageService = new StageService();
export default stageService;
