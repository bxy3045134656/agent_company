/**
 * Token Stats Controller
 * Token 使用统计控制器
 */

const tokenStatsService = require('../services/tokenStatsService');

class TokenStatsController {
  /**
   * 获取完整 Token 统计
   * GET /api/v1/token-stats
   */
  static async getTokenStats(req, res, next) {
    try {
      const result = await tokenStatsService.getTokenStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取 Token 概览
   * GET /api/v1/token-stats/overview
   */
  static async getOverview(req, res, next) {
    try {
      const result = await tokenStatsService.getTokenOverview();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取按模型分布
   * GET /api/v1/token-stats/by-model
   */
  static async getByModel(req, res, next) {
    try {
      const result = await tokenStatsService.getTokenByModel();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取趋势数据
   * GET /api/v1/token-stats/trend
   */
  static async getTrend(req, res, next) {
    try {
      const { days } = req.query;
      const result = await tokenStatsService.getTokenTrend(parseInt(days) || 7);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取成本统计
   * GET /api/v1/token-stats/cost
   */
  static async getCost(req, res, next) {
    try {
      const result = await tokenStatsService.getCostStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TokenStatsController;
