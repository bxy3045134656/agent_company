/**
 * 数据库初始化脚本
 * 创建必要的表结构
 */

const { pool } = require('./config/database');

const initDB = async () => {
  console.log('🔄 开始初始化数据库...');

  try {
    // 创建 agents 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        display_name VARCHAR(100),
        description TEXT,
        capabilities JSONB,
        status VARCHAR(20) DEFAULT 'active',
        config JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ agents 表创建成功');

    // 创建 tasks 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        agent_id INTEGER REFERENCES agents(id),
        status VARCHAR(20) DEFAULT 'pending',
        priority VARCHAR(20) DEFAULT 'normal',
        due_date TIMESTAMP,
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ tasks 表创建成功');

    // 创建 workflows 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        definition JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ workflows 表创建成功');

    // 创建 workflow_runs 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workflow_runs (
        id SERIAL PRIMARY KEY,
        workflow_id INTEGER REFERENCES workflows(id),
        status VARCHAR(20) DEFAULT 'running',
        current_step INTEGER,
        result JSONB,
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )
    `);
    console.log('✅ workflow_runs 表创建成功');

    // 插入示例数据 - Agents
    await pool.query(`
      INSERT INTO agents (name, display_name, description, capabilities, status)
      VALUES
        ('xiaoruan', '小软 🤖', '全栈工程师 Agent', '{"skills": ["frontend", "backend", "database"]}', 'active'),
        ('xiaoshi', '小市 🏪', '市场调研专家', '{"skills": ["market_research", "user_analysis"]}', 'active'),
        ('xiaoce', '小测 🔍', '测试专家', '{"skills": ["testing", "qa", "ci_cd"]}', 'active')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('✅ 示例 Agents 插入成功');

    // 插入示例数据 - Tasks
    await pool.query(`
      INSERT INTO tasks (title, description, agent_id, status, priority)
      VALUES
        ('完成技术架构文档', '编写 Agent Company 技术架构设计文档', 1, 'completed', 'high'),
        ('市场调研报告', '完成目标市场分析', 2, 'completed', 'high'),
        ('测试策略文档', '制定项目测试策略', 3, 'completed', 'high'),
        ('MVP 后端开发', '实现核心 API 接口', 1, 'in_progress', 'high')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ 示例 Tasks 插入成功');

    console.log('🎉 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  initDB()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initDB;
