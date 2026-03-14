/**
 * Agent 模型
 * 数据库操作封装（支持 SQLite 和 PostgreSQL）
 */

const { query, isSQLite } = require('../config/database');

class Agent {
  /**
   * 创建 Agent
   */
  static async create(data) {
    const {
      name,
      display_name,
      description,
      capabilities,
      config,
    } = data;

    if (isSQLite) {
      const sql = `
        INSERT INTO agents (name, display_name, description, capabilities, config)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [
        name,
        display_name || name,
        description || '',
        JSON.stringify(capabilities || {}),
        JSON.stringify(config || {}),
      ];
      const result = query(sql, values);
      return result.rows[0];
    } else {
      const sql = `
        INSERT INTO agents (name, display_name, description, capabilities, config)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [
        name,
        display_name || name,
        description || '',
        JSON.stringify(capabilities || {}),
        JSON.stringify(config || {}),
      ];
      const result = await query(sql, values);
      return result.rows[0];
    }
  }

  /**
   * 获取所有 Agents
   */
  static async findAll(options = {}) {
    const { status = 'active', limit = 50, offset = 0 } = options;

    if (isSQLite) {
      const sql = `
        SELECT * FROM agents
        WHERE status = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const result = query(sql, [status, limit, offset]);
      return result.rows;
    } else {
      const sql = `
        SELECT * FROM agents
        WHERE status = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      const result = await query(sql, [status, limit, offset]);
      return result.rows;
    }
  }

  /**
   * 根据 ID 获取 Agent
   */
  static async findById(id) {
    if (isSQLite) {
      const sql = 'SELECT * FROM agents WHERE id = ?';
      const result = query(sql, [id]);
      return result.rows[0];
    } else {
      const sql = 'SELECT * FROM agents WHERE id = $1';
      const result = await query(sql, [id]);
      return result.rows[0];
    }
  }

  /**
   * 根据名称获取 Agent
   */
  static async findByName(name) {
    if (isSQLite) {
      const sql = 'SELECT * FROM agents WHERE name = ?';
      const result = query(sql, [name]);
      return result.rows[0];
    } else {
      const sql = 'SELECT * FROM agents WHERE name = $1';
      const result = await query(sql, [name]);
      return result.rows[0];
    }
  }

  /**
   * 更新 Agent
   */
  static async update(id, data) {
    const {
      display_name,
      description,
      capabilities,
      config,
      status,
    } = data;

    if (isSQLite) {
      const sql = `
        UPDATE agents
        SET
          display_name = COALESCE(?, display_name),
          description = COALESCE(?, description),
          capabilities = COALESCE(?, capabilities),
          config = COALESCE(?, config),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      const values = [
        display_name,
        description,
        capabilities ? JSON.stringify(capabilities) : null,
        config ? JSON.stringify(config) : null,
        status,
        id,
      ];
      const result = query(sql, values);
      // SQLite 需要重新查询返回完整记录
      return await this.findById(id);
    } else {
      const sql = `
        UPDATE agents
        SET
          display_name = COALESCE($1, display_name),
          description = COALESCE($2, description),
          capabilities = COALESCE($3, capabilities),
          config = COALESCE($4, config),
          status = COALESCE($5, status),
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `;
      const values = [
        display_name,
        description,
        capabilities ? JSON.stringify(capabilities) : null,
        config ? JSON.stringify(config) : null,
        status,
        id,
      ];
      const result = await query(sql, values);
      return result.rows[0];
    }
  }

  /**
   * 删除 Agent
   */
  static async delete(id) {
    if (isSQLite) {
      const sql = 'DELETE FROM agents WHERE id = ?';
      const result = query(sql, [id]);
      return { id, deleted: result.rowCount > 0 };
    } else {
      const sql = 'DELETE FROM agents WHERE id = $1 RETURNING *';
      const result = await query(sql, [id]);
      return result.rows[0];
    }
  }

  /**
   * 获取 Agent 统计
   */
  static async getStats(id) {
    if (isSQLite) {
      const sql = `
        SELECT
          a.id,
          a.name,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks,
          COUNT(CASE WHEN t.status = 'failed' THEN 1 END) as failed_tasks
        FROM agents a
        LEFT JOIN tasks t ON a.id = t.agent_id
        WHERE a.id = ?
        GROUP BY a.id, a.name
      `;
      const result = query(sql, [id]);
      return result.rows[0];
    } else {
      const sql = `
        SELECT
          a.id,
          a.name,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) as pending_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'failed' THEN t.id END) as failed_tasks
        FROM agents a
        LEFT JOIN tasks t ON a.id = t.agent_id
        WHERE a.id = $1
        GROUP BY a.id, a.name
      `;
      const result = await query(sql, [id]);
      return result.rows[0];
    }
  }
}

module.exports = Agent;
