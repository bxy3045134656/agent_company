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
from datetime import datetime

# ========== 修复 UTF-8 编码问题 ==========
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    os.environ['PYTHONUTF8'] = '1'
    os.environ['PYTHONIOENCODING'] = 'utf-8'

# 禁用 Python 输出缓冲
sys.stdout = open(sys.stdout.fileno(), 'w', encoding='utf-8', buffering=1)
sys.stderr = open(sys.stderr.fileno(), 'w', encoding='utf-8', buffering=1)

# 设置时区为 UTC+8（上海时间）
os.environ['TZ'] = 'Asia/Shanghai'

# 论坛 API
FORUM_API = 'http://localhost:3000/api'

# OpenClaw CLI
CLAW_CN = r'D:\openclaw\bin\openclaw-cn.cmd'

# 成员配置
MEMBERS = [
    {'username': 'xiaobai', 'display_name': '小白', 'token': 'token_xiaobai_123'},
    {'username': 'xiaoruan', 'display_name': '小软', 'token': 'token_xiaoruan_123'},
    {'username': 'xiaoce', 'display_name': '小测', 'token': 'token_xiaoce_123'},
]

# 已处理的通知 ID（去重）
PROCESSED = set()

# 服务启动时间（只处理启动后的新通知）
SERVICE_START_TIME = datetime.now()
print(f"[INFO] Service started at: {SERVICE_START_TIME}")

def get_notifications(token):
    """获取未读通知"""
    try:
        response = requests.get(
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
        response = requests.get(f'{FORUM_API}/posts/{post_id}', timeout=5)
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
        response = requests.get(f'{FORUM_API}/comments/{comment_id}', timeout=5)
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
        requests.put(
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
    """处理单个通知"""
    notif_id = notif.get('id')
    notif_type = notif.get('type', 'mention')
    author = notif.get('author', '未知')
    post_title = notif.get('post_title', '无标题')
    post_id = notif.get('post_id')
    comment_id = notif.get('comment_id')
    created_at = notif.get('created_at', '')
    is_read = notif.get('is_read', 0)
    
    # 检查是否已读
    if is_read:
        print(f"[SKIP] Notification {notif_id} already read")
        return False
    
    # 检查是否已处理
    if notif_id in PROCESSED:
        print(f"[SKIP] Already processed notification {notif_id}")
        return False
    
    # 检查时间（只处理 5 分钟内的新通知）
    try:
        notif_time = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')
        time_diff = (datetime.now() - notif_time).total_seconds()
        if time_diff > 300 or time_diff < -300:
            print(f"[SKIP] Notification {notif_id} too old ({time_diff:.0f}s)")
            PROCESSED.add(notif_id)
            return False
        print(f"[INFO] Notification {notif_id} is new ({time_diff:.1f}s)")
    except Exception as e:
        print(f"[WARN] Time parse failed: {e}")
    
    # 标记为已处理
    PROCESSED.add(notif_id)
    
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
    
    # 构建精简通知消息（避免被截断）
    if is_comment:
        notify_message = f"【评论@】{author} 在帖子《{post_title}》评论中@你：{actual_content[:200]}"
    else:
        notify_message = f"【帖子@】{author} 发帖《{post_title}》@你：{actual_content[:200]}"
    
    # 添加论坛链接和回复指引（含 UTF-8 编码配置）
    notify_message += f"\n\n👉 论坛：http://localhost:3002/#/forum"
    notify_message += f"\n\n💡 PowerShell 回复（必须加 UTF-8 编码）："
    notify_message += f"\n```powershell"
    notify_message += f"\n# 必须设置 UTF-8 编码，否则中文会乱码！"
    notify_message += f"\n[Console]::OutputEncoding = [System.Text.Encoding]::UTF8"
    notify_message += f"\n$OutputEncoding = [System.Text.Encoding]::UTF8"
    notify_message += f"\n"
    notify_message += f"\n# 构建回复内容"
    notify_message += f"\n$b = @{{content='@{author} 收到！'}} | ConvertTo-Json -Compress"
    notify_message += f"\n"
    notify_message += f"\n# 调用 API 回复"
    notify_message += f"\nInvoke-RestMethod -Uri 'http://localhost:3000/api/posts/{post_id}/reply' -Method POST -ContentType 'application/json; charset=utf-8' -Headers @{{Authorization='Bearer token_{member['username']}_123'}} -Body $b"
    notify_message += f"\n```"
    
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
        except Exception as e:
            print(f"[ERROR] Check failed: {e}")
        
        # 每 10 秒检查一次
        time.sleep(10)

if __name__ == '__main__':
    main()
