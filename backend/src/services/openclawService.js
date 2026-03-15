/**
 * OpenClaw Gateway API 服务
 * 实现与 OpenClaw 的真实连接，提供实时 Agent 数据
 */

const axios = require('axios');

class OpenClawService {
  constructor() {
    // OpenClaw Gateway 基础 URL
    this.baseUrl = process.env.OPENCLAW_BASE_URL || 'http://localhost:18792';
    // 重试配置
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 秒
    // 超时配置
    this.timeout = 5000; // 5 秒
  }

  /**
   * 延迟函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 带重试的 API 调用
   */
  async callWithRetry(url, options = {}, retryCount = 0) {
    try {
      const response = await axios({
        url,
        timeout: this.timeout,
        ...options,
      });
      return response.data;
    } catch (error) {
      // 网络错误或超时，尝试重试
      if (retryCount < this.maxRetries) {
        console.warn(`OpenClaw API 调用失败，第 ${retryCount + 1} 次重试...`, error.message);
        await this.sleep(this.retryDelay * (retryCount + 1));
        return this.callWithRetry(url, options, retryCount + 1);
      }
      // 重试失败，抛出错误
      throw error;
    }
  }

  /**
   * 获取会话列表（Agent 列表）
   * GET /sessions/list
   */
  async getSessions() {
    try {
      const data = await this.callWithRetry(`${this.baseUrl}/sessions/list`);
      return {
        success: true,
        data: data.sessions || [],
      };
    } catch (error) {
      console.error('OpenClaw getSessions 失败:', error.message);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * 获取 Agent 列表
   * GET /agents_list
   */
  async getAgents() {
    try {
      const data = await this.callWithRetry(`${this.baseUrl}/agents_list`);
      return {
        success: true,
        data: data.agents || [],
      };
    } catch (error) {
      console.error('OpenClaw getAgents 失败:', error.message);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * 获取会话历史（Agent 详情/消息历史）
   * GET /sessions_history?sessionKey=xxx
   */
  async getSessionHistory(sessionKey, limit = 10) {
    try {
      const data = await this.callWithRetry(`${this.baseUrl}/sessions_history`, {
        params: { sessionKey, limit },
      });
      return {
        success: true,
        data: data.messages || [],
      };
    } catch (error) {
      console.error('OpenClaw getSessionHistory 失败:', error.message);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * 获取会话状态
   * 通过分析会话信息判断 Agent 状态
   */
  async getSessionStatus(sessionKey) {
    try {
      const sessions = await this.getSessions();
      if (!sessions.success) {
        return {
          success: false,
          error: sessions.error,
        };
      }

      const session = sessions.data.find(s => s.sessionKey === sessionKey);
      if (!session) {
        return {
          success: false,
          error: 'Session not found',
        };
      }

      // 转换会话状态为 Agent 状态
      return {
        success: true,
        data: {
          sessionKey: session.sessionKey,
          status: session.active ? 'online' : 'offline',
          lastActive: session.lastActive || session.createdAt,
          model: session.model,
        },
      };
    } catch (error) {
      console.error('OpenClaw getSessionStatus 失败:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 转换 OpenClaw 会话数据为 Agent 格式
   */
  transformSessionsToAgents(sessions) {
    return sessions.map(session => ({
      id: session.sessionKey || session.id,
      name: session.label || session.agentId || 'unknown',
      display_name: session.label || session.agentId || 'Unknown Agent',
      description: `OpenClaw Agent - ${session.model || 'default'}`,
      status: session.active ? 'online' : 'offline',
      capabilities: ['chat', 'task_execution'],
      config: {
        model: session.model,
        sessionKey: session.sessionKey,
      },
      metadata: {
        source: 'openclaw',
        createdAt: session.createdAt,
        lastActive: session.lastActive,
      },
    }));
  }

  /**
   * 检查 OpenClaw 服务是否可用
   */
  async isAvailable() {
    try {
      await this.callWithRetry(`${this.baseUrl}/sessions/list`, { timeout: 2000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// 导出单例
module.exports = new OpenClawService();
