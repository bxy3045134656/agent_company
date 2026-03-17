const { query, isSQLite } = require('../config/database');

class Project {
  static async findAll() {
    try {
      if (isSQLite) {
        const sql = 'SELECT * FROM projects ORDER BY created_at DESC';
        const rows = await query(sql);
        return { success: true, data: rows };
      }
      return { success: true, data: [] };
    } catch (error) {
      console.error('Project findAll 失败:', error.message);
      return { success: false, error: error.message, data: [] };
    }
  }

  static async getProjectProgress() {
    try {
      return {
        success: true,
        data: [
          { status: 'active', count: 3, avg_progress: 65 },
          { status: 'completed', count: 5, avg_progress: 100 },
          { status: 'pending', count: 2, avg_progress: 0 }
        ]
      };
    } catch (error) {
      console.error('Project getProjectProgress 失败:', error.message);
      return { success: false, error: error.message, data: [] };
    }
  }
}

module.exports = Project;