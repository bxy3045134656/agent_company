/**
 * Workflow 路由
 * 工作流管理 API
 */

const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');

// 初始化工作流数据
Workflow.initWorkflows();

/**
 * @route   GET /api/v1/workflows
 * @desc    获取所有工作流（支持筛选和搜索）
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    const { status, owner, search } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (owner) filters.owner = owner;
    if (search) filters.search = search;
    
    const workflows = Workflow.getAllWorkflows(filters);
    
    res.json({
      success: true,
      data: workflows,
      total: workflows.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取工作流列表失败',
        details: error.message,
      },
    });
  }
});

/**
 * @route   GET /api/v1/workflows/:id
 * @desc    获取单个工作流详情
 * @access  Public
 */
router.get('/:id', (req, res) => {
  try {
    const workflow = Workflow.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '工作流不存在',
        },
      });
    }
    
    res.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取工作流详情失败',
        details: error.message,
      },
    });
  }
});

/**
 * @route   POST /api/v1/workflows
 * @desc    创建新工作流
 * @access  Public
 */
router.post('/', (req, res) => {
  try {
    const { name, description, status, trigger, steps, owner } = req.body;
    
    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '工作流名称为必填项',
        },
      });
    }
    
    const workflow = Workflow.createWorkflow({
      name,
      description,
      status,
      trigger,
      steps,
      owner,
    });
    
    res.status(201).json({
      success: true,
      data: workflow,
      message: '工作流创建成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '创建工作流失败',
        details: error.message,
      },
    });
  }
});

/**
 * @route   PUT /api/v1/workflows/:id
 * @desc    更新工作流
 * @access  Public
 */
router.put('/:id', (req, res) => {
  try {
    const workflow = Workflow.updateWorkflow(req.params.id, req.body);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '工作流不存在',
        },
      });
    }
    
    res.json({
      success: true,
      data: workflow,
      message: '工作流更新成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '更新工作流失败',
        details: error.message,
      },
    });
  }
});

/**
 * @route   PATCH /api/v1/workflows/:id/status
 * @desc    启用/禁用工作流
 * @access  Public
 */
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '状态必须是 active 或 disabled',
        },
      });
    }
    
    const workflow = Workflow.toggleWorkflowStatus(req.params.id, status);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '工作流不存在',
        },
      });
    }
    
    res.json({
      success: true,
      data: workflow,
      message: `工作流已${status === 'active' ? '启用' : '禁用'}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '更新工作流状态失败',
        details: error.message,
      },
    });
  }
});

/**
 * @route   DELETE /api/v1/workflows/:id
 * @desc    删除工作流
 * @access  Public
 */
router.delete('/:id', (req, res) => {
  try {
    const deleted = Workflow.deleteWorkflow(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '工作流不存在',
        },
      });
    }
    
    res.json({
      success: true,
      message: '工作流删除成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '删除工作流失败',
        details: error.message,
      },
    });
  }
});

module.exports = router;
