/**
 * Task 路由
 * 支持本地任务管理和 GitHub task.md 读取
 */

const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/TaskController');
const TaskGitHubController = require('../controllers/TaskGitHubController');

/**
 * @route   GET /api/v1/tasks/github/:agentId
 * @desc    从 GitHub 获取 Agent 的任务列表（task.md）
 * @access  Public
 */
router.get('/github/:agentId', TaskGitHubController.getAgentTasks);

/**
 * @route   GET /api/v1/tasks/github/all
 * @desc    从 GitHub 获取所有 Agent 的任务列表
 * @access  Public
 */
router.get('/github/all', TaskGitHubController.getAllAgentTasks);

/**
 * @route   GET /api/v1/tasks
 * @desc    获取所有任务（支持本地和 OpenClaw 数据源）
 * @access  Public
 */
router.get('/', TaskController.list);

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    获取单个任务
 * @access  Public
 */
router.get('/:id', TaskController.get);

/**
 * @route   POST /api/v1/tasks
 * @desc    创建任务
 * @access  Public
 */
router.post('/', TaskController.create);

/**
 * @route   PUT /api/v1/tasks/:id
 * @desc    更新任务
 * @access  Public
 */
router.put('/:id', TaskController.update);

/**
 * @route   PUT /api/v1/tasks/:id/status
 * @desc    更新任务状态
 * @access  Public
 */
router.put('/:id/status', TaskController.updateStatus);

/**
 * @route   POST /api/v1/tasks/:id/assign
 * @desc    分配任务
 * @access  Public
 */
router.post('/:id/assign', TaskController.assign);

/**
 * @route   DELETE /api/v1/tasks/:id
 * @desc    删除任务
 * @access  Public
 */
router.delete('/:id', TaskController.delete);

module.exports = router;
