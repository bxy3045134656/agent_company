/**
 * Finance 路由
 * 财务管理 API - 收入、成本、利润
 */

const express = require('express');
const router = express.Router();
const Finance = require('../models/Finance');

/**
 * @route   GET /api/v1/finance/incomes
 * @desc    获取所有收入记录（支持筛选）
 * @access  Public
 */
router.get('/incomes', (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    const filters = {};
    
    if (category) filters.category = category;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const incomes = Finance.getAllIncomes(filters);
    const stats = Finance.getIncomeStats();
    
    res.json({
      success: true,
      data: {
        list: incomes,
        stats
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取收入数据失败',
        details: error.message,
      },
    });
  }
});

/**
 * @route   POST /api/v1/finance/incomes
 * @desc    创建收入记录
 * @access  Public
 */
router.post('/incomes', (req, res) => {
  try {
    const { type, category, amount, date, description, client } = req.body;
    
    if (!amount || !date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '金额和日期为必填项',
        },
      });
    }
    
    const income = Finance.createIncome({
      type,
      category,
      amount: parseFloat(amount),
      date,
      description,
      client,
    });
    
    res.status(201).json({
      success: true,
      data: income,
      message: '收入记录创建成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '创建收入记录失败',
        details: error.message,
      },
    });
  }
});

/**
 * @route   GET /api/v1/finance/costs
 * @desc    获取所有成本记录（支持筛选）
 * @access  Public
 */
router.get('/costs', (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    const filters = {};
    
    if (category) filters.category = category;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const costs = Finance.getAllCosts(filters);
    const stats = Finance.getCostStats();
    
    res.json({
      success: true,
      data: {
        list: costs,
        stats
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取成本数据失败',
        details: error.message,
      },
    });
  }
});

/**
 * @route   POST /api/v1/finance/costs
 * @desc    创建成本记录
 * @access  Public
 */
router.post('/costs', (req, res) => {
  try {
    const { type, category, amount, date, description, payer } = req.body;
    
    if (!amount || !date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '金额和日期为必填项',
        },
      });
    }
    
    const cost = Finance.createCost({
      type,
      category,
      amount: parseFloat(amount),
      date,
      description,
      payer,
    });
    
    res.status(201).json({
      success: true,
      data: cost,
      message: '成本记录创建成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '创建成本记录失败',
        details: error.message,
      },
    });
  }
});

/**
 * @route   GET /api/v1/finance/profit
 * @desc    获取利润分析
 * @access  Public
 */
router.get('/profit', (req, res) => {
  try {
    const analysis = Finance.getProfitAnalysis();
    
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取利润分析失败',
        details: error.message,
      },
    });
  }
});

/**
 * @route   GET /api/v1/finance/report
 * @desc    导出财务报表
 * @access  Public
 */
router.get('/report', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '开始日期和结束日期为必填项',
        },
      });
    }
    
    const report = Finance.exportReport(startDate, endDate);
    
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '导出财务报表失败',
        details: error.message,
      },
    });
  }
});

module.exports = router;
