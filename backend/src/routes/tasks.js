/**
 * Task 路由
 */

const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/TaskController');

/**
 * @route   GET /api/v1/tasks
 * @desc    获取所有任务
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
