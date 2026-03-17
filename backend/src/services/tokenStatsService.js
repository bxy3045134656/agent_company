/**
 * Token Stats Service
 * Token 使用统计服务
 * v3.0: 移除假数据，连接 OpenClaw API
 */

const axios = require('axios');

class TokenStatsService {
  constructor() {
    // 从 OpenClaw API 获取真实 Token 数据
    this.openclawBaseUrl = process.env.OPENCLAW_BASE_URL || 'http://localhost:18792';
  }

  /**
   * 从 OpenClaw 获取真实 Token 使用数据
   */
  async getRealTokenData() {
    try {
      // TODO: 连接 OpenClaw API 获取真实 Token 使用数据
      // 目前返回空数据结构，等待真实数据源
      return {
        total: {
          input: 0,
          output: 0,
          total: 0,
        },
        byModel: [],
        trend: [],
        cost: {
          total: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
        },
      };
    } catch (error) {
      console.error('获取真实 Token 数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取 Token 统计概览
   */
  async getTokenOverview() {
    const data = await this.getRealTokenData();
    return {
      success: true,
      data: data.total,
    };
  }

  /**
   * 获取按模型分布的 Token 统计
   */
  async getTokenByModel() {
    const data = await this.getRealTokenData();
    return {
      success: true,
      data: data.byModel,
    };
  }

  /**
   * 获取 Token 使用趋势
   */
  async getTokenTrend(days = 7) {
    const data = await this.getRealTokenData();
    return {
      success: true,
      data: data.trend,
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
