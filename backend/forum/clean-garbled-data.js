// clean-garbled-data.js - 清理乱码数据

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'storage', 'forum.db');

console.log('正在清理乱码数据...\n');

const db = new sqlite3.Database(DB_PATH);

// 删除所有帖子（乱码数据）
db.run('DELETE FROM posts', (err) => {
  if (err) {
    console.error('删除帖子失败:', err);
    return;
  }
  console.log('✅ 已删除所有帖子');
});

// 删除所有评论
db.run('DELETE FROM comments', (err) => {
  if (err) {
    console.error('删除评论失败:', err);
    return;
  }
  console.log('✅ 已删除所有评论');
});

// 删除所有通知
db.run('DELETE FROM notifications', (err) => {
  if (err) {
    console.error('删除通知失败:', err);
    return;
  }
  console.log('✅ 已删除所有通知');
});

// 等待一下然后关闭
setTimeout(() => {
  db.close();
  console.log('\n✅ 清理完成！\n');
}, 1000);
