#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
通知推送服务 - 轮询论坛 API + 命令行发送
参考原小龙虾论坛 bridge 实现
"""

import requests
import subprocess
import time
import sys
import os
import json
from datetime import datetime

# ========== 配置 OpenClaw CLI 路径 ==========
# 从环境变量读取，如果没有则使用默认值
if sys.platform == 'win32':
    CLAW_CN = os.environ.get('OPENCLAW_CLI', r'D:\openclaw\bin\openclaw-cn.cmd')
else:
    CLAW_CN = os.environ.get('OPENCLAW_CLI', '/usr/local/bin/openclaw-cn')

# ========== 修复 UTF-8 编码问题 ==========
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    os.environ['PYTHONUTF8'] = '1'
    os.environ['PYTHONIOENCODING'] = 'utf-8'

# ========== 防止多实例运行 ==========
import hashlib
import tempfile

# 创建锁文件（使用进程 ID）
LOCK_FILE = os.path.join(tempfile.gettempdir(), 'forum_bridge.lock')
if os.path.exists(LOCK_FILE):
    try:
        with open(LOCK_FILE, 'r') as f:
            old_pid = int(f.read().strip())
        # 检查旧进程是否还在运行
        import subprocess
        result = subprocess.run(['taskkill', '/F', '/PID', str(old_pid)], 
                              capture_output=True, timeout=2)
        if result.returncode == 0:
            print(f"[INFO] Killed old instance (PID: {old_pid})")
    except:
        pass

# 写入当前进程 ID
with open(LOCK_FILE, 'w') as f:
    f.write(str(os.getpid()))

print(f"[INFO] Bridge service started (PID: {os.getpid()})")

# 禁用 Python 输出缓冲
sys.stdout = open(sys.stdout.fileno(), 'w', encoding='utf-8', buffering=1)
sys.stderr = open(sys.stderr.fileno(), 'w', encoding='utf-8', buffering=1)

# 设置时区为 UTC+8（上海时间）
os.environ['TZ'] = 'Asia/Shanghai'

# 论坛 API
FORUM_API = 'http://localhost:3000/api'

# OpenClaw CLI 路径（从环境变量读取，如果未定义则使用默认值）
# CLAW_CN 已在文件开头定义

# 创建 HTTP Session 复用连接（修复连接泄漏）
session = requests.Session()
session.headers.update({'Connection': 'close'})

# 成员配置
MEMBERS = [
    {'username': 'xiaobai', 'display_name': '小白', 'token': 'token_xiaobai_123'},
    {'username': 'xiaoruan', 'display_name': '小软', 'token': 'token_xiaoruan_123'},
    {'username': 'xiaoce', 'display_name': '小测', 'token': 'token_xiaoce_123'},
]

# 已处理的通知（按成员 + 帖子 + 评论去重）
# 格式：{(username, post_id, comment_id), ...}
PROCESSED_FILE = os.path.join(os.path.dirname(__file__), 'processed_notifications.json')
PROCESSED = set()

# 加载已处理的通知记录
if os.path.exists(PROCESSED_FILE):
    try:
        with open(PROCESSED_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            PROCESSED = set(tuple(x) for x in data)
        print(f"[INFO] Loaded {len(PROCESSED)} processed notifications from disk")
    except:
        pass

# 保存已处理的通知记录
def save_processed():
    try:
        with open(PROCESSED_FILE, 'w', encoding='utf-8') as f:
            json.dump(list(PROCESSED), f)
    except:
        pass

# 服务启动时间（只处理启动后的新通知）
SERVICE_START_TIME = datetime.now()
print(f"[INFO] Service started at: {SERVICE_START_TIME}")

def get_notifications(token):
    """获取未读通知"""
    try:
        response = session.get(
            f'{FORUM_API}/notifications',
            headers={'Authorization': f'Bearer {token}'},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data.get('notifications', [])
        return []
    except Exception as e:
        print(f"[ERROR] Get notifications failed: {e}")
        return []

def get_post_content(post_id):
    """获取帖子完整内容"""
    try:
        response = session.get(f'{FORUM_API}/posts/{post_id}', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data.get('post', {}).get('content', '')
        return ''
    except Exception as e:
        print(f"[ERROR] Get post content failed: {e}")
        return ''

def get_comment_content(comment_id):
    """获取评论完整内容"""
    try:
        response = session.get(f'{FORUM_API}/comments/{comment_id}', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data.get('comment', {}).get('content', '')
        return ''
    except Exception as e:
        print(f"[ERROR] Get comment content failed: {e}")
        return ''

def mark_as_read(notification_id, token):
    """标记通知为已读"""
    try:
        session.put(
            f'{FORUM_API}/notifications/{notification_id}/read',
            headers={'Authorization': f'Bearer {token}'},
            timeout=5
        )
        print(f"[OK] Marked notification {notification_id} as read")
    except Exception as e:
        print(f"[ERROR] Mark as read failed: {e}")

def send_to_agent(agent_id, message, post_id=None, comment_id=None, is_comment=False):
    """发送消息到 Agent session - 使用 openclaw-cn agent 直接触发"""
    try:
        # 短消息 - 简洁明了
        if is_comment and comment_id:
            short_message = f"帖子 #{post_id} 评论 @{agent_id}，请回复"
        else:
            short_message = f"帖子 #{post_id} @{agent_id}，请回复"
        
        cmd = [
            CLAW_CN,
            'agent',
            '--agent', agent_id,
            '--message', message,  # 使用完整消息，不是短消息
            '--json',
            '--timeout', '60'
        ]
        
        print(f"[SEND] openclaw-cn agent --agent {agent_id}")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=65,
            encoding='utf-8',
            errors='ignore',
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
        )
        
        print(f"[RETURN] code={result.returncode}")
        if result.stdout:
            print(f"[STDOUT] {result.stdout[:300]}")
        
        return result.returncode == 0
            
    except subprocess.TimeoutExpired:
        print(f"[TIMEOUT] 65s")
        return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

def process_notification(member, notif):
    """处理单个通知（每个@提及只发送一次）"""
    notif_id = notif.get('id')
    notif_type = notif.get('type', 'mention')
    author = notif.get('author', '未知')
    post_title = notif.get('post_title', '无标题')
    post_id = notif.get('post_id')
    comment_id = notif.get('comment_id')
    created_at = notif.get('created_at', '')
    is_read = notif.get('is_read', 0)
    
    # 判断是帖子还是评论（提前判断，用于去重键）
    is_comment = comment_id is not None and comment_id != ''
    
    # 构建去重键：（成员 + 帖子 + 评论）
    # 确保每个评论都能发送通知
    if is_comment and comment_id:
        dedup_key = (member['username'], post_id, comment_id)
    else:
        dedup_key = (member['username'], post_id)
    
    # 检查是否已读
    if is_read:
        print(f"[SKIP] Notification {notif_id} already read")
        return False
    
    # 检查是否已处理（按成员 + 帖子 + 评论去重）
    if dedup_key in PROCESSED:
        print(f"[SKIP] Already processed: {dedup_key}")
        return False
    
    # 检查时间（只处理 5 分钟内的新通知）
    try:
        notif_time = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')
        time_diff = (datetime.now() - notif_time).total_seconds()
        if time_diff > 300 or time_diff < -300:
            print(f"[SKIP] Notification {notif_id} too old ({time_diff:.0f}s)")
            PROCESSED.add(dedup_key)
            return False
        print(f"[INFO] Notification {notif_id} is new ({time_diff:.1f}s)")
    except Exception as e:
        print(f"[WARN] Time parse failed: {e}")
    
    # 标记为已处理（使用去重键）
    PROCESSED.add(dedup_key)
    save_processed()  # 持久化到磁盘
    print(f"[OK] Processing: {dedup_key}")
    
    # 判断是帖子还是评论
    is_comment = comment_id is not None and comment_id != ''
    
    # 获取实际@内容
    if is_comment:
        actual_content = get_comment_content(comment_id)
        print(f"[COMMENT #{comment_id}] @{member['display_name']}: {actual_content[:80]}...")
    else:
        actual_content = get_post_content(post_id)
        print(f"[POST #{post_id}] @{member['display_name']}: {actual_content[:80]}...")
    
    # 打印通知详情
    print(f"\n{'='*60}")
    print(f"[NOTIFY] {member['display_name']}")
    print(f"{'='*60}")
    print(f"ID: {notif_id}")
    print(f"Type: {notif_type}")
    print(f"Author: {author}")
    if is_comment:
        print(f"Comment: #{comment_id}")
    print(f"Post: {post_title} (#{post_id})")
    print(f"Content: {actual_content[:100]}...")
    print(f"Time: {created_at}")
    print(f"{'='*60}\n")
    
    # 构建结构化通知消息（优化版：帖子编号 + 评论编号都突出显示 + 明确回复指引 + 优先级规范）
    if is_comment:
        notify_message = f"【评论@提醒】{author} 在帖子 #{post_id} 的评论 #{comment_id} 中@了你\n\n"
        notify_message += f"📋 快速定位：\n"
        notify_message += f"- 帖子编号：#{post_id}\n"
        notify_message += f"- 评论编号：#{comment_id}\n"
        notify_message += f"- 帖子标题：{post_title}\n\n"
        notify_message += f"💬 @你的内容：\n{actual_content[:500]}\n\n"
        notify_message += f"👉 查看帖子：http://localhost:3002/#/forum\n"
        notify_message += f"💡 请查看帖子内容并回复@你的内容！\n"
        notify_message += f"⚠️ 注意：请在帖子评论区回复，不要忽略@你的内容！\n"
        notify_message += f"⭐ 回复优先级：如果是在回复区被@，优先回复回复区内容，而不是帖子内容！"
    else:
        notify_message = f"【帖子@提醒】{author} 在帖子 #{post_id} 中@了你\n\n"
        notify_message += f"📋 快速定位：\n"
        notify_message += f"- 帖子编号：#{post_id}\n"
        notify_message += f"- 帖子标题：{post_title}\n\n"
        notify_message += f"💬 @你的内容：\n{actual_content[:500]}\n\n"
        notify_message += f"👉 查看帖子：http://localhost:3002/#/forum\n"
        notify_message += f"💡 请查看帖子内容并回复@你的内容！\n"
        notify_message += f"⚠️ 注意：请在帖子评论区回复，不要忽略@你的内容！\n"
        notify_message += f"⭐ 回复优先级：如果是在回复区被@，优先回复回复区内容，而不是帖子内容！"
    
    print(f"[MESSAGE] Sending to {member['display_name']}:")
    print(notify_message)
    print()
    
    # 发送
    send_to_agent(member['username'], notify_message, post_id, comment_id, is_comment)
    
    # 标记为已读
    mark_as_read(notif_id, member['token'])
    
    return True

def check_all_members():
    """检查所有成员的通知并发送"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Checking notifications...")
    
    for member in MEMBERS:
        notifications = get_notifications(member['token'])
        
        if notifications:
            print(f"[NOTIFY] {member['display_name']} has {len(notifications)} unread notifications!")
            
            for notif in notifications:
                process_notification(member, notif)
        else:
            print(f"[INFO] {member['display_name']} - no new notifications")

def main():
    """主循环"""
    print("="*60)
    print("[INFO] Notification service started")
    print(f"[INFO] Forum API: {FORUM_API}")
    print(f"[INFO] CLI: {CLAW_CN}")
    print(f"[INFO] Members: {len(MEMBERS)}")
    print("="*60)
    print()
    
    # 主循环（每 10 秒检查一次）
    while True:
        try:
            check_all_members()
        except KeyboardInterrupt:
            print("\n[INFO] Service stopped by user")
            save_processed()  # 保存已处理记录
            # 清理锁文件
            if os.path.exists(LOCK_FILE):
                os.remove(LOCK_FILE)
            break
        except Exception as e:
            print(f"[ERROR] Check failed: {e}")
        
        # 每 10 秒检查一次
        time.sleep(10)

if __name__ == '__main__':
    main()
