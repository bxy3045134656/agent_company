/**
 * Frontend Error Handler
 * 前端错误处理工具 - v4.0 错误处理优化
 */

import { message } from 'antd';

class FrontendErrorHandler {
  constructor() {
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000, // 1 秒
      retryableStatus: [408, 429, 500, 502, 503, 504],
    };
  }

  /**
   * 用户友好的错误消息
   */
  getUserFriendlyMessage(error) {
    const statusMessages = {
      400: '请求参数错误，请检查后重试',
      401: '未授权访问，请先登录',
      403: '无权访问此资源',
      404: '请求的资源不存在',
      408: '请求超时，请检查网络连接',
      409: '资源已存在或冲突',
      429: '请求过于频繁，请稍后重试',
      500: '服务器内部错误，请稍后重试',
      502: '网关错误，请稍后重试',
      503: '服务暂时不可用，请稍后重试',
      504: '网关超时，请稍后重试',
    };

    const status = error.response?.status;
    return statusMessages[status] || error.message || '网络错误，请检查连接后重试';
  }

  /**
   * 显示错误提示
   */
  showError(error, duration = 3) {
    const userMessage = this.getUserFriendlyMessage(error);
    message.error({
      content: userMessage,
      duration,
    });
    console.error('❌ Frontend Error:', error);
  }

  /**
   * 显示成功提示
   */
  showSuccess(messageText, duration = 3) {
    message.success({
      content: messageText,
      duration,
    });
  }

  /**
   * 显示警告提示
   */
  showWarning(messageText, duration = 3) {
    message.warning({
      content: messageText,
      duration,
    });
  }

  /**
   * 带重试的 API 调用
   */
  async callWithRetry(apiCall, context = 'API 调用') {
    let lastError;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        const status = error.response?.status;

        // 判断是否可重试
        if (!this.retryConfig.retryableStatus.includes(status)) {
          // 不可重试的错误，直接抛出
          this.showError(error);
          throw error;
        }

        // 可重试的错误，等待后重试
        if (attempt < this.retryConfig.maxRetries) {
          console.warn(`⚠️ ${context}失败，${attempt}/${this.retryConfig.maxRetries}，${this.retryConfig.retryDelay}ms 后重试...`);
          await this.sleep(this.retryConfig.retryDelay * attempt);
        }
      }
    }

    // 所有重试都失败
    console.error(`❌ ${context}失败，已重试${this.retryConfig.maxRetries}次`);
    this.showError(lastError);
    throw lastError;
  }

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 全局错误监听
   */
  setupGlobalErrorListener() {
    // 监听未捕获的错误
    window.addEventListener('error', (event) => {
      console.error('🚨 Global Error:', event.error);
      this.showError({ message: '页面发生错误，请刷新页面' });
    });

    // 监听未捕获的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
      // 不显示错误提示，避免打扰用户
    });
  }
}

// 导出单例
export default new FrontendErrorHandler();
