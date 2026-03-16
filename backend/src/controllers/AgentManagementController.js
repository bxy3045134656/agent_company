/**
 * Agent Management Controller
 * Agent 管理控制器 - 实现 CRUD 操作
 */

const axios = require('axios');

class AgentManagementController {
  constructor() {
    this.openclawBaseUrl = process.env.OPENCLAW_BASE_URL || 'http://localhost:18792';
  }

  /**
   * 获取所有 Agent（从 OpenClaw）
   * GET /api/v1/agents/management/list
   */
  static async listAgents(req, res, next) {
    try {
      const controller = new AgentManagementController();
      const agents = await controller.getAgentsFromOpenClaw();
      
      res.json({
        success: true,
        data: agents,
        message: '获取 Agent 列表成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取单个 Agent 详情
   * GET /api/v1/agents/management/:id
   */
  static async getAgent(req, res, next) {
    try {
      const { id } = req.params;
      const controller = new AgentManagementController();
      const agent = await controller.getAgentFromOpenClaw(id);
      
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: { code: 'AGENT_NOT_FOUND', message: 'Agent 不存在' },
        });
      }
      
      res.json({
        success: true,
        data: agent,
        message: '获取 Agent 详情成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建 Agent（Spawn new session）
   * POST /api/v1/agents/management/spawn
   */
  static async spawnAgent(req, res, next) {
    try {
      const { agentId, model, task } = req.body;
      const controller = new AgentManagementController();
      const result = await controller.spawnAgentInOpenClaw(agentId, model, task);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Agent 创建成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新 Agent 状态
   * PUT /api/v1/agents/management/:id/status
   */
  static async updateAgentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, task } = req.body;
      const controller = new AgentManagementController();
      const agent = await controller.updateAgentStatusInOpenClaw(id, status, task);
      
      res.json({
        success: true,
        data: agent,
        message: 'Agent 状态更新成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除 Agent
   * DELETE /api/v1/agents/management/:id
   */
  static async deleteAgent(req, res, next) {
    try {
      const { id } = req.params;
      const controller = new AgentManagementController();
      await controller.deleteAgentFromOpenClaw(id);
      
      res.json({
        success: true,
        message: 'Agent 删除成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 从 OpenClaw 获取 Agent 列表
   */
  async getAgentsFromOpenClaw() {
    try {
      const response = await axios.get(`${this.openclawBaseUrl}/sessions/list`);
      return response.data.sessions || [];
    } catch (error) {
      console.error('OpenClaw API 调用失败:', error.message);
      return [];
    }
  }

  /**
   * 从 OpenClaw 获取单个 Agent
   */
  async getAgentFromOpenClaw(sessionKey) {
    try {
      const response = await axios.get(`${this.openclawBaseUrl}/sessions_history`, {
        params: { sessionKey, limit: 1 },
      });
      return response.data.messages ? response.data.messages[0] : null;
    } catch (error) {
      console.error('OpenClaw API 调用失败:', error.message);
      return null;
    }
  }

  /**
   * 在 OpenClaw 中创建 Agent
   */
  async spawnAgentInOpenClaw(agentId, model, task) {
    try {
      const response = await axios.post(`${this.openclawBaseUrl}/sessions/spawn`, {
        agentId,
        model,
        task,
      });
      return response.data;
    } catch (error) {
      console.error('OpenClaw Spawn API 调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 更新 OpenClaw 中 Agent 状态
   */
  async updateAgentStatusInOpenClaw(sessionKey, status, task) {
    try {
      const response = await axios.post(`${this.openclawBaseUrl}/sessions/send`, {
        sessionKey,
        message: `更新状态：${status}, 任务：${task}`,
      });
      return response.data;
    } catch (error) {
      console.error('OpenClaw Send API 调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 删除 OpenClaw 中 Agent
   */
  async deleteAgentFromOpenClaw(sessionKey) {
    try {
      await axios.delete(`${this.openclawBaseUrl}/sessions/close`, {
        params: { sessionKey },
      });
    } catch (error) {
      console.error('OpenClaw Close API 调用失败:', error.message);
      throw error;
    }
  }
}

module.exports = AgentManagementController;
