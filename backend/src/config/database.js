/**
 * 数据库配置
 * 支持 PostgreSQL 和 SQLite（开发模式）
 */

const Database = require('better-sqlite3');
const path = require('path');

// 判断使用哪种数据库
const USE_SQLITE = !process.env.DB_HOST || process.env.NODE_ENV === 'development';

let db = null;
let pool = null;

if (USE_SQLITE) {
  // SQLite 模式（开发/测试）
  const dbPath = path.join(__dirname, '../../data/agent_company.db');
  
  // 确保 data 目录存在
  const fs = require('fs');
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  console.log('✅ SQLite 数据库已初始化:', dbPath);
} else {
  // PostgreSQL 模式（生产）
  const { Pool } = require('pg');
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'agent_company',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  pool.on('connect', () => {
    console.log('✅ PostgreSQL 数据库连接成功');
  });
  
  pool.on('error', (err) => {
    console.error('❌ PostgreSQL 数据库连接错误:', err);
  });
}

// SQLite 查询辅助函数
const querySQLite = (sql, params = []) => {
  try {
    const start = Date.now();
    const stmt = db.prepare(sql);
    let result;
    
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const rows = stmt.all(...params);
      result = { rows: rows || [], rowCount: rows ? rows.length : 0 };
    } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
      const info = stmt.run(...params);
      result = { rows: [{ id: info.lastInsertRowid, ...params }], rowCount: 1 };
    } else {
      stmt.run(...params);
      result = { rows: [], rowCount: db.changes };
    }
    
    const duration = Date.now() - start;
    console.log('✅ 查询成功:', { sql: sql.substring(0, 50) + '...', duration, rows: result.rows?.length || 0 });
    return result;
  } catch (error) {
    console.error('❌ 查询失败:', { sql: sql.substring(0, 50) + '...', error: error.message });
    throw error;
  }
};

// PostgreSQL 查询辅助函数
const queryPostgres = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ 查询成功:', { text: text.substring(0, 50) + '...', duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('❌ 查询失败:', { text: text.substring(0, 50) + '...', error: error.message });
    throw error;
  }
};

// 统一查询接口
const query = USE_SQLITE ? querySQLite : queryPostgres;

// 初始化 SQLite 表结构
const initSQLite = () => {
  if (!USE_SQLITE) return;
  
  console.log('🔄 初始化 SQLite 表结构...');
  
  // agents 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT,
      description TEXT,
      capabilities TEXT,
      status TEXT DEFAULT 'active',
      config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // tasks 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      agent_id INTEGER REFERENCES agents(id),
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'normal',
      due_date DATETIME,
      result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // workflows 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      definition TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // workflow_runs 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflow_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workflow_id INTEGER REFERENCES workflows(id),
      status TEXT DEFAULT 'running',
      current_step INTEGER,
      result TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `);
  
  // 插入示例数据
  const agents = [
    ['xiaoruan', '小软 🤖', '全栈工程师 Agent', '{"skills": ["frontend", "backend", "database"]}', 'active', '{}'],
    ['xiaoshi', '小市 🏪', '市场调研专家', '{"skills": ["market_research", "user_analysis"]}', 'active', '{}'],
    ['xiaoce', '小测 🔍', '测试专家', '{"skills": ["testing", "qa", "ci_cd"]}', 'active', '{}'],
  ];
  
  agents.forEach(agent => {
    try {
      db.prepare(`
        INSERT OR IGNORE INTO agents (name, display_name, description, capabilities, status, config)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(...agent);
    } catch (e) {
      // 忽略已存在的记录
    }
  });
  
  console.log('✅ SQLite 表结构初始化完成');
  console.log('✅ 示例 Agents 插入完成');
};

// 初始化数据库
if (USE_SQLITE) {
  initSQLite();
}

module.exports = {
  pool: USE_SQLITE ? null : pool,
  db: USE_SQLITE ? db : null,
  query,
  isSQLite: USE_SQLITE,
  isPostgres: !USE_SQLITE,
};
