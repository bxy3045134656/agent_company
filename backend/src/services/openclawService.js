/**
 * openclawService.js
 * OpenClaw Agent 连接服务 - 获取 OpenClaw 中所有活跃 Agent
 * @author 小软 🤖
 * @version 1.0.0
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class OpenClawService {
  constructor() {
    this.cache = null;
    this.cacheTime = 0;
    this.cacheTTL = 5000; // 5 秒缓存
  }

  /**
   * 获取 OpenClaw 中所有活跃 Agent
   * 调用 sessions_list API
   * @returns {Promise<Array>} Agent 列表
   */
  async getActiveAgents() {
    // 检查缓存
    const now = Date.now();
    if (this.cache && (now - this.cacheTime) < this.cacheTTL) {
      console.log('📦 使用缓存的 Agent 数据');
      return this.cache;
    }

    try {
      console.log('🔍 从 OpenClaw 获取活跃 Agent...');
      
      // 调用 OpenClaw sessions_list 命令
      const { stdout } = await execAsync(
        'openclaw sessions list --messageLimit 1',
        { 
          encoding: 'utf8',
          timeout: 10000
        }
      );

      // 解析输出
      const agents = this.parseSessionsOutput(stdout);
      
      // 更新缓存
      this.cache = agents;
      this.cacheTime = now;

      console.log(`✅ 获取到 ${agents.length} 个活跃 Agent`);
      return agents;
    } catch (error) {
      console.error('❌ 获取 OpenClaw Agent 失败:', error.message);
      
      // 降级：返回模拟数据
      return this.getMockAgents();
    }
  }

  /**
   * 解析 sessions list 输出
   * @param {string} output - 命令输出
   * @returns {Array} Agent 列表
   */
  parseSessionsOutput(output) {
    const agents = [];
    
    try {
      // 尝试解析 JSON 输出
      const lines = output.trim().split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        // 尝试解析每一行为 JSON
        try {
          const session = JSON.parse(line);
          if (session && session.sessionKey) {
            agents.push({
              id: session.sessionKey,
              name: session.label || session.sessionKey,
              status: session.active ? 'working' : 'idle',
              statusText: this.getStatusText(session),
              task: session.lastMessage?.substring(0, 50) || '无任务',
              progress: 0,
              color: this.getStatusColor(session.active)
            });
          }
        } catch (e) {
          // 不是 JSON，跳过
          continue;
        }
      }
    } catch (error) {
      console.error('解析输出失败:', error.message);
    }

    return agents;
  }

  /**
   * 获取状态文本
   * @param {Object} session - 会话数据
   * @returns {string} 状态文本
   */
  getStatusText(session) {
    if (!session.active) return '空闲';
    
    const lastMsg = session.lastMessage || '';
    if (lastMsg.includes('开发')) return '开发中';
    if (lastMsg.includes('测试')) return '测试中';
    if (lastMsg.includes('审核')) return '审核中';
    
    return '工作中';
  }

  /**
   * 获取状态颜色
   * @param {boolean} active - 是否活跃
   * @returns {string} 颜色代码
   */
  getStatusColor(active) {
    return active ? '#4CAF50' : '#9E9E9E';
  }

  /**
   * 获取 Agent 详情
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object|null>} Agent 详情
   */
  async getAgentDetails(agentId) {
    try {
      const { stdout } = await execAsync(
        `openclaw sessions history --sessionKey ${agentId} --limit 5`,
        { 
          encoding: 'utf8',
          timeout: 10000
        }
      );

      return {
        id: agentId,
        history: stdout
      };
    } catch (error) {
      console.error(`获取 Agent ${agentId} 详情失败:`, error.message);
      return null;
    }
  }

  /**
   * 手动刷新缓存
   */
  refreshCache() {
    this.cache = null;
    this.cacheTime = 0;
    console.log('🔄 Agent 缓存已刷新');
  }

  /**
   * 获取模拟 Agent 数据（降级方案）
   * @returns {Array} 模拟 Agent 列表
   */
  getMockAgents() {
    console.log('⚠️ 使用模拟 Agent 数据（降级模式）');
    return [
      {
        id: 'xiaoruan-dev',
        name: '小软 🤖',
        status: 'working',
        statusText: '开发 OpenClaw 连接',
        task: 'Issue #18 - OpenClaw Agent 连接',
        progress: 75,
        color: '#4CAF50'
      },
      {
        id: 'xiaobai-manager',
        name: '白小白 👨‍💼',
        status: 'idle',
        statusText: '审核代码',
        task: 'Code Review',
        progress: 0,
        color: '#2196F3'
      },
      {
        id: 'xiaoce-tester',
        name: '小测 🧪',
        status: 'working',
        statusText: '执行测试',
        task: '自动化测试',
        progress: 45,
        color: '#FF9800'
      }
    ];
  }
}

module.exports = OpenClawService;
