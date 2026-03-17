/**
 * Token Stats Model
 * Token 统计数据模型 - CRUD 操作
 */

const db = require('../database');

class TokenStatsModel {
  /**
   * 创建 Token 统计记录
   */
  async create(data) {
    const { model, input_tokens, output_tokens, cost, date } = data;
    const sql = `
      INSERT INTO token_stats (model, input_tokens, output_tokens, cost, date)
      VALUES (?, ?, ?, ?, ?)
    `;
    return await db.run(sql, [model, input_tokens, output_tokens, cost, date]);
  }

  /**
   * 获取所有 Token 统计记录
   */
  async findAll() {
    const sql = 'SELECT * FROM token_stats ORDER BY date DESC';
    return await db.all(sql);
  }

  /**
   * 获取按模型分组统计
   */
  async getByModel() {
    const sql = `
      SELECT 
        model,
        SUM(input_tokens) as input_tokens,
        SUM(output_tokens) as output_tokens,
        SUM(cost) as cost
      FROM token_stats
      GROUP BY model
    `;
    return await db.all(sql);
  }

  /**
   * 获取总统计
   */
  async getTotalStats() {
    const sql = `
      SELECT 
        SUM(input_tokens) as input_tokens,
        SUM(output_tokens) as output_tokens,
        SUM(input_tokens + output_tokens) as total_tokens,
        SUM(cost) as total_cost
      FROM token_stats
    `;
    return await db.get(sql);
  }

  /**
   * 更新 Token 统计记录
   */
  async update(id, data) {
    const { model, input_tokens, output_tokens, cost, date } = data;
    const sql = `
      UPDATE token_stats
      SET model = ?, input_tokens = ?, output_tokens = ?, cost = ?, date = ?
      WHERE id = ?
    `;
    return await db.run(sql, [model, input_tokens, output_tokens, cost, date, id]);
  }

  /**
   * 删除 Token 统计记录
   */
  async delete(id) {
    const sql = 'DELETE FROM token_stats WHERE id = ?';
    return await db.run(sql, [id]);
  }
}

module.exports = new TokenStatsModel();
