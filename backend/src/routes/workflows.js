/**
 * Workflow 路由（占位实现）
 */

const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/v1/workflows
 * @desc    获取所有工作流
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: '工作流功能开发中',
  });
});

/**
 * @route   GET /api/v1/workflows/:id
 * @desc    获取单个工作流
 * @access  Public
 */
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    data: null,
    message: '工作流功能开发中',
  });
});

/**
 * @route   POST /api/v1/workflows
 * @desc    创建工作流
 * @access  Public
 */
router.post('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '工作流功能开发中',
    },
  });
});

module.exports = router;
