/**
 * Agent 控制器
 * 处理 Agent 相关的 HTTP 请求
 */

const Agent = require('../models/Agent');
const OpenClawService = require('../services/openclawService');

class AgentController {
  /**
   * 获取所有 Agents
   * GET /api/v1/agents
   */
  static async list(req, res, next) {
    try {
      const { status, limit, offset } = req.query;
      const agents = await Agent.findAll({
        status,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
      });

      res.json({
        success: true,
        data: agents,
        message: '获取成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取单个 Agent
   * GET /api/v1/agents/:id
   */
  static async get(req, res, next) {
    try {
      const { id } = req.params;
      const agent = await Agent.findById(id);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent 不存在',
          },
        });
      }

      res.json({
        success: true,
        data: agent,
        message: '获取成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建 Agent
   * POST /api/v1/agents
   */
  static async create(req, res, next) {
    try {
      const { name, display_name, description, capabilities, config } = req.body;

      // 验证必填字段
      if (!name) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'name 是必填字段',
          },
        });
      }

      // 检查名称是否已存在
      const existing = await Agent.findByName(name);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'AGENT_EXISTS',
            message: 'Agent 名称已存在',
          },
        });
      }

      const agent = await Agent.create({
        name,
        display_name,
        description,
        capabilities,
        config,
      });

      res.status(201).json({
        success: true,
        data: agent,
        message: 'Agent 创建成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新 Agent
   * PUT /api/v1/agents/:id
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      const agent = await Agent.update(id, data);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent 不存在',
          },
        });
      }

      res.json({
        success: true,
        data: agent,
        message: 'Agent 更新成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除 Agent
   * DELETE /api/v1/agents/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const agent = await Agent.delete(id);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent 不存在',
          },
        });
      }

      res.json({
        success: true,
        message: 'Agent 删除成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取 Agent 统计
   * GET /api/v1/agents/:id/stats
   */
  static async stats(req, res, next) {
    try {
      const { id } = req.params;
      const stats = await Agent.getStats(id);

      if (!stats) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent 不存在',
          },
        });
      }

      res.json({
        success: true,
        data: stats,
        message: '获取成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取 OpenClaw 活跃 Agent
   * GET /api/v1/agents/openclaw/active
   */
  static async getOpenClawAgents(req, res, next) {
    try {
      const openclawService = new OpenClawService();
      const agents = await openclawService.getActiveAgents();

      res.json({
        success: true,
        data: agents,
        message: '获取成功',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('获取 OpenClaw Agent 失败:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'OPENCLAW_ERROR',
          message: '获取 OpenClaw Agent 失败',
        },
      });
    }
  }

  /**
   * 刷新 OpenClaw Agent 缓存
   * POST /api/v1/agents/openclaw/refresh
   */
  static async refreshOpenClawAgents(req, res, next) {
    try {
      const openclawService = new OpenClawService();
      openclawService.refreshCache();
      const agents = await openclawService.getActiveAgents();

      res.json({
        success: true,
        data: agents,
        message: '刷新成功',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('刷新 OpenClaw Agent 失败:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'OPENCLAW_ERROR',
          message: '刷新 OpenClaw Agent 失败',
        },
      });
    }
  }
}

module.exports = AgentController;
