-- v2.0 数据库迁移脚本
-- 日期：2026-03-11
-- 说明：为现有 notifications 表添加 v2.0 新字段

-- 添加 author 字段（发帖人/评论人）
ALTER TABLE notifications ADD COLUMN author TEXT;

-- 添加 post_title 字段（帖子标题）
ALTER TABLE notifications ADD COLUMN post_title TEXT;

-- 添加 task_priority 字段（任务优先级）
ALTER TABLE notifications ADD COLUMN task_priority TEXT DEFAULT 'normal';

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(task_priority);

-- 验证迁移结果
SELECT 
  name, 
  sql 
FROM sqlite_master 
WHERE type='table' AND name='notifications';

-- 显示表结构
PRAGMA table_info(notifications);
