/**
 * Agent 路由
 */

const express = require('express');
const router = express.Router();
const AgentController = require('../controllers/AgentController');

/**
 * @route   GET /api/v1/agents
 * @desc    获取所有 Agents
 * @access  Public
 */
router.get('/', AgentController.list);

/**
 * @route   GET /api/v1/agents/:id
 * @desc    获取单个 Agent
 * @access  Public
 */
router.get('/:id', AgentController.get);

/**
 * @route   GET /api/v1/agents/:id/stats
 * @desc    获取 Agent 统计
 * @access  Public
 */
router.get('/:id/stats', AgentController.stats);

/**
 * @route   POST /api/v1/agents
 * @desc    创建 Agent
 * @access  Public
 */
router.post('/', AgentController.create);

/**
 * @route   PUT /api/v1/agents/:id
 * @desc    更新 Agent
 * @access  Public
 */
router.put('/:id', AgentController.update);

/**
 * @route   DELETE /api/v1/agents/:id
 * @desc    删除 Agent
 * @access  Public
 */
router.delete('/:id', AgentController.delete);

module.exports = router;
