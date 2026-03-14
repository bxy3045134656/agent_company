/**
 * stageService.js
 * 舞台系统 WebSocket 服务 - 实时同步 Agent 工作状态
 * @author 小软 🤖
 * @version 1.0.0
 */

const WebSocket = require('ws');

class StageWebSocketService {
  constructor(server) {
    this.wss = null;
    this.clients = new Set();
    this.agents = new Map();
    this.server = server;
    
    // 初始化示例 Agent 数据
    this.initMockAgents();
  }

  /**
   * 初始化示例 Agent 数据
   */
  initMockAgents() {
    this.agents.set('xiaoruan', {
      id: 'xiaoruan',
      name: '小软 🤖',
      status: 'working',
      statusText: '开发舞台系统',
      task: 'Issue #2 - 舞台系统',
      progress: 75,
      color: '#4CAF50'
    });

    this.agents.set('xiaobai', {
      id: 'xiaobai',
      name: '白小白 👨‍💼',
      status: 'idle',
      statusText: '审核代码',
      task: 'Code Review',
      progress: 0,
      color: '#2196F3'
    });

    this.agents.set('xiaoce', {
      id: 'xiaoce',
      name: '小测 🧪',
      status: 'working',
      statusText: '执行测试',
      task: '自动化测试',
      progress: 45,
      color: '#FF9800'
    });
  }

  /**
   * 初始化 WebSocket 服务器
   */
  init() {
    this.wss = new WebSocket.Server({ 
      server: this.server,
      path: '/ws/stage'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('✅ 新的 WebSocket 连接');
      this.clients.add(ws);

      // 发送当前所有 Agent 状态
      this.sendToClient(ws, {
        type: 'connected',
        agents: this.getAllAgents()
      });

      ws.on('close', () => {
        console.log('⚠️ WebSocket 连接关闭');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket 错误:', error);
        this.clients.delete(ws);
      });
    });

    console.log('🎭 舞台 WebSocket 服务已启动');
  }

  /**
   * 发送消息给客户端
   * @param {WebSocket} ws - WebSocket 连接
   * @param {Object} data - 数据
   */
  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  /**
   * 广播消息给所有客户端
   * @param {Object} data - 数据
   */
  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * 获取所有 Agent 状态
   * @returns {Array} Agent 列表
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * 获取单个 Agent 状态
   * @param {string} agentId - Agent ID
   * @returns {Object|null} Agent 数据
   */
  getAgent(agentId) {
    return this.agents.get(agentId) || null;
  }

  /**
   * 更新 Agent 状态
   * @param {string} agentId - Agent ID
   * @param {Object} status - 状态数据
   */
  updateAgentStatus(agentId, status) {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      Object.assign(agent, status);
      
      // 广播更新
      this.broadcast({
        type: 'agent_update',
        agents: this.getAllAgents()
      });

      console.log(`📡 Agent ${agentId} 状态已更新：${status.statusText}`);
      return agent;
    }
    return null;
  }

  /**
   * 添加 Agent
   * @param {Object} agent - Agent 数据
   */
  addAgent(agent) {
    this.agents.set(agent.id, agent);
    this.broadcast({
      type: 'agent_update',
      agents: this.getAllAgents()
    });
    return agent;
  }

  /**
   * 移除 Agent
   * @param {string} agentId - Agent ID
   */
  removeAgent(agentId) {
    if (this.agents.delete(agentId)) {
      this.broadcast({
        type: 'agent_update',
        agents: this.getAllAgents()
      });
      return true;
    }
    return false;
  }

  /**
   * 获取连接数
   * @returns {number} 连接数
   */
  getConnectionCount() {
    return this.clients.size;
  }
}

module.exports = StageWebSocketService;
