/**
 * Database Module
 * 数据库模块 - v4.0 数据持久化
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, '../../data/agent_company.db');
  }

  /**
   * 初始化数据库连接
   */
  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('数据库连接失败:', err.message);
          reject(err);
        } else {
          console.log('✅ 数据库连接成功:', this.dbPath);
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  /**
   * 创建数据表
   */
  async createTables() {
    const createFinanceTable = `
      CREATE TABLE IF NOT EXISTS finance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        category TEXT,
        amount REAL NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createTokenStatsTable = `
      CREATE TABLE IF NOT EXISTS token_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model TEXT NOT NULL,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        cost REAL NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await this.run(createFinanceTable);
    await this.run(createTokenStatsTable);
    console.log('✅ 数据表创建成功');
  }

  /**
   * 执行 SQL 语句
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  /**
   * 查询数据
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  /**
   * 查询单条数据
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * 关闭数据库连接
   */
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else {
          console.log('✅ 数据库连接关闭');
          resolve();
        }
      });
    });
  }
}

// 导出单例
module.exports = new Database();
