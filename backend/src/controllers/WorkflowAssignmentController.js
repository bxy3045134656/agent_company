/**
 * Workflow Assignment Controller
 * 工作流任务分配控制器
 */

const workflowSchedulerService = require('../services/workflowSchedulerService');

class WorkflowAssignmentController {
  /**
   * 自动分配任务
   * POST /api/v1/workflow/assign
   */
  static async assignTask(req, res, next) {
    try {
      const { title, priority, deadline } = req.body;
      
      if (!title) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'title 是必填字段' },
        });
      }

      const task = { title, priority: priority || 'normal', deadline };
      const queuedTask = workflowSchedulerService.addTaskToQueue(task);
      const assignment = workflowSchedulerService.autoAssignTask(queuedTask);

      res.json({
        success: assignment.success,
        data: {
          task: queuedTask,
          assignment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取任务队列
   * GET /api/v1/workflow/queue
   */
  static async getQueue(req, res, next) {
    try {
      const queue = workflowSchedulerService.getTaskQueue();
      const status = workflowSchedulerService.getQueueStatus();
      
      res.json({
        success: true,
        data: { queue, status },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 处理任务队列
   * POST /api/v1/workflow/process
   */
  static async processQueue(req, res, next) {
    try {
      const results = workflowSchedulerService.processQueue();
      
      res.json({
        success: true,
        data: { assigned: results.length, results },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取 Agent 负载状态
   * GET /api/v1/workflow/agents/load
   */
  static async getAgentLoad(req, res, next) {
    try {
      const agents = workflowSchedulerService.getAgentLoad();
      
      res.json({
        success: true,
        data: agents,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WorkflowAssignmentController;
