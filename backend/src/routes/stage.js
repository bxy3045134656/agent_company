/**
 * stage.js
 * 舞台系统 API 路由
 * @author 小软 🤖
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();

// 舞台服务（从 app 获取）
let stageService = null;

/**
 * 设置舞台服务实例
 * @param {StageWebSocketService} service - 舞台服务
 */
router.setStageService = (service) => {
  stageService = service;
};

/**
 * GET /api/stage/agents
 * 获取所有 Agent 状态
 */
router.get('/agents', (req, res) => {
  if (!stageService) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVICE_NOT_INITIALIZED', message: '舞台服务未初始化' }
    });
  }

  try {
    const agents = stageService.getAllAgents();
    res.json({
      success: true,
      data: agents,
      count: agents.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

/**
 * GET /api/stage/agents/:id
 * 获取单个 Agent 状态
 */
router.get('/agents/:id', (req, res) => {
  if (!stageService) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVICE_NOT_INITIALIZED', message: '舞台服务未初始化' }
    });
  }

  try {
    const agent = stageService.getAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agent 不存在' }
      });
    }

    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

/**
 * PUT /api/stage/agents/:id/status
 * 更新 Agent 状态
 */
router.put('/agents/:id/status', (req, res) => {
  if (!stageService) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVICE_NOT_INITIALIZED', message: '舞台服务未初始化' }
    });
  }

  try {
    const { status, statusText, task, progress } = req.body;
    
    const updatedAgent = stageService.updateAgentStatus(req.params.id, {
      status,
      statusText,
      task,
      progress
    });

    if (!updatedAgent) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agent 不存在' }
      });
    }

    res.json({
      success: true,
      data: updatedAgent,
      message: '状态已更新'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

/**
 * POST /api/stage/agents
 * 添加新 Agent
 */
router.post('/agents', (req, res) => {
  if (!stageService) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVICE_NOT_INITIALIZED', message: '舞台服务未初始化' }
    });
  }

  try {
    const { id, name, status, statusText, task, progress, color } = req.body;

    if (!id || !name) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '缺少必要参数' }
      });
    }

    const agent = stageService.addAgent({
      id,
      name,
      status: status || 'idle',
      statusText: statusText || '空闲',
      task: task || '',
      progress: progress || 0,
      color: color || '#2196F3'
    });

    res.status(201).json({
      success: true,
      data: agent,
      message: 'Agent 已添加'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

/**
 * DELETE /api/stage/agents/:id
 * 移除 Agent
 */
router.delete('/agents/:id', (req, res) => {
  if (!stageService) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVICE_NOT_INITIALIZED', message: '舞台服务未初始化' }
    });
  }

  try {
    const removed = stageService.removeAgent(req.params.id);
    
    if (!removed) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agent 不存在' }
      });
    }

    res.json({
      success: true,
      message: 'Agent 已移除'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

/**
 * GET /api/stage/stats
 * 获取舞台统计信息
 */
router.get('/stats', (req, res) => {
  if (!stageService) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVICE_NOT_INITIALIZED', message: '舞台服务未初始化' }
    });
  }

  try {
    const agents = stageService.getAllAgents();
    const stats = {
      total: agents.length,
      working: agents.filter(a => a.status === 'working').length,
      idle: agents.filter(a => a.status === 'idle').length,
      error: agents.filter(a => a.status === 'error').length,
      connections: stageService.getConnectionCount()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

module.exports = router;
