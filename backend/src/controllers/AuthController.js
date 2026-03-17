/**
 * Auth Controller
 * 认证控制器 - 用户登录系统
 */

const User = require('../models/User');

class AuthController {
  /**
   * 用户注册
   * POST /api/v1/auth/register
   */
  static async register(req, res, next) {
    try {
      const { username, password, email } = req.body;

      // 验证必填字段
      if (!username || !password || !email) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: '用户名、密码和邮箱是必填字段' },
        });
      }

      // 验证密码强度
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: { code: 'WEAK_PASSWORD', message: '密码长度至少 6 位' },
        });
      }

      const user = await User.create(username, password, email);

      res.status(201).json({
        success: true,
        data: user,
        message: '注册成功',
      });
    } catch (error) {
      if (error.message === '用户名已存在') {
        return res.status(409).json({
          success: false,
          error: { code: 'USER_EXISTS', message: error.message },
        });
      }
      next(error);
    }
  }

  /**
   * 用户登录
   * POST /api/v1/auth/login
   */
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      // 验证必填字段
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: '用户名和密码是必填字段' },
        });
      }

      const result = await User.authenticate(username, password);

      res.json({
        success: true,
        data: result,
        message: '登录成功',
      });
    } catch (error) {
      if (error.message === '用户名或密码错误') {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: error.message },
        });
      }
      next(error);
    }
  }

  /**
   * 用户登出
   * POST /api/v1/auth/logout
   */
  static async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Token 无效' },
        });
      }

      const result = User.logout(token);

      res.json({
        success: true,
        data: result,
        message: '登出成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取当前用户信息
   * GET /api/v1/auth/me
   */
  static async getCurrentUser(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '未授权' },
        });
      }

      const session = User.verifyToken(token);
      const user = User.getUser(session.username);

      res.json({
        success: true,
        data: user,
        message: '获取成功',
      });
    } catch (error) {
      if (error.message === 'Token 无效' || error.message === 'Token 已过期') {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: error.message },
        });
      }
      next(error);
    }
  }
}

module.exports = AuthController;
