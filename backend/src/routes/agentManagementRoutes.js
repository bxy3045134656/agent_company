/**
 * Agent Management Routes
 * Agent 管理路由
 */

const express = require('express');
const router = express.Router();
const AgentManagementController = require('../controllers/AgentManagementController');

/**
 * @route   GET /api/v1/agents/management/list
 * @desc    获取所有 Agent
 */
router.get('/list', AgentManagementController.listAgents);

/**
 * @route   GET /api/v1/agents/management/:id
 * @desc    获取单个 Agent 详情
 */
router.get('/:id', AgentManagementController.getAgent);

/**
 * @route   POST /api/v1/agents/management/spawn
 * @desc    创建 Agent（Spawn new session）
 */
router.post('/spawn', AgentManagementController.spawnAgent);

/**
 * @route   PUT /api/v1/agents/management/:id/status
 * @desc    更新 Agent 状态
 */
router.put('/:id/status', AgentManagementController.updateAgentStatus);

/**
 * @route   DELETE /api/v1/agents/management/:id
 * @desc    删除 Agent
 */
router.delete('/:id', AgentManagementController.deleteAgent);

module.exports = router;
