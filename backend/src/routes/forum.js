/**
 * 论坛 API 路由
 * 提供帖子和评论的 CRUD 操作
 * 
 * @author 小软 🤖
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3');

// 数据库路径
const DB_PATH = path.join(__dirname, '../../forum/storage/forum.db');
const db = new Database(DB_PATH);

// 获取所有帖子
router.get('/posts', (req, res) => {
  try {
    const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
    const formattedPosts = posts.map(post => ({
      ...post,
      tags: typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : (post.tags || [])
    }));
    res.json({ success: true, posts: formattedPosts });
  } catch (error) {
    console.error('获取帖子失败:', error);
    res.status(500).json({ success: false, error: { code: 'READ_ERROR', message: error.message } });
  }
});

// 获取单个帖子
router.get('/posts/:id', (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(parseInt(req.params.id));
    if (!post) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '帖子不存在' } });
    }
    // 增加浏览量
    db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').run(parseInt(req.params.id));
    post.views = (post.views || 0) + 1;
    // 解析 tags
    post.tags = typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : (post.tags || []);
    res.json({ success: true, post });
  } catch (error) {
    console.error('获取帖子失败:', error);
    res.status(500).json({ success: false, error: { code: 'READ_ERROR', message: error.message } });
  }
});

// 创建帖子
router.post('/posts', (req, res) => {
  try {
    const { title, content, section, tags, author = 'main' } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: '标题和内容不能为空' } });
    }

    const stmt = db.prepare(`
      INSERT INTO posts (title, content, section, tags, author, likes, views, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))
    `);
    const result = stmt.run(title, content, section || 'general', JSON.stringify(tags || []), author);
    
    const newPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
    newPost.tags = typeof newPost.tags === 'string' ? JSON.parse(newPost.tags || '[]') : (newPost.tags || []);

    console.log(`📝 新帖子创建：#${newPost.id} ${title} by ${author}`);
    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.error('创建帖子失败:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

// 更新帖子
router.put('/posts/:id', (req, res) => {
  try {
    const { title, content, section, tags } = req.body;
    const id = parseInt(req.params.id);
    
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '帖子不存在' } });
    }

    db.prepare(`
      UPDATE posts 
      SET title = ?, content = ?, section = ?, tags = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title || post.title,
      content || post.content,
      section || post.section,
      tags ? JSON.stringify(tags) : post.tags,
      id
    );

    const updatedPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    updatedPost.tags = typeof updatedPost.tags === 'string' ? JSON.parse(updatedPost.tags || '[]') : (updatedPost.tags || []);
    
    res.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('更新帖子失败:', error);
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } });
  }
});

// 删除帖子
router.delete('/posts/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '帖子不存在' } });
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    db.prepare('DELETE FROM comments WHERE post_id = ?').run(id);
    
    res.json({ success: true, message: '帖子已删除' });
  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
  }
});

// 获取帖子的评论
router.get('/posts/:id/comments', (req, res) => {
  try {
    const comments = db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC').all(parseInt(req.params.id));
    res.json({ success: true, comments });
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ success: false, error: { code: 'READ_ERROR', message: error.message } });
  }
});

// 创建评论
router.post('/posts/:id/comments', (req, res) => {
  try {
    const { content, author = 'main', parent_id } = req.body;
    const postId = parseInt(req.params.id);
    
    if (!content) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: '评论内容不能为空' } });
    }

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '帖子不存在' } });
    }

    const stmt = db.prepare(`
      INSERT INTO comments (post_id, content, author, parent_id, likes, created_at)
      VALUES (?, ?, ?, ?, 0, datetime('now'))
    `);
    const result = stmt.run(postId, content, author, parent_id || null);
    
    const newComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);

    console.log(`💬 新评论：#${newComment.id} on Post #${postId} by ${author}`);
    
    // 检测 @提及 并创建通知
    // 支持匹配任何用户名（包括中文显示名）
    const mentionRegex = /@([\w\u4e00-\u9fa5]+)/g;
    let match;
    const mentionedUsers = new Set();
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedUsername = match[1];
      if (mentionedUsername && !mentionedUsers.has(mentionedUsername)) {
        mentionedUsers.add(mentionedUsername);
        console.log(`🔔 检测到 @提及：${mentionedUsername}`);
        
        // 查询用户 ID（支持 username 和 display_name 两种匹配方式）
        const user = db.prepare('SELECT id, username FROM users WHERE username = ? OR display_name = ?').get(mentionedUsername, mentionedUsername);
        
        if (!user) {
          console.log(`⚠️ 用户 ${mentionedUsername} 不存在，跳过通知创建`);
          continue;
        }
        
        // 创建通知
        try {
          const notificationStmt = db.prepare(`
            INSERT INTO notifications (user_id, username, type, content, post_id, comment_id, author, post_title, is_read, created_at)
            VALUES (?, ?, 'forum_mention', ?, ?, ?, ?, ?, 0, datetime('now'))
          `);
          
          const notificationContent = `${author} 在帖子"${post.title}"中@了你`;
          // 使用数据库中的 username（英文用户名），而不是 mentionedUsername（可能是中文显示名）
          notificationStmt.run(user.id, user.username, notificationContent, postId, newComment.id, author, post.title);
          console.log(`✅ 已创建 @提及 通知给 ${mentionedUsername} (ID: ${user.id})`);
        } catch (error) {
          console.error(`❌ 创建 @提及 通知失败：`, error.message);
        }
      }
    }
    
    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    console.error('创建评论失败:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

// 点赞帖子
router.post('/posts/:id/like', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '帖子不存在' } });
    }

    db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(id);
    const updatedPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    
    res.json({ success: true, likes: updatedPost.likes });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ success: false, error: { code: 'LIKE_ERROR', message: error.message } });
  }
});

module.exports = router;
