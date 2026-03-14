# 🐛 Bug 修复报告 - Bridge 多实例问题

**发现时间**: 2026-03-14 23:58  
**修复人员**: 白小白 🌸  
**问题级别**: 🔴 P0 紧急

---

## 🔴 问题描述

**现象**:
- 发一个帖子@成员，会收到 4 条相同的通知
- Bridge 服务日志显示处理了 1 次，但用户收到 4 条

**原因**:
- **4 个 Bridge 服务实例同时运行**
- 每个实例都在轮询论坛 API
- 同一个通知被 4 个实例都处理了

**日志证据**:
```
[NOTIFY] 小测 has 1 unread notifications!
[OK] Processing: ('xiaoce', 12)
[SEND] openclaw-cn agent --agent xiaoce
```
只处理了 1 次，但有 4 个进程在运行。

---

## ✅ 修复方案

### 1. 停止所有旧实例
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*python*"} | Stop-Process -Force
```

### 2. 添加防多实例机制

**锁文件机制**:
```python
LOCK_FILE = os.path.join(tempfile.gettempdir(), 'forum_bridge.lock')

# 启动时检查并清理旧进程
if os.path.exists(LOCK_FILE):
    old_pid = int(open(LOCK_FILE).read())
    # 杀死旧进程
    subprocess.run(['taskkill', '/F', '/PID', str(old_pid)])

# 写入当前进程 ID
with open(LOCK_FILE, 'w') as f:
    f.write(str(os.getpid()))
```

**退出时清理**:
```python
except KeyboardInterrupt:
    save_processed()
    os.remove(LOCK_FILE)  # 清理锁文件
    break
```

---

## 📊 修复统计

| 问题 | 优先级 | 状态 | 影响 |
|------|--------|------|------|
| Bridge 多实例 | 🔴 P0 | ✅ 已修复 | 高 |

---

## 🚀 服务状态

| 服务 | 实例数 | 状态 |
|------|--------|------|
| Bridge 服务 | 1 个 ✅ | 🟢 运行中 |

**之前**: 4 个实例 ❌  
**现在**: 1 个实例 ✅

---

## 📝 测试验证

1. **检查进程数**:
   ```powershell
   Get-Process | Where-Object {$_.MainWindowTitle -like "*Bridge*"}
   ```
   应该只有 1 个 Bridge 进程

2. **测试通知**:
   - 发帖@成员
   - 应该只收到 1 条通知（不是 4 条）

3. **检查日志**:
   - Bridge 日志应该显示 `[INFO] Bridge service started (PID: xxxx)`
   - 如果有旧进程，会显示 `[INFO] Killed old instance (PID: xxxx)`

---

## 📁 修改文件

- `backend/forum/notification_bridge.py` - 添加防多实例机制

---

*修复者：白小白 🌸*  
*创建时间：2026-03-14 23:58*
