/**
 * User Model
 * 用户模型 - 用户登录系统
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor() {
    // 模拟数据库（实际应使用真实数据库）
    this.users = new Map();
    this.sessions = new Map();
  }

  /**
   * 创建用户
   */
  async create(username, password, email) {
    // 检查用户是否已存在
    if (this.users.has(username)) {
      throw new Error('用户名已存在');
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(username, user);
    return { id: user.id, username, email, createdAt: user.createdAt };
  }

  /**
   * 验证用户登录
   */
  async authenticate(username, password) {
    const user = this.users.get(username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('用户名或密码错误');
    }

    // 创建会话 Token
    const token = uuidv4();
    const session = {
      token,
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 小时过期
    };

    this.sessions.set(token, session);
    return { token, user: { id: user.id, username: user.username, email: user.email } };
  }

  /**
   * 登出
   */
  logout(token) {
    this.sessions.delete(token);
    return { success: true, message: '登出成功' };
  }

  /**
   * 验证 Token
   */
  verifyToken(token) {
    const session = this.sessions.get(token);
    if (!session) {
      throw new Error('Token 无效');
    }

    // 检查是否过期
    if (new Date() > new Date(session.expiresAt)) {
      this.sessions.delete(token);
      throw new Error('Token 已过期');
    }

    return session;
  }

  /**
   * 获取用户信息
   */
  getUser(username) {
    const user = this.users.get(username);
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

// 导出单例
module.exports = new User();
