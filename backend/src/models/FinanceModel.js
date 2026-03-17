/**
 * Finance Model
 * 财务数据模型 - CRUD 操作
 */

const db = require('../database');

class FinanceModel {
  /**
   * 创建财务记录
   */
  async create(data) {
    const { type, category, amount, description, date } = data;
    const sql = `
      INSERT INTO finance (type, category, amount, description, date)
      VALUES (?, ?, ?, ?, ?)
    `;
    return await db.run(sql, [type, category, amount, description, date]);
  }

  /**
   * 获取所有财务记录
   */
  async findAll() {
    const sql = 'SELECT * FROM finance ORDER BY date DESC';
    return await db.all(sql);
  }

  /**
   * 获取收入统计
   */
  async getIncomeStats() {
    const sql = `
      SELECT 
        SUM(amount) as total,
        SUM(CASE WHEN date = date('now') THEN amount ELSE 0 END) as today,
        SUM(CASE WHEN date >= date('now', '-7 days') THEN amount ELSE 0 END) as thisWeek,
        SUM(CASE WHEN date >= date('now', 'start of month') THEN amount ELSE 0 END) as thisMonth
      FROM finance
      WHERE type = 'income'
    `;
    return await db.get(sql);
  }

  /**
   * 获取成本分析
   */
  async getCostAnalysis() {
    const sql = `
      SELECT category, SUM(amount) as amount
      FROM finance
      WHERE type = 'cost'
      GROUP BY category
    `;
    return await db.all(sql);
  }

  /**
   * 更新财务记录
   */
  async update(id, data) {
    const { type, category, amount, description, date } = data;
    const sql = `
      UPDATE finance
      SET type = ?, category = ?, amount = ?, description = ?, date = ?
      WHERE id = ?
    `;
    return await db.run(sql, [type, category, amount, description, date, id]);
  }

  /**
   * 删除财务记录
   */
  async delete(id) {
    const sql = 'DELETE FROM finance WHERE id = ?';
    return await db.run(sql, [id]);
  }
}

module.exports = new FinanceModel();
