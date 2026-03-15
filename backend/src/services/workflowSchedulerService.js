/**
 * Workflow Scheduler Service
 * 工作流调度服务 - 自动任务分配 + 智能调度
 */

class WorkflowSchedulerService {
  constructor() {
    // 任务队列
    this.taskQueue = [];
    // 可用 Agent 列表
    this.availableAgents = [
      { id: 'xiaoruan', name: '小软', status: 'idle', load: 0 },
      { id: 'xiaoce', name: '小测', status: 'idle', load: 0 },
    ];
  }

  /**
   * 自动分配任务算法
   */
  autoAssignTask(task) {
    // 找到负载最低的可用 Agent
    const availableAgent = this.availableAgents
      .filter(a => a.status === 'idle')
      .sort((a, b) => a.load - b.load)[0];

    if (availableAgent) {
      availableAgent.load += 1;
      return {
        success: true,
        agentId: availableAgent.id,
        agentName: availableAgent.name,
      };
    }

    return {
      success: false,
      message: '暂无可用 Agent',
    };
  }

  /**
   * 添加任务到队列
   */
  addTaskToQueue(task) {
    const taskWithMeta = {
      ...task,
      id: `task_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.taskQueue.push(taskWithMeta);
    return taskWithMeta;
  }

  /**
   * 处理任务队列
   */
  processQueue() {
    const pendingTasks = this.taskQueue.filter(t => t.status === 'pending');
    const results = [];

    for (const task of pendingTasks) {
      const assignment = this.autoAssignTask(task);
      if (assignment.success) {
        task.status = 'assigned';
        task.agentId = assignment.agentId;
        task.assignedAt = new Date().toISOString();
        results.push({ task, assignment });
      }
    }

    return results;
  }

  /**
   * 获取任务队列状态
   */
  getQueueStatus() {
    return {
      total: this.taskQueue.length,
      pending: this.taskQueue.filter(t => t.status === 'pending').length,
      assigned: this.taskQueue.filter(t => t.status === 'assigned').length,
      completed: this.taskQueue.filter(t => t.status === 'completed').length,
    };
  }

  /**
   * 获取任务队列
   */
  getTaskQueue() {
    return this.taskQueue;
  }

  /**
   * 获取 Agent 负载状态
   */
  getAgentLoad() {
    return this.availableAgents;
  }
}

module.exports = new WorkflowSchedulerService();
