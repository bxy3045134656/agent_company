/**
 * Agent Company Backend Server
 * 自动化 AI 公司平台 - 后端服务
 * 
 * @author 小软 🤖
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 创建 HTTP 服务器（用于 WebSocket）
const server = http.createServer(app);

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域
app.use(compression()); // 压缩
app.use(morgan('dev')); // 日志
app.use(express.json()); // JSON 解析
app.use(express.urlencoded({ extended: true })); // URL 编码解析

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Agent Company Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 初始化舞台系统 WebSocket 服务
const StageWebSocketService = require('./services/stageService');
const stageService = new StageWebSocketService(server);
stageService.init();

// API 路由
const agentsRouter = require('./routes/agents');
const tasksRouter = require('./routes/tasks');
const workflowsRouter = require('./routes/workflows');
const stageRouter = require('./routes/stage');
const financeRouter = require('./routes/finance');

// 设置舞台服务
stageRouter.setStageService(stageService);

app.use('/api/v1/agents', agentsRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/workflows', workflowsRouter);
app.use('/api/stage', stageRouter); // 舞台系统 API
app.use('/api/v1/finance', financeRouter); // 财务系统 API

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '接口不存在'
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || '服务器内部错误'
    }
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`🚀 Agent Company Backend 已启动`);
  console.log(`📍 端口：${PORT}`);
  console.log(`🌐 环境：${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 健康检查：http://localhost:${PORT}/health`);
  console.log(`📚 API 文档：http://localhost:${PORT}/api/v1`);
  console.log(`🎭 舞台 WebSocket: ws://localhost:${PORT}/ws/stage`);
});

module.exports = { app, server };
