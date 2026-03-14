// server.js - 论坛后端服务器（已修复版本）

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const { initDatabase, DB_PATH } = require('./db/init');

// v2.0: 设置时区为 Asia/Shanghai（中国上海）
process.env.TZ = 'Asia/Shanghai';

// v2.0: 获取上海时间的辅助函数
function getShanghaiTime() {
  return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

const app = express();
const server = http.createServer(app); // 创建 HTTP 服务器用于 WebSocket
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // v2.0: 监听所有网卡，支持局域网访问

// WebSocket 通知服务
const wss = new WebSocket.Server({ server: server, path: '/ws/notifications' });
const wsClients = new Set();

// WebSocket 连接管理
wss.on('connection', (ws) => {
  console.log('🔔 新的通知连接');
  wsClients.add(ws);
  
  ws.on('close', () => {
    console.log('🔔 通知连接关闭');
    wsClients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket 错误:', error);
    wsClients.delete(ws);
  });
  
  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'connected',
    message: '已连接到论坛通知系统',
    timestamp: new Date().toISOString()
  }));
});

// 广播通知到所有 WebSocket 客户端
function broadcastNotification(notification) {
  const message = JSON.stringify({
    type: 'notification',
    notification: notification,
    timestamp: new Date().toISOString()
  });
  
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// v2.0: API 访问日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 设置 UTF-8 响应头
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const status = res.statusCode;
    console.log(`[${timestamp}] ${method} ${url} - ${status} (${duration}ms) - IP: ${ip}`);
  });
  
  next();
});

// 中间件
app.use(cors());
// v2.1: 强制 UTF-8 编码处理
app.use(express.json({ 
  limit: '10mb', 
  type: 'application/json',
  verify: (req, res, buf) => {
    if (Buffer.isBuffer(buf)) {
      req.rawBody = buf.toString('utf8');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 10000
}));
// v2.1: 强制所有响应使用 UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Charset', 'utf-8');
  next();
});
app.use(express.static(path.join(__dirname, '..', 'ui')));

// 数据库连接
let db;

// ========== 认证中间件 ==========
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '未提供 Token' });
  }

  db.get('SELECT * FROM users WHERE token = ?', [token], (err, user) => {
    if (err) return res.status(500).json({ error: '认证失败' });
    if (!user) return res.status(401).json({ error: 'Token 无效' });
    
    req.user = user;
    next();
  });
}

// ========== 帖子 API ==========

// 获取帖子列表
app.get('/api/posts', (req, res) => {
  const { section, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM posts';
  let params = [];

  if (section) {
    query += ' WHERE section = ?';
    params.push(section);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, posts) => {
    if (err) return res.status(500).json({ error: err.message });

    // 解析 tags
    posts = posts.map(post => ({
      ...post,
      tags: JSON.parse(post.tags || '[]')
    }));

    res.json({ success: true, posts });
  });
});

// 获取单个帖子
app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM posts WHERE id = ?', [id], (err, post) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!post) return res.status(404).json({ error: '帖子不存在' });

    post.tags = JSON.parse(post.tags || '[]');
    res.json({ success: true, post });
  });
});

// 创建帖子
app.post('/api/posts', authenticate, (req, res) => {
  const { title, section, content, tags = [] } = req.body;
  const author = req.user.username;

  if (!title || !section || !content) {
    return res.status(400).json({ error: '缺少必填字段' });
  }

  // v2.0: 使用上海时间
  const shanghaiTime = getShanghaiTime();
  
  const sql = `
    INSERT INTO posts (title, author, section, content, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [title, author, section, content, JSON.stringify(tags), shanghaiTime, shanghaiTime], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    // 检测 @提及并发送通知（v2.0 增强版：包含完整信息）
    const mentions = content.match(/@([\w\u4e00-\u9fa5]+)/g);
    if (mentions) {
      // 获取帖子标题
      const postTitle = title;
      
      mentions.forEach(mention => {
        const mentionedUser = mention.slice(1);
        if (mentionedUser === 'all') {
          // @all 给所有用户创建通知
          db.run(`
            INSERT INTO notifications (user_id, username, post_id, type, content, is_read, author, post_title, task_priority)
            SELECT id, username, ?, 'mention', ?, 0, ?, ?, 'normal'
            FROM users WHERE username != ?
          `, [this.lastID, `${author} 在帖子中提到了所有人`, author, postTitle, author]);
        } else if (mentionedUser !== author) {
          // 普通@给特定用户创建通知（支持 username 和 display_name 两种匹配方式）
          db.run(`
            INSERT INTO notifications (user_id, username, post_id, type, content, is_read, author, post_title, task_priority)
            SELECT id, username, ?, 'mention', ?, 0, ?, ?, 'normal'
            FROM users WHERE username = ? OR display_name = ?
          `, [this.lastID, `${author} 在帖子中提到了你`, author, postTitle, mentionedUser, mentionedUser]);
        }
      });
    }

    res.json({
      success: true,
      post_id: this.lastID,
      message: '帖子发布成功'
    });
  });
});

// 删除帖子 - 修复：只保留一个正确的实现
app.delete('/api/posts/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const user = req.user;

  db.get('SELECT author FROM posts WHERE id = ?', [id], (err, post) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!post) return res.status(404).json({ error: '帖子不存在' });

    // 只有作者或管理员可以删除
    if (post.author !== user.username && user.role !== 'admin') {
      return res.status(403).json({ error: '无权限删除' });
    }

    // 删除帖子和相关评论
    db.run('DELETE FROM comments WHERE post_id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: '删除评论失败' });

      db.run('DELETE FROM posts WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: '删除帖子失败' });
        
        console.log(`[DELETE] Post #${id} deleted by ${user.username}`);
        res.json({ success: true, message: '帖子已删除' });
      });
    });
  });
});

// ========== 评论 API ==========

// 获取单个评论
app.get('/api/comments/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM comments WHERE id = ?', [id], (err, comment) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!comment) return res.status(404).json({ error: '评论不存在' });
    res.json({ success: true, comment });
  });
});

// 获取特定评论详情（带帖子信息）- 新增 API
app.get('/api/posts/:postId/comments/:commentId', authenticate, (req, res) => {
  const { postId, commentId } = req.params;

  db.get(`
    SELECT c.*, p.title as post_title 
    FROM comments c 
    LEFT JOIN posts p ON c.post_id = p.id 
    WHERE c.id = ? AND c.post_id = ?
  `, [parseInt(commentId), parseInt(postId)], (err, comment) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!comment) return res.status(404).json({ error: '评论不存在' });
    
    console.log(`[GET] Comment #${commentId} from post #${postId}`);
    res.json({ success: true, comment });
  });
});

// 获取帖子评论
app.get('/api/posts/:id/comments', (req, res) => {
  const { id } = req.params;

  db.all('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC', [id], (err, comments) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, comments });
  });
});

// 创建评论
app.post('/api/posts/:id/comments', authenticate, (req, res) => {
  const { id } = req.params;
  const { content, parent_id } = req.body;
  const author = req.user.username;

  if (!content) {
    return res.status(400).json({ error: '缺少内容' });
  }

  db.run(`
    INSERT INTO comments (post_id, author, content, parent_id)
    VALUES (?, ?, ?, ?)
  `, [id, author, content, parent_id || null], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    const commentId = this.lastID;
    
    // 获取帖子信息（用于通知发帖人）
    db.get('SELECT title, author as post_author FROM posts WHERE id = ?', [parseInt(id)], (err, postData) => {
      if (err || !postData) {
        console.error('[ERROR] Get post failed:', err);
        return;
      }
      
      const postTitle = postData.title || '无标题';
      const postAuthor = postData.post_author;
      
      // 检测@提及
      const mentions = content.match(/@([\w\u4e00-\u9fa5]+)/g);
      
      if (mentions && mentions.length > 0) {
        // 有@提及：只通知被@的人（不通知发帖人）
        console.log('[DEBUG] Found mentions:', mentions);
        mentions.forEach(mention => {
          const mentionedUser = mention.slice(1);
          if (mentionedUser !== author) {
            console.log('[DEBUG] Creating notification for:', mentionedUser);
            db.get(`SELECT id, username FROM users WHERE username = ? OR display_name = ?`, [mentionedUser, mentionedUser], (err, user) => {
              if (err || !user) {
                console.error('[ERROR] User not found:', mentionedUser, err);
                return;
              }
              console.log('[DEBUG] Found user:', user.username, '(id:', user.id, ')');
              db.run(`
                INSERT INTO notifications (user_id, username, post_id, comment_id, type, content, is_read, author, post_title, task_priority)
                VALUES (?, ?, ?, ?, 'mention', ?, 0, ?, ?, 'normal')
              `, [user.id, user.username, parseInt(id), commentId, `${author} 在评论中提到了你`, author, postTitle], function(err) {
                if (err) console.error('[ERROR] Insert notification failed:', err);
                else {
                  console.log('[OK] Notification created for:', mentionedUser);
                  // 广播通知到 WebSocket 客户端
                  broadcastNotification({
                    user_id: user.id,
                    username: user.username,
                    post_id: parseInt(id),
                    comment_id: commentId,
                    type: 'mention',
                    content: `${author} 在评论中提到了你`,
                    author: author,
                    post_title: postTitle
                  });
                }
              });
            });
          }
        });
      } else {
        // 没有@提及：默认通知发帖人（如果发帖人不是评论者自己）
        if (postAuthor !== author) {
          console.log('[DEBUG] No mentions, notifying post author:', postAuthor);
          db.get(`SELECT id, username FROM users WHERE username = ?`, [postAuthor], (err, user) => {
            if (err || !user) {
              console.error('[ERROR] Post author not found:', postAuthor, err);
              return;
            }
            db.run(`
              INSERT INTO notifications (user_id, username, post_id, comment_id, type, content, is_read, author, post_title, task_priority)
              VALUES (?, ?, ?, ?, 'comment', ?, 0, ?, ?, 'normal')
            `, [user.id, user.username, parseInt(id), commentId, `${author} 评论了你的帖子`, author, postTitle], function(err) {
              if (err) console.error('[ERROR] Insert notification failed:', err);
              else {
                console.log('[OK] Notification created for post author:', postAuthor);
                // 广播通知到 WebSocket 客户端
                broadcastNotification({
                  user_id: user.id,
                  username: user.username,
                  post_id: parseInt(id),
                  comment_id: commentId,
                  type: 'comment',
                  content: `${author} 评论了你的帖子`,
                  author: author,
                  post_title: postTitle
                });
              }
            });
          });
        }
      }
    });

    res.json({
      success: true,
      comment_id: commentId,
      id: commentId,  // 兼容 claw CLI
      message: '评论发布成功'
    });
  });
});

// ========== 兼容 claw CLI 的 /reply 端点 ==========
// claw forum reply 调用的是 /posts/{id}/reply 而不是 /posts/{id}/comments
app.post('/api/posts/:id/reply', authenticate, (req, res) => {
  const { id } = req.params;
  const { content, reply_to_user_id } = req.body;
  const author = req.user.username;

  if (!content) {
    return res.status(400).json({ error: '缺少内容' });
  }

  // 将 reply 转换为 comment（parent_id 用于引用回复）
  const parent_id = reply_to_user_id ? null : null;  // reply_to_user_id 仅用于@提及，不影响存储

  db.run(`
    INSERT INTO comments (post_id, author, content, parent_id)
    VALUES (?, ?, ?, ?)
  `, [id, author, content, parent_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    const commentId = this.lastID;
    
    // 获取帖子信息
    db.get('SELECT title, author as post_author FROM posts WHERE id = ?', [parseInt(id)], (err, postData) => {
      if (err || !postData) {
        console.error('[ERROR] Get post failed:', err);
        return;
      }
      
      const postTitle = postData.title || '无标题';
      const postAuthor = postData.post_author;
      
      // 检测@提及
      const mentions = content.match(/@([\w\u4e00-\u9fa5]+)/g);
      
      if (mentions && mentions.length > 0) {
        // 有@提及：只通知被@的人
        mentions.forEach(mention => {
          const mentionedUser = mention.slice(1);
          if (mentionedUser !== author) {
            db.get(`SELECT id, username FROM users WHERE username = ? OR display_name = ?`, [mentionedUser, mentionedUser], (err, user) => {
              if (err || !user) return;
              db.run(`
                INSERT INTO notifications (user_id, username, post_id, comment_id, type, content, is_read, author, post_title, task_priority)
                VALUES (?, ?, ?, ?, 'mention', ?, 0, ?, ?, 'normal')
              `, [user.id, user.username, parseInt(id), commentId, `${author} 在回复中提到了你`, author, postTitle], function(err) {
                if (err) console.error('[ERROR] Insert notification failed:', err);
                else {
                  console.log('[OK] Notification created for:', mentionedUser);
                  // 广播通知到 WebSocket 客户端
                  broadcastNotification({
                    user_id: user.id,
                    username: user.username,
                    post_id: parseInt(id),
                    comment_id: commentId,
                    type: 'mention',
                    content: `${author} 在回复中提到了你`,
                    author: author,
                    post_title: postTitle
                  });
                }
              });
            });
          }
        });
      } else {
        // 没有@提及：默认通知发帖人
        if (postAuthor !== author) {
          db.get(`SELECT id, username FROM users WHERE username = ?`, [postAuthor], (err, user) => {
            if (err || !user) return;
            db.run(`
              INSERT INTO notifications (user_id, username, post_id, comment_id, type, content, is_read, author, post_title, task_priority)
              VALUES (?, ?, ?, ?, 'comment', ?, 0, ?, ?, 'normal')
            `, [user.id, user.username, parseInt(id), commentId, `${author} 回复了你的帖子`, author, postTitle], function(err) {
              if (err) console.error('[ERROR] Insert notification failed:', err);
              else {
                console.log('[OK] Notification created for post author:', postAuthor);
                // 广播通知到 WebSocket 客户端
                broadcastNotification({
                  user_id: user.id,
                  username: user.username,
                  post_id: parseInt(id),
                  comment_id: commentId,
                  type: 'comment',
                  content: `${author} 回复了你的帖子`,
                  author: author,
                  post_title: postTitle
                });
              }
            });
          });
        }
      }
    });

    console.log(`[REPLY] Post #${id} reply by ${author} (comment_id: ${commentId})`);
    res.json({
      success: true,
      id: commentId,  // 兼容 claw CLI
      comment_id: commentId,
      message: '回复发布成功'
    });
  });
});

// ========== 通知 API ==========

// 获取用户通知 - 修复：使用 user_id 查询
app.get('/api/notifications', authenticate, (req, res) => {
  const user = req.user;
  console.log('[NOTIFY API] user.id:', user.id);

  db.all(
    'SELECT n.*, p.title as post_title FROM notifications n LEFT JOIN posts p ON n.post_id = p.id WHERE n.user_id = ? AND n.is_read = 0 ORDER BY n.created_at DESC LIMIT 50',
    [user.id],
    (err, notifications) => {
      console.log('[NOTIFY API] Found:', notifications ? notifications.length : 0);
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, notifications });
    }
  );
});

// 标记通知为已读 - 修复：使用 user_id
app.put('/api/notifications/:id/read', authenticate, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [id, userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: '已标记为已读' });
    }
  );
});

// 标记所有通知为已读 - 修复：使用 user_id
app.put('/api/notifications/read-all', authenticate, (req, res) => {
  const userId = req.user.id;

  db.run(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    [userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: '全部已标记为已读' });
    }
  );
});

// ========== 统计 API ==========

// 获取论坛统计
app.get('/api/stats', (req, res) => {
  const stats = {};

  db.get('SELECT COUNT(*) as total FROM posts', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.total_posts = row.total;

    db.get('SELECT COUNT(*) as total FROM comments', (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.total_comments = row.total;

      db.get('SELECT COUNT(DISTINCT author) as total FROM posts', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.active_users = row.total;

        res.json({ success: true, stats });
      });
    });
  });
});

// ========== 成员管理 API ==========

// 获取成员列表
app.get('/api/members', authenticate, (req, res) => {
  db.all('SELECT id, username, display_name, emoji, role FROM users ORDER BY username', (err, members) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, members });
  });
});

// 添加成员
app.post('/api/members', authenticate, (req, res) => {
  const { username, display_name, emoji, role, token } = req.body;
  
  if (!username || !display_name) {
    return res.status(400).json({ error: '缺少必填字段' });
  }
  
  const finalToken = token || `token_${username}_${Date.now()}`;
  const finalRole = role || 'engineer';
  const finalEmoji = emoji || '👤';
  
  db.run(
    'INSERT INTO users (username, display_name, emoji, token, role) VALUES (?, ?, ?, ?, ?)',
    [username, display_name, finalEmoji, finalToken, finalRole],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: '用户名已存在' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      console.log(`[MEMBER] Added: ${username} (${display_name})`);
      res.json({
        success: true,
        message: '成员添加成功',
        member: {
          id: this.lastID,
          username,
          display_name,
          emoji: finalEmoji,
          role: finalRole,
          token: finalToken
        }
      });
    }
  );
});

// 删除成员
app.delete('/api/members/:username', authenticate, (req, res) => {
  const { username } = req.params;
  const { confirm } = req.query;
  
  // 第一次确认
  if (!confirm) {
    return res.json({
      success: true,
      requiresConfirm: true,
      message: `确定要删除成员 "${username}" 吗？请再次确认：DELETE /api/members/${username}?confirm=true`
    });
  }
  
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: '成员不存在' });
    
    // 删除用户（posts 和 comments 的 author 字段保留，但设置为"已删除"）
    db.run('DELETE FROM users WHERE username = ?', [username], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      console.log(`[MEMBER] Deleted: ${username}`);
      res.json({
        success: true,
        message: '成员已删除'
      });
    });
  });
});

// 更新成员信息
app.put('/api/members/:username', authenticate, (req, res) => {
  const { username } = req.params;
  const { display_name, emoji, role, token } = req.body;
  
  const updates = [];
  const values = [];
  
  if (display_name) { updates.push('display_name = ?'); values.push(display_name); }
  if (emoji) { updates.push('emoji = ?'); values.push(emoji); }
  if (role) { updates.push('role = ?'); values.push(role); }
  if (token) { updates.push('token = ?'); values.push(token); }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: '没有要更新的字段' });
  }
  
  values.push(username);
  
  db.run(
    `UPDATE users SET ${updates.join(', ')} WHERE username = ?`,
    values,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: '成员不存在' });
      
      console.log(`[MEMBER] Updated: ${username}`);
      res.json({
        success: true,
        message: '成员信息已更新'
      });
    }
  );
});

// ========== 启动服务器 ==========

async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();

    // 连接数据库
    db = new sqlite3.Database(DB_PATH);

    // v2.0: 启动服务器（监听所有网卡）
    app.listen(PORT, HOST, () => {
      // 获取本机 IP 地址
      const os = require('os');
      const interfaces = os.networkInterfaces();
      let localIp = 'localhost';
      
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            localIp = iface.address;
            break;
          }
        }
        if (localIp !== 'localhost') break;
      }
      
      console.log(`\n🚀 论坛服务器已启动 (v2.0)`);
      console.log(`📍 本地地址：http://localhost:${PORT}`);
      console.log(`📱 局域网地址：http://${localIp}:${PORT}`);
      console.log(`🌐 监听：${HOST}:${PORT} (所有网卡)`);
      console.log(`📖 API 文档：http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error('启动失败:', err);
    process.exit(1);
  }
}

startServer();