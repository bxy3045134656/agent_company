/**
 * Task 控制器
 * 处理任务相关的 HTTP 请求
 */

const Task = require('../models/Task');
const Agent = require('../models/Agent');

class TaskController {
  /**
   * 获取所有任务
   * GET /api/v1/tasks
   */
  static async list(req, res, next) {
    try {
      const { status, agent_id, priority, limit, offset } = req.query;
      const tasks = await Task.findAll({
        status,
        agent_id: parseInt(agent_id),
        priority,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
      });

      res.json({
        success: true,
        data: tasks,
        message: '获取成功',
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
   */
  static async create(req, res, next) {
    try {
      const { title, description, agent_id, status, priority, due_date } = req.body;

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
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, result } = req.body;

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
