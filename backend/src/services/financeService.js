/**
 * Finance Service
 * 财务系统服务 - 收入追踪 + 成本分析
 */

class FinanceService {
  constructor() {
    // 模拟财务数据（实际应从数据库获取）
    this.mockData = {
      income: {
        total: 125800,
        today: 3500,
        thisWeek: 18600,
        thisMonth: 125800,
        bySource: [
          { source: '项目开发', amount: 85000, percent: 67.6 },
          { source: '技术咨询', amount: 25000, percent: 19.9 },
          { source: '产品授权', amount: 15800, percent: 12.5 },
        ],
      },
      cost: {
        total: 45600,
        today: 1200,
        thisWeek: 8500,
        thisMonth: 45600,
        byCategory: [
          { category: '人力成本', amount: 28000, percent: 61.4 },
          { category: '服务器', amount: 8500, percent: 18.6 },
          { category: 'API 调用', amount: 5600, percent: 12.3 },
          { category: '其他', amount: 3500, percent: 7.7 },
        ],
      },
      profit: {
        total: 80200,
        margin: 63.8,
        trend: this.generateProfitTrend(12),
      },
    };
  }

  /**
   * 生成利润趋势数据
   */
  generateProfitTrend(months = 12) {
    const data = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' });
      data.push({
        month: monthStr,
        income: Math.floor(Math.random() * 50000) + 80000,
        cost: Math.floor(Math.random() * 20000) + 30000,
        profit: Math.floor(Math.random() * 30000) + 50000,
      });
    }
    return data;
  }

  /**
   * 获取收入统计
   */
  async getIncomeStats() {
    return {
      success: true,
      data: this.mockData.income,
    };
  }

  /**
   * 获取成本分析
   */
  async getCostAnalysis() {
    return {
      success: true,
      data: this.mockData.cost,
    };
  }

  /**
   * 获取利润统计
   */
  async getProfitStats() {
    return {
      success: true,
      data: this.mockData.profit,
    };
  }

  /**
   * 获取完整财务数据
   */
  async getFinanceOverview() {
    return {
      success: true,
      data: {
        income: this.mockData.income,
        cost: this.mockData.cost,
        profit: this.mockData.profit,
      },
    };
  }

  /**
   * 获取利润趋势
   */
  async getProfitTrend(months = 12) {
    return {
      success: true,
      data: this.generateProfitTrend(months),
    };
  }
}

module.exports = new FinanceService();
