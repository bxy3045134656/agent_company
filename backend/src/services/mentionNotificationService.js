/**
 * 论坛 @提及通知服务
 * 检测帖子和评论中的 @提及，自动创建通知并推送
 * 
 * @author 小软 🤖
 * @version 1.0.0
 */

const Notification = require('../models/Notification');

class MentionNotificationService {
  constructor(notificationService) {
    this.notificationService = notificationService;
    // @提及正则表达式
    this.mentionRegex = /@(\w+)/g;
    // 用户名映射
    this.userMap = {
      'xiaobai': { id: 'xiaobai', name: '白小白', displayName: '白小白' },
      'xiaoruan': { id: 'xiaoruan', name: '小软', displayName: '小软 🤖' },
      'xiaoce': { id: 'xiaoce', name: '小测', displayName: '小测 🧪' }
    };
  }

  /**
   * 从文本中提取 @提及的用户
   */
  extractMentions(text) {
    if (!text) return [];
    
    const mentions = [];
    let match;
    
    while ((match = this.mentionRegex.exec(text)) !== null) {
      const username = match[1].toLowerCase();
      if (this.userMap[username]) {
        mentions.push({
          username,
          ...this.userMap[username]
        });
      }
    }
    
    return mentions;
  }

  /**
   * 处理帖子创建/更新，检测 @提及并发送通知
   */
  async handlePostCreated(post) {
    const { id, title, content, authorId, authorName } = post;
    
    // 提取 @提及
    const mentions = this.extractMentions(content);
    
    if (mentions.length === 0) {
      return { success: true, mentions: [] };
    }
    
    console.log(`📝 帖子 #${id} 检测到 ${mentions.length} 个 @提及:`, mentions.map(m => m.username));
    
    // 为每个被提及的用户创建通知
    for (const mention of mentions) {
      // 不要给作者自己发通知
      if (mention.username === authorId) {
        continue;
      }
      
      await this.createMentionNotification({
        userId: mention.username,
        postId: id,
        postTitle: title,
        authorId,
        authorName,
        content,
        mentionType: 'post'
      });
    }
    
    return { success: true, mentions };
  }

  /**
   * 处理评论创建，检测 @提及并发送通知
   */
  async handleCommentCreated(comment, post) {
    const { id, content, authorId, authorName, postId } = comment;
    
    // 提取 @提及
    const mentions = this.extractMentions(content);
    
    if (mentions.length === 0) {
      return { success: true, mentions: [] };
    }
    
    console.log(`💬 评论 #${id} 检测到 ${mentions.length} 个 @提及:`, mentions.map(m => m.username));
    
    // 为每个被提及的用户创建通知
    for (const mention of mentions) {
      // 不要给作者自己发通知
      if (mention.username === authorId) {
        continue;
      }
      
      await this.createMentionNotification({
        userId: mention.username,
        postId,
        postTitle: post?.title || '未知帖子',
        commentId: id,
        authorId,
        authorName,
        content,
        mentionType: 'comment'
      });
    }
    
    return { success: true, mentions };
  }

  /**
   * 创建 @提及通知
   */
  async createMentionNotification(data) {
    const {
      userId,
      postId,
      postTitle,
      commentId,
      authorId,
      authorName,
      content,
      mentionType
    } = data;
    
    try {
      // 创建通知记录
      const notification = await Notification.create({
        userId,
        type: 'mention',
        category: 'forum',
        priority: 'high',
        title: `${authorName} 在${mentionType === 'comment' ? '评论' : '帖子'}中@了你`,
        message: this.truncateContent(content, 200),
        data: {
          postId,
          postTitle,
          commentId,
          authorId,
          authorName,
          mentionType
        },
        unread: true
      });
      
      console.log(`🔔 创建 @提及通知：${userId} - ${notification.id}`);
      
      // 通过 WebSocket 推送
      if (this.notificationService) {
        this.notificationService.broadcast({
          id: notification.id,
          type: 'forum_mention',
          category: 'forum',
          priority: 'high',
          title: notification.title,
          message: notification.message,
          data: notification.data,
          createdAt: notification.createdAt
        });
      }
      
      return notification;
    } catch (error) {
      console.error('❌ 创建 @提及通知失败:', error);
      throw error;
    }
  }

  /**
   * 截断内容
   */
  truncateContent(content, maxLength) {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
}

module.exports = MentionNotificationService;
