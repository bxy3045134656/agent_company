// check-comments.js - 检查帖子评论

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'storage', 'forum.db');

const db = new sqlite3.Database(DB_PATH);

console.log('=== 检查帖子 #133 的评论 ===\n');

db.all('SELECT * FROM comments WHERE post_id = 133 ORDER BY created_at ASC', (err, comments) => {
  if (err) {
    console.error('查询失败:', err);
    return;
  }
  
  console.log(`找到 ${comments.length} 条评论:\n`);
  
  comments.forEach((comment, index) => {
    console.log(`[${index + 1}] ID: ${comment.id}`);
    console.log(`    作者: ${comment.author}`);
    console.log(`    内容: ${comment.content}`);
    console.log(`    时间: ${comment.created_at}`);
    console.log(`    parent_id: ${comment.parent_id}`);
    console.log('');
  });
  
  db.close();
});
