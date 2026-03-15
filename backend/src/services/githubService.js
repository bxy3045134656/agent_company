/**
 * GitHub Service
 * 读取 GitHub 仓库文件（如 task.md）
 */

const axios = require('axios');

class GitHubService {
  constructor() {
    // GitHub API 配置
    this.owner = process.env.GITHUB_OWNER || 'bxy3045134656';
    this.repo = process.env.GITHUB_REPO || 'agent_company';
    this.token = process.env.GITHUB_TOKEN;
    this.baseUrl = 'https://api.github.com';
  }

  /**
   * 获取 GitHub 文件内容
   * @param {string} path - 文件路径（如 agents/xiaoruan/task.md）
   * @param {string} branch - 分支名（默认 main）
   */
  async getFileContent(path, branch = 'main') {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
      };
      
      // 如果有 token，添加认证
      if (this.token) {
        headers['Authorization'] = `token ${this.token}`;
      }

      const response = await axios.get(url, {
        headers,
        params: { ref: branch },
      });

      // GitHub 返回的是 base64 编码的内容
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      
      return {
        success: true,
        data: {
          content,
          sha: response.data.sha,
          size: response.data.size,
          encoding: response.data.encoding,
        },
      };
    } catch (error) {
      console.error('GitHub getFileContent 失败:', error.message);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * 解析 task.md 文件内容
   * 提取任务列表和状态
   */
  parseTaskMarkdown(content) {
    const tasks = [];
    
    // 简单解析 Markdown 格式的任务
    // 查找任务标题（#### 或 ### 开头）
    const taskRegex = /#{3,4}\s+(.+?)\n([\s\S]*?)(?=#{3,4}|\n---|\Z)/g;
    let match;
    
    while ((match = taskRegex.exec(content)) !== null) {
      const title = match[1].trim();
      const description = match[2].trim();
      
      // 提取任务信息
      const task = {
        id: `task_${tasks.length}`,
        title,
        description,
        status: this.extractStatus(description),
        priority: this.extractPriority(description),
        dueDate: this.extractDueDate(description),
        progress: this.extractProgress(description),
      };
      
      tasks.push(task);
    }
    
    return tasks;
  }

  /**
   * 从描述中提取状态
   */
  extractPriority(description) {
    if (description.includes('P0') || description.includes('最高优先级')) {
      return 'P0';
    } else if (description.includes('P1')) {
      return 'P1';
    } else if (description.includes('P2')) {
      return 'P2';
    }
    return 'normal';
  }

  /**
   * 从描述中提取状态
   */
  extractStatus(description) {
    if (description.includes('✅') || description.includes('已完成')) {
      return 'completed';
    } else if (description.includes('🟡') || description.includes('进行中')) {
      return 'in_progress';
    } else if (description.includes('⏳') || description.includes('待处理')) {
      return 'pending';
    }
    return 'pending';
  }

  /**
   * 从描述中提取截止日期
   */
  extractDueDate(description) {
    const dateRegex = /截止 [：:]\s*(\d{4}-\d{2}-\d{2})/;
    const match = description.match(dateRegex);
    return match ? match[1] : null;
  }

  /**
   * 从描述中提取进度
   */
  extractProgress(description) {
    const progressRegex = /(\d+)%/;
    const match = description.match(progressRegex);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 获取 Agent 的任务列表
   * @param {string} agentId - Agent ID（如 xiaoruan）
   */
  async getAgentTasks(agentId) {
    const path = `agents/${agentId}/task.md`;
    
    const result = await this.getFileContent(path);
    
    if (!result.success) {
      return result;
    }
    
    // 解析 task.md 内容
    const tasks = this.parseTaskMarkdown(result.data.content);
    
    return {
      success: true,
      data: tasks,
      metadata: {
        source: 'github',
        path,
        sha: result.data.sha,
      },
    };
  }
}

// 导出单例
module.exports = new GitHubService();
