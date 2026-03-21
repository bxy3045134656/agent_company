# 🎯 v3.0 需求文档 - 假数据清理专项

**版本**: v3.0  
**创建时间**: 2026-03-17  
**优先级**: P0（最高优先级）  
**目标**: 清理所有假数据，实现 100% 真实数据连接

---

## 📋 背景

v2.0 完成后发现部分服务仍使用假数据：
- ❌ `financeService.js` - 财务数据使用 `Math.random()`
- ❌ `tokenStatsService.js` - Token 统计使用 `Math.random()`
- ⚠️ `stageService.js` - 舞台系统有假 Agent 降级方案

**v3.0 目标**: 清理所有假数据，实现完全真实的数据连接！

---

## 🎯 任务拆解

### P3-1: 财务系统假数据清理 ✅
**文件**: `backend/src/services/financeService.js`

**当前问题**:
```javascript
// ❌ 假数据
this.mockData = {
  income: Math.floor(Math.random() * 50000) + 80000,
  cost: Math.floor(Math.random() * 20000) + 30000,
  profit: Math.floor(Math.random() * 30000) + 50000,
}
```

**验收标准**:
- [ ] 移除所有 `mockData` 和 `Math.random()`
- [ ] 连接真实财务数据源（数据库或 API）
- [ ] 实现收入统计 API（真实数据）
- [ ] 实现成本计算 API（真实数据）
- [ ] 实现利润分析 API（真实数据）
- [ ] API 测试通过

**技术要点**:
- 从 OpenClaw 获取真实任务数据
- 根据任务工时计算成本
- 根据任务完成状态计算收入
- 利润 = 收入 - 成本

---

### P3-2: Token 统计假数据清理 ✅
**文件**: `backend/src/services/tokenStatsService.js`

**当前问题**:
```javascript
// ❌ 假数据
this.mockData = {
  total: { input: Math.random()..., output: Math.random()... },
  byModel: [...],
  cost: Math.random()...
}
```

**验收标准**:
- [ ] 移除所有 `mockData` 和 `Math.random()`
- [ ] 连接 OpenClaw API 获取真实 Token 使用数据
- [ ] 实现按模型统计（qwen3.5-plus 等）
- [ ] 实现成本计算（基于官方定价）
- [ ] 实现历史趋势 API
- [ ] API 测试通过

**技术要点**:
- 调用 `openclaw sessions list` 获取会话
- 从会话历史中提取 Token 使用
- 根据模型定价计算成本
- 缓存机制（5 分钟）

---

### P3-3: 舞台系统假 Agent 清理 ✅
**文件**: `backend/src/services/stageService.js`

**当前问题**:
```javascript
// ⚠️ 假 Agent 降级方案
this.initMockAgents();
fallbackAgents = [...]
```

**验收标准**:
- [ ] 移除 `initMockAgents()` 函数
- [ ] 移除 `fallbackAgents` 假数据
- [ ] 只使用真实 OpenClaw Agent 数据
- [ ] API 失败时显示错误提示（不使用假数据）
- [ ] WebSocket 实时同步 Agent 状态
- [ ] API 测试通过

**技术要点**:
- 调用 `openclaw sessions list` 获取真实 Agent
- 失败时返回空数组 + 错误信息
- 前端显示"暂无数据"而不是假数据

---

## 📊 项目进度

**v3.0 总体进度**: 0% 完成

| 任务 | Issue | 状态 | 负责人 |
|------|-------|------|--------|
| P3-1 财务系统假数据清理 | 待创建 | ⏳ 等待中 | 小软 |
| P3-2 Token 统计假数据清理 | 待创建 | ⏳ 等待中 | 小软 |
| P3-3 舞台系统假 Agent 清理 | 待创建 | ⏳ 等待中 | 小软 |

---

## ✅ 验收标准

**代码层面**:
- ✅ 所有 `Math.random()` 已移除
- ✅ 所有 `mockData` 已移除
- ✅ 所有 `initMockAgents()` 已移除
- ✅ 所有假数据降级方案已移除

**功能层面**:
- ✅ 财务系统显示真实数据
- ✅ Token 统计显示真实数据
- ✅ 舞台系统显示真实 Agent
- ✅ API 失败时显示错误（不使用假数据）

**测试层面**:
- ✅ 所有 API 测试通过
- ✅ 前端页面正常显示
- ✅ 无控制台错误

---

## 📁 相关文件

- `backend/src/services/financeService.js`
- `backend/src/services/tokenStatsService.js`
- `backend/src/services/stageService.js`
- `frontend/src/pages/Finance.jsx`
- `frontend/src/pages/TokenStats.jsx`
- `frontend/src/pages/StagePage.jsx`

---

## 🔗 GitHub 链接

- **Issues**: https://github.com/bxy3045134656/agent_company/issues
- **PRs**: https://github.com/bxy3045134656/agent_company/pulls

---

*创建时间：2026-03-17*  
*维护者：白小白 🌸*
