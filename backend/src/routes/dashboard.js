/**
 * Dashboard 路由
 * 仪表盘 API 接口
 */

const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');

/**
 * @route   GET /api/v1/dashboard
 * @desc    获取完整的仪表盘数据
 * @access  Public
 */
router.get('/', DashboardController.getDashboard);

/**
 * @route   GET /api/v1/dashboard/agents
 * @desc    获取 Agent 统计数据
 * @access  Public
 */
router.get('/agents', DashboardController.getAgentStats);

/**
 * @route   GET /api/v1/dashboard/tasks
 * @desc    获取任务统计数据
 * @access  Public
 */
router.get('/tasks', DashboardController.getTaskStats);

/**
 * @route   GET /api/v1/dashboard/projects
 * @desc    获取项目进度
 * @access  Public
 */
router.get('/projects', DashboardController.getProjectProgress);

/**
 * @route   GET /api/v1/dashboard/activities
 * @desc    获取最近活动
 * @access  Public
 * @query   {number} limit - 活动数量限制（默认 10）
 */
router.get('/activities', DashboardController.getRecentActivities);

module.exports = router;
