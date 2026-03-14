// run-migration.js - v2.0 数据库迁移脚本
// 用法：node run-migration.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'storage', 'forum.db');
const MIGRATION_SQL = path.join(__dirname, 'migrate_v2.0.sql');

console.log('🚀 开始 v2.0 数据库迁移...\n');
console.log(`📁 数据库路径：${DB_PATH}`);
console.log(`📄 迁移脚本：${MIGRATION_SQL}\n`);

// 检查数据库文件是否存在
if (!fs.existsSync(DB_PATH)) {
  console.log('❌ 数据库文件不存在，将创建新数据库');
}

// 检查迁移脚本是否存在
if (!fs.existsSync(MIGRATION_SQL)) {
  console.error('❌ 迁移脚本不存在！');
  process.exit(1);
}

// 读取迁移脚本
const migrationSQL = fs.readFileSync(MIGRATION_SQL, 'utf-8');

// 连接数据库
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err);
    process.exit(1);
  }
  console.log('✅ 已连接到数据库\n');
  
  // 执行迁移
  console.log('📝 执行迁移 SQL...\n');
  
  db.exec(migrationSQL, function(err) {
    if (err) {
      // 忽略 "duplicate column" 错误（字段已存在）
      if (err.message.includes('duplicate column')) {
        console.log('⚠️  部分字段已存在，跳过\n');
      } else {
        console.error('❌ 迁移失败:', err);
        db.close();
        process.exit(1);
      }
    }
    
    console.log('✅ 迁移执行完成\n');
    
    // 验证迁移结果
    console.log('🔍 验证迁移结果...\n');
    
    db.all('PRAGMA table_info(notifications)', (err, rows) => {
      if (err) {
        console.error('❌ 验证失败:', err);
        db.close();
        process.exit(1);
      }
      
      console.log('📋 notifications 表结构:');
      console.log('─'.repeat(60));
      console.log('cid | name           | type    | notnull | dflt_value');
      console.log('─'.repeat(60));
      
      rows.forEach(row => {
        console.log(`${row.cid.toString().padStart(3)} | ${row.name.padEnd(14)} | ${row.type.padEnd(7)} | ${row.notnull.toString().padEnd(7)} | ${row.dflt_value || 'NULL'}`);
      });
      
      console.log('─'.repeat(60));
      
      // 检查新字段是否存在
      const newFields = ['author', 'post_title', 'task_priority'];
      const existingFields = rows.map(row => row.name);
      
      console.log('\n✅ 新字段检查:');
      newFields.forEach(field => {
        if (existingFields.includes(field)) {
          console.log(`  ✅ ${field}`);
        } else {
          console.log(`  ❌ ${field} (缺失)`);
        }
      });
      
      console.log('\n🎉 迁移完成！\n');
      
      db.close();
    });
  });
});
