// db/init.js - 数据库初始化

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'storage', 'forum.db');

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('数据库连接失败:', err);
        reject(err);
        return;
      }
      console.log('已连接到 SQLite 数据库:', DB_PATH);
    });

    // 创建用户表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        emoji TEXT DEFAULT '',
        token TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'engineer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('创建 users 表失败:', err);
      else console.log('✅ users 表创建成功');
    });

    // 创建帖子表
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        section TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT DEFAULT '[]',
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
      )
    `, (err) => {
      if (err) console.error('创建 posts 表失败:', err);
      else console.log('✅ posts 表创建成功');
    });

    // 创建评论表
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        parent_id INTEGER,
        likes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id)
      )
    `, (err) => {
      if (err) console.error('创建 comments 表失败:', err);
      else console.log('✅ comments 表创建成功');
    });

    // 创建通知表（v2.0 增强版）
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        post_id INTEGER,
        comment_id INTEGER,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        -- v2.0 新增字段
        author TEXT,           -- 发帖人/评论人
        post_title TEXT,       -- 帖子标题
        task_priority TEXT DEFAULT 'normal',  -- 任务优先级：low/normal/high/urgent
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (username) REFERENCES users(username)
      )
    `, (err) => {
      if (err) console.error('创建 notifications 表失败:', err);
      else console.log('✅ notifications 表创建成功（v2.0 增强版）');
    });

    // v2.0: 为现有表添加新字段（如果表已存在）
    db.serialize(() => {
      db.run(`ALTER TABLE notifications ADD COLUMN author TEXT`, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('添加 author 字段失败:', err);
        }
      });
      db.run(`ALTER TABLE notifications ADD COLUMN post_title TEXT`, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('添加 post_title 字段失败:', err);
        }
      });
      db.run(`ALTER TABLE notifications ADD COLUMN task_priority TEXT DEFAULT 'normal'`, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('添加 task_priority 字段失败:', err);
        }
      });
    });

    // 创建索引
    db.run(`CREATE INDEX IF NOT EXISTS idx_posts_section ON posts(section)`, (err) => {
      if (err) console.error('创建索引失败:', err);
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_username ON notifications(username)`, (err) => {
      if (err) console.error('创建索引失败:', err);
    });

    // 插入默认用户（AgentVerse 团队）
    const defaultUsers = [
      ['main', '白小白', '🌸', 'admin', 'token_xiaobai_123'],
      ['xiaoruan', '小软', '🤖', 'engineer', 'token_xiaoruan_123'],
      ['xiaoce', '小测', '🔍', 'engineer', 'token_xiaoce_123'],
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO users (username, display_name, emoji, role, token)
      VALUES (?, ?, ?, ?, ?)
    `);

    defaultUsers.forEach(([username, displayName, emoji, role, token]) => {
      stmt.run(username, displayName, emoji, role, token);
    });

    stmt.finalize((err) => {
      if (err) console.error('插入默认用户失败:', err);
      else console.log('✅ 默认用户插入成功');
    });

    // 关闭数据库
    db.close((err) => {
      if (err) reject(err);
      else resolve(DB_PATH);
    });
  });
}

module.exports = { initDatabase, DB_PATH };
