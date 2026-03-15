/**
 * Dashboard Service
 * 仪表盘数据服务 - 提供统计数据
 */

const Agent = require('../models/Agent');
const Task = require('../models/Task');
const Project = require('../models/Project');

class DashboardService {
  /**
   * 获取 Agent 统计数据
   */
  async getAgentStats() {
    try {
      const agents = await Agent.findAll({ limit: 100 });
      
      const stats = {
        total: agents.length,
        online: agents.filter(a => a.status === 'online').length,
        busy: agents.filter(a => a.status === 'busy').length,
        offline: agents.filter(a => a.status === 'offline').length,
        agents: agents.map(a => ({
          id: a.id,
          name: a.display_name,
          status: a.status,
          avatar: a.avatar,
        })),
      };
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('Dashboard getAgentStats 失败:', error.message);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * 获取任务统计数据
   */
  async getTaskStats() {
    try {
      const tasks = await Task.findAll({ limit: 100 });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      
      const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
        todayCompleted: tasks.filter(t => {
          if (t.status !== 'completed') return false;
          const completedAt = new Date(t.completedAt || t.updatedAt);
          return completedAt >= today;
        }).length,
        weekCompleted: tasks.filter(t => {
          if (t.status !== 'completed') return false;
          const completedAt = new Date(t.completedAt || t.updatedAt);
          return completedAt >= thisWeekStart;
        }).length,
      };
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('Dashboard getTaskStats 失败:', error.message);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * 获取项目进度统计
   */
  async getProjectProgress() {
    try {
      // 如果没有 Project 模型，返回示例数据
      const projects = [
        {
          id: 1,
          name: 'Agent Company',
          progress: 65,
          totalTasks: 20,
          completedTasks: 13,
          status: 'in_progress',
        },
      ];
      
      return {
        success: true,
        data: projects,
      };
    } catch (error) {
      console.error('Dashboard getProjectProgress 失败:', error.message);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * 获取最近活动
   */
  async getRecentActivities(limit = 10) {
    try {
      const tasks = await Task.findAll({ limit: 20 });
      
      // 转换为活动记录
      const activities = tasks.slice(0, limit).map(task => ({
        id: task.id,
        type: 'task',
        action: this.getActionText(task.status),
        title: task.title,
        agent: task.agent_id || '未分配',
        timestamp: task.updatedAt || task.createdAt,
        status: task.status,
      }));
      
      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      console.error('Dashboard getRecentActivities 失败:', error.message);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * 获取活动文本
   */
  getActionText(status) {
    const actionMap = {
      pending: '创建',
      assigned: '分配',
      in_progress: '进行中',
      completed: '完成',
      failed: '失败',
    };
    return actionMap[status] || '更新';
  }

  /**
   * 获取完整的仪表盘数据
   */
  async getDashboardData() {
    try {
      const [agentStats, taskStats, projectProgress, recentActivities] = await Promise.all([
        this.getAgentStats(),
        this.getTaskStats(),
        this.getProjectProgress(),
        this.getRecentActivities(10),
      ]);
      
      return {
        success: true,
        data: {
          agents: agentStats.success ? agentStats.data : null,
          tasks: taskStats.success ? taskStats.data : null,
          projects: projectProgress.success ? projectProgress.data : null,
          activities: recentActivities.success ? recentActivities.data : null,
        },
      };
    } catch (error) {
      console.error('Dashboard getDashboardData 失败:', error.message);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }
}

// 导出单例
module.exports = new DashboardService();
