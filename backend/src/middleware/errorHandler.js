/**
 * Error Handler Middleware
 * 统一错误处理中间件 - v4.0 错误处理优化
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogs = 1000;
  }

  /**
   * 记录错误日志
   */
  logError(error, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
    };

    this.errorLog.push(logEntry);

    // 限制日志数量
    if (this.errorLog.length > this.maxLogs) {
      this.errorLog.shift();
    }

    console.error('❌ Error:', logEntry);
  }

  /**
   * 获取错误日志
   */
  getErrorLogs(limit = 100) {
    return this.errorLog.slice(-limit);
  }

  /**
   * 清除错误日志
   */
  clearLogs() {
    this.errorLog = [];
  }

  /**
   * Express 错误处理中间件
   */
  expressErrorHandler() {
    return (err, req, res, next) => {
      // 记录错误日志
      this.logError(err, {
        path: req.path,
        method: req.method,
        userAgent: req.get('user-agent'),
      });

      // 默认错误响应
      let statusCode = err.status || err.statusCode || 500;
      let message = err.message || '服务器内部错误';

      // 用户友好错误消息
      const userFriendlyMessages = {
        400: '请求参数错误，请检查后重试',
        401: '未授权访问，请先登录',
        403: '无权访问此资源',
        404: '请求的资源不存在',
        409: '资源已存在或冲突',
        500: '服务器内部错误，请稍后重试',
        503: '服务暂时不可用，请稍后重试',
      };

      // 使用用户友好的错误消息
      const userMessage = userFriendlyMessages[statusCode] || message;

      res.status(statusCode).json({
        success: false,
        error: {
          code: err.code || 'INTERNAL_ERROR',
          message: userMessage,
          details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
      });
    };
  }

  /**
   * 异步函数错误包装器
   */
  asyncWrapper(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }
}

// 导出单例
module.exports = new ErrorHandler();
