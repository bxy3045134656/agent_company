/**
 * Agent 控制器
 * 处理 Agent 相关的 HTTP 请求
 */

const Agent = require('../models/Agent');
const openclawService = require('../services/openclawService');

class AgentController {
  /**
   * 获取所有 Agents
   * GET /api/v1/agents
   * 支持参数：source=openclaw（从 OpenClaw 获取）| source=local（从本地获取）
   */
  static async list(req, res, next) {
    try {
      const { status, limit, offset, source } = req.query;
      
      // 如果指定了 source=openclaw，优先从 OpenClaw 获取
      if (source === 'openclaw') {
        try {
          // 尝试从 OpenClaw 获取会话列表
          const sessionsResult = await openclawService.getSessions();
          
          if (sessionsResult.success && sessionsResult.data.length > 0) {
            // 转换 OpenClaw 会话数据为 Agent 格式
            const agents = openclawService.transformSessionsToAgents(sessionsResult.data);
            
            // 应用状态过滤
            const filteredAgents = status 
              ? agents.filter(a => a.status === status)
              : agents;
            
            // 应用分页
            const limitNum = parseInt(limit) || 50;
            const offsetNum = parseInt(offset) || 0;
            const paginatedAgents = filteredAgents.slice(offsetNum, offsetNum + limitNum);
            
            return res.json({
              success: true,
              data: paginatedAgents,
              source: 'openclaw',
              message: '从 OpenClaw 获取成功',
            });
          }
        } catch (error) {
          console.warn('OpenClaw 获取失败，降级到本地数据:', error.message);
        }
      }
      
      // 默认：从本地数据库获取（降级方案）
      const agents = await Agent.findAll({
        status,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
      });

      res.json({
        success: true,
        data: agents,
        source: 'local',
        message: '从本地数据库获取成功',
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
}

module.exports = AgentController;
