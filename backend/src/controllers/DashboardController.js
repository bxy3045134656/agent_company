/**
 * Dashboard 控制器
 * 处理仪表盘相关的 HTTP 请求
 */

const dashboardService = require('../services/dashboardService');

class DashboardController {
  /**
   * 获取完整的仪表盘数据
   * GET /api/v1/dashboard
   */
  static async getDashboard(req, res, next) {
    try {
      const result = await dashboardService.getDashboardData();
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DASHBOARD_FETCH_ERROR',
            message: result.error,
          },
        });
      }
      
      res.json({
        success: true,
        data: result.data,
        message: '获取仪表盘数据成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取 Agent 统计数据
   * GET /api/v1/dashboard/agents
   */
  static async getAgentStats(req, res, next) {
    try {
      const result = await dashboardService.getAgentStats();
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'AGENT_STATS_ERROR',
            message: result.error,
          },
        });
      }
      
      res.json({
        success: true,
        data: result.data,
        message: '获取 Agent 统计成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取任务统计数据
   * GET /api/v1/dashboard/tasks
   */
  static async getTaskStats(req, res, next) {
    try {
      const result = await dashboardService.getTaskStats();
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'TASK_STATS_ERROR',
            message: result.error,
          },
        });
      }
      
      res.json({
        success: true,
        data: result.data,
        message: '获取任务统计成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取项目进度
   * GET /api/v1/dashboard/projects
   */
  static async getProjectProgress(req, res, next) {
    try {
      const result = await dashboardService.getProjectProgress();
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'PROJECT_PROGRESS_ERROR',
            message: result.error,
          },
        });
      }
      
      res.json({
        success: true,
        data: result.data,
        message: '获取项目进度成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取最近活动
   * GET /api/v1/dashboard/activities
   */
  static async getRecentActivities(req, res, next) {
    try {
      const { limit } = req.query;
      const result = await dashboardService.getRecentActivities(parseInt(limit) || 10);
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'ACTIVITIES_FETCH_ERROR',
            message: result.error,
          },
        });
      }
      
      res.json({
        success: true,
        data: result.data,
        message: '获取最近活动成功',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
