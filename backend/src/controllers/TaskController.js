/**
 * Task 控制器
 * 处理任务相关的 HTTP 请求
 * 支持 OpenClaw 双向同步
 */

const Task = require('../models/Task');
const Agent = require('../models/Agent');
const openclawService = require('../services/openclawService');

class TaskController {
  /**
   * 获取所有任务
   * GET /api/v1/tasks
   * 支持参数：source=openclaw（从 OpenClaw 获取）| source=local（从本地获取）
   * 支持筛选：status, agent_id, priority, date_range
   */
  static async list(req, res, next) {
    try {
      const { status, agent_id, priority, limit, offset, source, date_range } = req.query;
      
      // 如果指定了 source=openclaw，尝试从 OpenClaw 获取
      if (source === 'openclaw') {
        try {
          // 从 OpenClaw 获取所有 Agent 的任务
          const agentsResult = await openclawService.getAgents();
          
          if (agentsResult.success && agentsResult.data.length > 0) {
            const allTasks = [];
            
            // 获取每个 Agent 的任务
            for (const agent of agentsResult.data) {
              const tasksResult = await openclawService.getAgentTasks(agent.id || agent.name);
              if (tasksResult.success) {
                allTasks.push(...tasksResult.data);
              }
            }
            
            // 应用筛选
            let filteredTasks = allTasks;
            if (status) {
              filteredTasks = filteredTasks.filter(t => t.status === status);
            }
            if (agent_id) {
              filteredTasks = filteredTasks.filter(t => t.agentId === agent_id);
            }
            
            // 分页
            const limitNum = parseInt(limit) || 50;
            const offsetNum = parseInt(offset) || 0;
            const paginatedTasks = filteredTasks.slice(offsetNum, offsetNum + limitNum);
            
            return res.json({
              success: true,
              data: paginatedTasks,
              source: 'openclaw',
              total: filteredTasks.length,
              message: '从 OpenClaw 获取成功',
            });
          }
        } catch (error) {
          console.warn('OpenClaw 获取失败，降级到本地数据:', error.message);
        }
      }
      
      // 默认：从本地数据库获取
      const tasks = await Task.findAll({
        status,
        agent_id: parseInt(agent_id),
        priority,
        date_range,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
      });

      res.json({
        success: true,
        data: tasks,
        source: 'local',
        message: '从本地数据库获取成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取单个任务
   * GET /api/v1/tasks/:id
   */
  static async get(req, res, next) {
    try {
      const { id } = req.params;
      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: '任务不存在',
          },
        });
      }

      res.json({
        success: true,
        data: task,
        message: '获取成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建任务
   * POST /api/v1/tasks
   * 支持参数：sync_to_openclaw=true（同步到 OpenClaw）
   */
  static async create(req, res, next) {
    try {
      const { title, description, agent_id, status, priority, due_date, sync_to_openclaw } = req.body;

      // 验证必填字段
      if (!title) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'title 是必填字段',
          },
        });
      }

      // 如果指定了 agent_id，验证 Agent 是否存在
      if (agent_id) {
        const agent = await Agent.findById(agent_id);
        if (!agent) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'AGENT_NOT_FOUND',
              message: '指定的 Agent 不存在',
            },
          });
        }
      }

      const task = await Task.create({
        title,
        description,
        agent_id,
        status,
        priority,
        due_date,
      });

      // 如果指定了同步到 OpenClaw，执行同步
      if (sync_to_openclaw && agent_id) {
        try {
          // 获取 Agent 的 sessionKey
          const agentData = await Agent.findById(agent_id);
          if (agentData && agentData.config && agentData.config.sessionKey) {
            await openclawService.syncTaskToOpenClaw(agentData.config.sessionKey, {
              title,
              description,
              priority,
              due_date,
            });
          }
        } catch (syncError) {
          console.warn('同步到 OpenClaw 失败，但任务已创建:', syncError.message);
        }
      }

      res.status(201).json({
        success: true,
        data: task,
        message: '任务创建成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新任务
   * PUT /api/v1/tasks/:id
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      const task = await Task.update(id, data);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: '任务不存在',
          },
        });
      }

      res.json({
        success: true,
        data: task,
        message: '任务更新成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新任务状态
   * PUT /api/v1/tasks/:id/status
   * 支持参数：sync_to_openclaw=true（同步到 OpenClaw）
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, result, sync_to_openclaw } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'status 是必填字段',
          },
        });
      }

      const task = await Task.updateStatus(id, status, result);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: '任务不存在',
          },
        });
      }

      // 如果指定了同步到 OpenClaw，执行同步
      if (sync_to_openclaw && task.agent_id) {
        try {
          const agentData = await Agent.findById(task.agent_id);
          if (agentData && agentData.config && agentData.config.sessionKey) {
            await openclawService.updateTaskStatusInOpenClaw(
              agentData.config.sessionKey,
              id,
              status
            );
          }
        } catch (syncError) {
          console.warn('同步到 OpenClaw 失败，但状态已更新:', syncError.message);
        }
      }

      res.json({
        success: true,
        data: task,
        message: '任务状态更新成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 分配任务
   * POST /api/v1/tasks/:id/assign
   */
  static async assign(req, res, next) {
    try {
      const { id } = req.params;
      const { agent_id } = req.body;

      if (!agent_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'agent_id 是必填字段',
          },
        });
      }

      // 验证 Agent 是否存在
      const agent = await Agent.findById(agent_id);
      if (!agent) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: '指定的 Agent 不存在',
          },
        });
      }

      const task = await Task.assign(id, agent_id);

      res.json({
        success: true,
        data: task,
        message: '任务分配成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除任务
   * DELETE /api/v1/tasks/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const task = await Task.delete(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: '任务不存在',
          },
        });
      }

      res.json({
        success: true,
        message: '任务删除成功',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
