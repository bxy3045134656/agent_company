/**
 * Token Stats 路由
 */

const express = require('express');
const router = express.Router();
const TokenStatsController = require('../controllers/TokenStatsController');

/**
 * @route   GET /api/v1/token-stats
 * @desc    获取完整 Token 统计
 */
router.get('/', TokenStatsController.getTokenStats);

/**
 * @route   GET /api/v1/token-stats/overview
 * @desc    获取 Token 概览
 */
router.get('/overview', TokenStatsController.getOverview);

/**
 * @route   GET /api/v1/token-stats/by-model
 * @desc    获取按模型分布
 */
router.get('/by-model', TokenStatsController.getByModel);

/**
 * @route   GET /api/v1/token-stats/trend
 * @desc    获取趋势数据
 */
router.get('/trend', TokenStatsController.getTrend);

/**
 * @route   GET /api/v1/token-stats/cost
 * @desc    获取成本统计
 */
router.get('/cost', TokenStatsController.getCost);

module.exports = router;
