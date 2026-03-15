/**
 * Finance Controller
 * 财务系统控制器
 */

const financeService = require('../services/financeService');

class FinanceController {
  /**
   * 获取完整财务概览
   * GET /api/v1/finance/overview
   */
  static async getOverview(req, res, next) {
    try {
      const result = await financeService.getFinanceOverview();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取收入统计
   * GET /api/v1/finance/income
   */
  static async getIncome(req, res, next) {
    try {
      const result = await financeService.getIncomeStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取成本分析
   * GET /api/v1/finance/cost
   */
  static async getCost(req, res, next) {
    try {
      const result = await financeService.getCostAnalysis();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取利润统计
   * GET /api/v1/finance/profit
   */
  static async getProfit(req, res, next) {
    try {
      const result = await financeService.getProfitStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取利润趋势
   * GET /api/v1/finance/profit/trend
   */
  static async getProfitTrend(req, res, next) {
    try {
      const { months } = req.query;
      const result = await financeService.getProfitTrend(parseInt(months) || 12);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FinanceController;
