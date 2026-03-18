/**
 * 论坛通知桥接服务
 * 轮询论坛通知 + 推送到主应用 WebSocket
 * 
 * @author 小软 🤖
 * @version 1.0.0
 */

const http = require('http');

class ForumNotificationBridge {
  constructor(options = {}) {
    this.forumApiUrl = options.forumApiUrl || 'http://localhost:3001/api';
    this.mainApiUrl = options.mainApiUrl || 'http://localhost:3001/api/v1';
    this.pollInterval = options.pollInterval || 5000; // 5 秒
    this.notificationService = options.notificationService;
    this.members = options.members || [
      { username: 'xiaobai', token: 'token_xiaobai_123' },
      { username: 'xiaoruan', token: 'token_xiaoruan_123' },
      { username: 'xiaoce', token: 'token_xiaoce_123' }
    ];
    this.processedNotifications = new Set();
    this.timer = null;
    this.running = false;
  }

  /**
   * 启动桥接服务
   */
  start() {
    if (this.running) {
      console.log('⚠️ 论坛通知桥接服务已在运行');
      return;
    }

    this.running = true;
    console.log('🌉 论坛通知桥接服务已启动');
    console.log(`   论坛 API: ${this.forumApiUrl}`);
    console.log(`   主应用 API: ${this.mainApiUrl}`);
    console.log(`   轮询间隔：${this.pollInterval}ms`);

    // 立即执行一次
    this.pollNotifications();

    // 定时轮询
    this.timer = setInterval(() => {
      this.pollNotifications();
    }, this.pollInterval);
  }

  /**
   * 停止桥接服务
   */
  stop() {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log('🛑 论坛通知桥接服务已停止');
  }

  /**
   * 轮询所有成员的通知
   */
  async pollNotifications() {
    if (!this.running) return;

    try {
      for (const member of this.members) {
        await this.checkMemberNotifications(member);
      }
    } catch (error) {
      console.error('❌ 轮询通知失败:', error.message);
    }
  }

  /**
   * 检查单个成员的通知
   */
  async checkMemberNotifications(member) {
    try {
      const notifications = await this.getForumNotifications(member.token);
      
      if (notifications && notifications.length > 0) {
        console.log(`📬 ${member.username} 有 ${notifications.length} 条未读通知`);
        
        for (const notif of notifications) {
          // 检查是否已处理
          const notifKey = `${member.username}_${notif.id}`;
          if (this.processedNotifications.has(notifKey)) {
            continue;
          }

          // 检查通知时间（只处理 5 分钟内的新通知）
          const notifTime = new Date(notif.created_at).getTime();
          const now = Date.now();
          const ageMs = now - notifTime;
          
          if (ageMs > 5 * 60 * 1000) {
            // 超过 5 分钟，标记为已处理
            this.processedNotifications.add(notifKey);
            continue;
          }

          // 推送到主应用
          await this.pushToMainApp(member.username, notif);
          
          // 标记为已处理
          this.processedNotifications.add(notifKey);
          
          // 标记为已读（在论坛）
          await this.markAsRead(member.token, notif.id);
        }
      }
    } catch (error) {
      console.error(`❌ 检查 ${member.username} 通知失败:`, error.message);
    }
  }

  /**
   * 获取论坛通知
   */
  getForumNotifications(token) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/notifications',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result.success ? result.notifications : []);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000);
      req.end();
    });
  }

  /**
   * 推送到主应用通知系统
   */
  async pushToMainApp(userId, forumNotif) {
    if (!this.notificationService) {
      console.log('⚠️ 通知服务未初始化，跳过推送');
      return;
    }

    try {
      // 构建通知数据
      const notification = {
        type: 'forum_mention',
        category: 'forum',
        priority: 'high',
        title: `${forumNotif.author} 在${forumNotif.comment_id ? '评论' : '帖子'}中@了你`,
        message: this.truncateContent(forumNotif.content, 200),
        data: {
          postId: forumNotif.post_id,
          postTitle: forumNotif.post_title,
          commentId: forumNotif.comment_id,
          author: forumNotif.author,
          forumNotifId: forumNotif.id
        }
      };

      // 通过 WebSocket 广播
      this.notificationService.broadcast(notification);
      
      console.log(`🔔 推送通知到主应用：${userId} - ${notification.title}`);
    } catch (error) {
      console.error('❌ 推送通知失败:', error.message);
    }
  }

  /**
   * 截断内容
   */
  truncateContent(content, maxLength) {
    if (!content) return '';
    const text = content.replace(/@[\w\u4e00-\u9fa5]+/g, '').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * 标记通知为已读
   */
  markAsRead(token, notificationId) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({});
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: `/api/v1/notifications/${notificationId}/read`,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000);
      req.write(data);
      req.end();
    });
  }
}

module.exports = ForumNotificationBridge;
