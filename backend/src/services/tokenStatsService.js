/**
 * Token Stats Service
 * Token 使用统计服务
 */

class TokenStatsService {
  constructor() {
    // 模拟 Token 使用数据（实际应从数据库或 API 获取）
    this.mockData = {
      total: {
        input: 125000,
        output: 85000,
        total: 210000,
      },
      byModel: [
        { model: 'Qwen-Plus', input: 50000, output: 35000, cost: 12.5 },
        { model: 'Qwen-Max', input: 35000, output: 25000, cost: 18.2 },
        { model: 'Qwen-Turbo', input: 40000, output: 25000, cost: 5.8 },
      ],
      trend: this.generateTrendData(7),
      cost: {
        total: 36.5,
        today: 5.2,
        thisWeek: 36.5,
        thisMonth: 142.8,
      },
    };
  }

  /**
   * 生成趋势数据
   */
  generateTrendData(days = 7) {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        input: Math.floor(Math.random() * 20000) + 10000,
        output: Math.floor(Math.random() * 15000) + 8000,
      });
    }
    return data;
  }

  /**
   * 获取 Token 统计概览
   */
  async getTokenOverview() {
    return {
      success: true,
      data: this.mockData.total,
    };
  }

  /**
   * 获取按模型分布的 Token 统计
   */
  async getTokenByModel() {
    return {
      success: true,
      data: this.mockData.byModel,
    };
  }

  /**
   * 获取 Token 使用趋势
   */
  async getTokenTrend(days = 7) {
    return {
      success: true,
      data: this.generateTrendData(days),
    };
  }

  /**
   * 获取成本统计
   */
  async getCostStats() {
    return {
      success: true,
      data: this.mockData.cost,
    };
  }

  /**
   * 获取完整的 Token 统计数据
   */
  async getTokenStats() {
    return {
      success: true,
      data: {
        overview: this.mockData.total,
        byModel: this.mockData.byModel,
        trend: this.generateTrendData(7),
        cost: this.mockData.cost,
      },
    };
  }
}

module.exports = new TokenStatsService();
