/**
 * Task GitHub 控制器
 * 处理从 GitHub 读取任务的 HTTP 请求
 */

const githubService = require('../services/githubService');

class TaskGitHubController {
  /**
   * 获取 Agent 的任务列表（从 GitHub task.md）
   * GET /api/v1/tasks/github/:agentId
   */
  static async getAgentTasks(req, res, next) {
    try {
      const { agentId } = req.params;
      const { branch } = req.query;

      if (!agentId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'agentId 是必填参数',
          },
        });
      }

      const result = await githubService.getAgentTasks(agentId, branch || 'main');

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'GITHUB_FETCH_ERROR',
            message: result.error,
          },
        });
      }

      res.json({
        success: true,
        data: result.data,
        source: 'github',
        metadata: result.metadata,
        message: '从 GitHub 获取任务成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取所有 Agent 的任务列表
   * GET /api/v1/tasks/github/all
   */
  static async getAllAgentTasks(req, res, next) {
    try {
      const { branch } = req.query;
      const agents = ['xiaoruan', 'xiaoce', 'main']; // 可以配置
      const allTasks = {};

      for (const agentId of agents) {
        const result = await githubService.getAgentTasks(agentId, branch || 'main');
        if (result.success) {
          allTasks[agentId] = result.data;
        }
      }

      res.json({
        success: true,
        data: allTasks,
        source: 'github',
        message: '从 GitHub 获取所有 Agent 任务成功',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskGitHubController;
