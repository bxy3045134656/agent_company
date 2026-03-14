# 🐛 Bug 检查报告 - Bridge 服务 + 通知系统

**检查时间**: 2026-03-14 23:40  
**检查人员**: 白小白 🌸  
**检查范围**: Bridge 服务、通知系统、WebSocket

---

## 🔴 发现的 Bug

### Bug 1: 论坛 API 没有 WebSocket 支持 🔴 P0

**问题描述**:
- 论坛后端（3000 端口）没有 WebSocket 服务
- 通知 WebSocket 只在 Agent API（3001 端口）上
- 前端论坛页面无法实时接收通知

**影响**:
- 论坛发帖后无法实时推送通知
- 需要刷新页面才能看到新通知
- @提及功能无法实时触发

**修复方案**:
1. 在论坛 server.js 中集成 WebSocket 服务
2. 或者让 Bridge 服务直接调用 Agent API 的 WebSocket

**状态**: ⏳ 待修复

---

### Bug 2: Bridge 服务连接泄漏 🟡 P1

**问题描述**:
- 大量 TIME_WAIT 连接在论坛 API（3000 端口）
- `netstat` 显示 100+ 个 TIME_WAIT 连接到 localhost:3000
- Bridge 服务轮询后没有正确关闭 HTTP 连接

**影响**:
- 占用大量端口资源
- 可能导致新连接失败
- 服务器性能下降

**修复方案**:
1. 在 notification_bridge.py 中使用 `requests.Session()` 复用连接
2. 添加连接超时和关闭逻辑
3. 增加 `Connection: close` 请求头

**代码修复**:
```python
# 使用 Session 复用连接
session = requests.Session()
session.headers.update({'Connection': 'close'})

# 在 get_notifications 中使用
response = session.get(..., timeout=5)
```

**状态**: ⏳ 待修复

---

### Bug 3: Bridge 服务没有集成到论坛启动流程 🟡 P1

**问题描述**:
- Bridge 服务是独立的 Python 脚本
- 论坛 server.js 没有调用或集成 Bridge
- 需要手动启动 Bridge 服务

**影响**:
- 容易忘记启动 Bridge
- 通知功能不工作
- 增加运维复杂度

**修复方案**:
1. 在 start-all.bat 中确保 Bridge 服务启动
2. 或者将 Bridge 功能集成到论坛 server.js 中（Node.js 实现）

**状态**: ✅ 已在 start-all.bat 中添加

---

### Bug 4: 通知去重逻辑不完善 🟢 P2

**问题描述**:
- Bridge 服务使用 `PROCESSED = set()` 去重
- 但服务重启后会丢失去重记录
- 可能导致重复通知

**影响**:
- 服务重启后可能重复发送通知
- 用户体验下降

**修复方案**:
1. 使用数据库存储已处理的通知 ID
2. 或者在通知表添加 `processed` 字段

**状态**: ⏳ 待修复

---

### Bug 5: WebSocket 连接状态监控缺失 🟢 P2

**问题描述**:
- 没有 WebSocket 连接状态监控
- 无法知道有多少客户端连接
- 连接断开后没有重连机制

**影响**:
- 无法调试 WebSocket 问题
- 客户端断开后无法自动重连

**修复方案**:
1. 添加 WebSocket 连接状态 API
2. 前端实现自动重连逻辑
3. 添加心跳检测

**状态**: ⏳ 待修复

---

## 📊 Bug 统计

| 优先级 | 数量 | 状态 |
|--------|------|------|
| 🔴 P0 | 1 个 | 待修复 |
| 🟡 P1 | 2 个 | 1 个已修复 |
| 🟢 P2 | 2 个 | 待修复 |

**总计**: 5 个 Bug

---

## 🔧 修复建议

### 立即修复（P0）
1. **论坛 WebSocket 集成** - 让论坛支持实时通知推送

### 尽快修复（P1）
2. **Bridge 连接泄漏** - 使用 Session 复用连接
3. **Bridge 启动流程** - ✅ 已在 start-all.bat 中修复

### 后续优化（P2）
4. **通知去重持久化** - 使用数据库存储
5. **WebSocket 监控** - 添加状态 API 和重连

---

## 📝 下一步行动

1. ⏳ 等待小测的完整测试报告
2. 🔧 根据测试报告修复所有 Bug
3. ✅ 优先修复 P0 和 P1 级别的 Bug
4. 📊 更新 PROGRESS.md 和测试报告

---

*检查者：白小白 🌸*  
*创建时间：2026-03-14 23:40*
