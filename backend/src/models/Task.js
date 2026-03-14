/**
 * Task 模型
 * 任务数据库操作封装（支持 SQLite 和 PostgreSQL）
 */

const { query, isSQLite } = require('../config/database');

class Task {
  /**
   * 创建任务
   */
  static async create(data) {
    const {
      title,
      description,
      agent_id,
      status = 'pending',
      priority = 'normal',
      due_date,
      result,
    } = data;

    if (isSQLite) {
      const sql = `
        INSERT INTO tasks (title, description, agent_id, status, priority, due_date, result)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        title,
        description || null,
        agent_id || null,
        status,
        priority,
        due_date || null,
        result ? JSON.stringify(result) : null,
      ];
      const dbResult = query(sql, values);
      // SQLite 需要重新查询返回完整记录
      const newTask = await this.findById(dbResult.rows[0].id);
      return newTask;
    } else {
      const sql = `
        INSERT INTO tasks (title, description, agent_id, status, priority, due_date, result)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [
        title,
        description || null,
        agent_id || null,
        status,
        priority,
        due_date || null,
        result ? JSON.stringify(result) : null,
      ];
      const dbResult = await query(sql, values);
      return dbResult.rows[0];
    }
  }

  /**
   * 获取所有任务
   */
  static async findAll(options = {}) {
    const {
      status,
      agent_id,
      priority,
      limit = 50,
      offset = 0,
    } = options;

    if (isSQLite) {
      let sql = 'SELECT * FROM tasks WHERE 1=1';
      const values = [];

      if (status) {
        sql += ` AND status = ?`;
        values.push(status);
      }

      if (agent_id) {
        sql += ` AND agent_id = ?`;
        values.push(agent_id);
      }

      if (priority) {
        sql += ` AND priority = ?`;
        values.push(priority);
      }

      sql += ' ORDER BY created_at DESC';
      sql += ` LIMIT ? OFFSET ?`;
      values.push(limit, offset);

      const result = query(sql, values);
      return result.rows;
    } else {
      let sql = 'SELECT * FROM tasks WHERE 1=1';
      const values = [];
      let paramIndex = 1;

      if (status) {
        sql += ` AND status = $${paramIndex}`;
        values.push(status);
        paramIndex++;
      }

      if (agent_id) {
        sql += ` AND agent_id = $${paramIndex}`;
        values.push(agent_id);
        paramIndex++;
      }

      if (priority) {
        sql += ` AND priority = $${paramIndex}`;
        values.push(priority);
        paramIndex++;
      }

      sql += ' ORDER BY created_at DESC';
      sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      values.push(limit, offset);

      const result = await query(sql, values);
      return result.rows;
    }
  }

  /**
   * 根据 ID 获取任务
   */
  static async findById(id) {
    if (isSQLite) {
      const sql = 'SELECT * FROM tasks WHERE id = ?';
      const result = query(sql, [id]);
      return result.rows[0];
    } else {
      const sql = 'SELECT * FROM tasks WHERE id = $1';
      const result = await query(sql, [id]);
      return result.rows[0];
    }
  }

  /**
   * 更新任务状态
   */
  static async updateStatus(id, status, result = null) {
    if (isSQLite) {
      const sql = `
        UPDATE tasks
        SET
          status = ?,
          result = COALESCE(?, result),
          completed_at = CASE WHEN ? IN ('completed', 'failed') THEN CURRENT_TIMESTAMP ELSE completed_at END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      const values = [
        status,
        result ? JSON.stringify(result) : null,
        status,
        id,
      ];
      query(sql, values);
      return await this.findById(id);
    } else {
      const sql = `
        UPDATE tasks
        SET
          status = $1,
          result = COALESCE($2, result),
          completed_at = CASE WHEN $1 IN ('completed', 'failed') THEN NOW() ELSE completed_at END,
          updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;
      const values = [
        status,
        result ? JSON.stringify(result) : null,
        id,
      ];
      const dbResult = await query(sql, values);
      return dbResult.rows[0];
    }
  }

  /**
   * 更新任务
   */
  static async update(id, data) {
    const {
      title,
      description,
      agent_id,
      status,
      priority,
      due_date,
      result,
    } = data;

    if (isSQLite) {
      const sql = `
        UPDATE tasks
        SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          agent_id = COALESCE(?, agent_id),
          status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          due_date = COALESCE(?, due_date),
          result = COALESCE(?, result),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      const values = [
        title,
        description,
        agent_id,
        status,
        priority,
        due_date,
        result ? JSON.stringify(result) : null,
        id,
      ];
      query(sql, values);
      return await this.findById(id);
    } else {
      const sql = `
        UPDATE tasks
        SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          agent_id = COALESCE($3, agent_id),
          status = COALESCE($4, status),
          priority = COALESCE($5, priority),
          due_date = COALESCE($6, due_date),
          result = COALESCE($7, result),
          updated_at = NOW()
        WHERE id = $8
        RETURNING *
      `;
      const values = [
        title,
        description,
        agent_id,
        status,
        priority,
        due_date,
        result ? JSON.stringify(result) : null,
        id,
      ];
      const dbResult = await query(sql, values);
      return dbResult.rows[0];
    }
  }

  /**
   * 分配任务给 Agent
   */
  static async assign(id, agent_id) {
    if (isSQLite) {
      const sql = `
        UPDATE tasks
        SET
          agent_id = ?,
          status = 'assigned',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      query(sql, [agent_id, id]);
      return await this.findById(id);
    } else {
      const sql = `
        UPDATE tasks
        SET
          agent_id = $1,
          status = 'assigned',
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      const dbResult = await query(sql, [agent_id, id]);
      return dbResult.rows[0];
    }
  }

  /**
   * 删除任务
   */
  static async delete(id) {
    if (isSQLite) {
      const sql = 'DELETE FROM tasks WHERE id = ?';
      const dbResult = query(sql, [id]);
      return { id, deleted: dbResult.rowCount > 0 };
    } else {
      const sql = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
      const dbResult = await query(sql, [id]);
      return dbResult.rows[0];
    }
  }

  /**
   * 获取 Agent 的任务统计
   */
  static async getAgentStats(agent_id) {
    if (isSQLite) {
      const sql = `
        SELECT
          agent_id,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
        FROM tasks
        WHERE agent_id = ?
        GROUP BY agent_id
      `;
      const result = query(sql, [agent_id]);
      return result.rows[0];
    } else {
      const sql = `
        SELECT
          agent_id,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
        FROM tasks
        WHERE agent_id = $1
        GROUP BY agent_id
      `;
      const result = await query(sql, [agent_id]);
      return result.rows[0];
    }
  }
}

module.exports = Task;
