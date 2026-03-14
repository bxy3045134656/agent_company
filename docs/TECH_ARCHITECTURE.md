# 🏢 Agent Company - 技术架构文档

**版本**: v1.0  
**日期**: 2026-03-12  
**作者**: 小软 🤖  
**状态**: ✅ MVP 已完成

---

## 📋 目录

1. [项目概述](#1-项目概述)
2. [技术栈选择](#2-技术栈选择)
3. [系统架构](#3-系统架构)
4. [核心功能设计](#4-核心功能设计)
5. [API 接口设计](#5-接口设计)
6. [数据库设计](#6-数据库设计)
7. [可行性评估](#7-可行性评估)
8. [开发计划](#8-开发计划)

---

## 1. 项目概述

### 1.1 项目定位

**Agent Company** 是一个自动化的 AI 公司平台，能够：
- 🤖 自动化产出产品
- 📊 自动化运营
- 💰 自动化收入

### 1.2 核心价值

- **个人用户**: 自动化个人工作流，提高效率
- **小团队**: 自动化协作流程，减少沟通成本
- **企业**: 自动化业务流程，降低人力成本

### 1.3 灵感来源

- AutoFlow（个人工作流自动化平台）
- Zapier / Make（自动化工具）
- LangChain / AutoGen（Agent 框架）

---

## 2. 技术栈选择

### 2.1 后端架构

| 组件 | 技术选型 | 理由 |
|------|----------|------|
| **运行环境** | Node.js v24+ | 高性能、异步、生态丰富 |
| **Web 框架** | Express.js | 轻量、灵活、易上手 |
| **Agent 框架** | OpenClaw | 已有的 Agent 基础设施 |
| **任务队列** | Bull (Redis) | 可靠的异步任务处理 |
| **API 风格** | RESTful | 简单、通用、易集成 |

### 2.2 前端框架

| 组件 | 技术选型 | 理由 |
|------|----------|------|
| **框架** | React 18 | 组件化、生态好 |
| **UI 库** | Ant Design | 企业级、组件丰富 |
| **状态管理** | Zustand | 轻量、简单 |
| **构建工具** | Vite | 快速开发、热更新 |
| **移动端** | React Native | 跨平台、复用代码 |

### 2.3 数据库选择

| 用途 | 技术选型 | 理由 |
|------|----------|------|
| **主数据库** | PostgreSQL | 强大、可靠、支持 JSON |
| **缓存** | Redis | 高性能、支持数据结构 |
| **日志** | Elasticsearch | 全文搜索、分析能力强 |
| **文件存储** | MinIO / S3 | 对象存储、可扩展 |

### 2.4 AI 模型选择

| 用途 | 模型 | 提供商 |
|------|------|--------|
| **通用对话** | Qwen3.5-Plus | 百炼 |
| **代码生成** | Qwen-Coder | 百炼 |
| **图像生成** | DALL-E 3 | OpenAI |
| **语音合成** | Edge TTS | 微软 |
| **文本嵌入** | text-embedding-3 | OpenAI |

---

## 3. 系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                     用户层                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │ Web 前端 │  │ 移动端  │  │  API    │                 │
│  └────┬────┘  └────┬────┘  └────┬────┘                 │
└───────┼───────────┼───────────┼─────────────────────────┘
        │           │           │
┌───────▼───────────▼───────────▼─────────────────────────┐
│                     API 网关层                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Express.js + 认证 + 限流 + 日志                 │    │
│  └─────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                     业务逻辑层                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Agent 管理│ │ 任务调度 │ │ 工作流   │ │ 数据分  │  │
│  │          │ │          │ │ 引擎     │ │ 析       │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                     Agent 层                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 小后端   │ │ 小前端   │ │ 小测     │ │ 小市     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                     数据层                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │PostgreSQL│ │  Redis   │ │  MinIO   │ │  ES      │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 模块划分

| 模块 | 职责 | 负责人 |
|------|------|--------|
| **API 网关** | 路由、认证、限流 | 小后端 |
| **Agent 管理** | Agent 注册、配置、监控 | 小后端 |
| **任务调度** | 任务创建、分配、追踪 | 小后端 |
| **工作流引擎** | 流程定义、执行、优化 | 小后端 |
| **数据分析** | 统计、报表、可视化 | 小后端 + 小市 |
| **前端界面** | Dashboard、管理界面 | 小前端 |
| **测试监控** | 测试、质量、告警 | 小测 |

---

## 4. 核心功能设计

### 4.1 Agent 管理系统

**功能**:
- Agent 注册与配置
- Agent 能力描述
- Agent 状态监控
- Agent 性能统计

**API 设计**:
```javascript
POST   /api/agents           // 注册 Agent
GET    /api/agents           // 获取 Agent 列表
GET    /api/agents/:id       // 获取 Agent 详情
PUT    /api/agents/:id       // 更新 Agent 配置
DELETE /api/agents/:id       // 删除 Agent
GET    /api/agents/:id/stats // 获取 Agent 统计
```

### 4.2 任务调度系统

**功能**:
- 任务创建与分配
- 任务优先级管理
- 任务状态追踪
- 任务超时处理

**API 设计**:
```javascript
POST   /api/tasks            // 创建任务
GET    /api/tasks            // 获取任务列表
GET    /api/tasks/:id        // 获取任务详情
PUT    /api/tasks/:id/status // 更新任务状态
POST   /api/tasks/:id/assign // 分配任务
```

### 4.3 自动化工作流

**功能**:
- 工作流定义（JSON/YAML）
- 工作流执行引擎
- 条件分支处理
- 错误处理与重试

**工作流示例**:
```yaml
name: 日报自动生成
trigger: cron("0 18 * * *")
steps:
  - name: 收集任务
    agent: 小后端
    action: get_daily_tasks
  - name: 生成报告
    agent: 小测
    action: generate_report
  - name: 发布到论坛
    agent: 小前端
    action: post_to_forum
```

### 4.4 API 接口设计

**认证方式**: JWT Token

**统一响应格式**:
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2026-03-11T10:30:00Z"
}
```

**错误处理**:
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "任务不存在",
    "details": {}
  }
}
```

---

## 5. 数据库设计

### 5.1 核心表结构

#### agents 表
```sql
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  description TEXT,
  capabilities JSONB,
  status VARCHAR(20) DEFAULT 'active',
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### tasks 表
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  agent_id INTEGER REFERENCES agents(id),
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'normal',
  due_date TIMESTAMP,
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

#### workflows 表
```sql
CREATE TABLE workflows (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  definition JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### workflow_runs 表
```sql
CREATE TABLE workflow_runs (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflows(id),
  status VARCHAR(20) DEFAULT 'running',
  current_step INTEGER,
  result JSONB,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

## 6. 可行性评估

### 6.1 技术难度

| 模块 | 难度 | 说明 |
|------|------|------|
| Agent 管理 | 🟢 低 | 基于 OpenClaw，已有基础 |
| 任务调度 | 🟡 中 | 需要设计优先级和分配算法 |
| 工作流引擎 | 🟠 高 | 需要解析和执行工作流定义 |
| 数据分析 | 🟡 中 | 需要集成 BI 工具 |

### 6.2 开发周期

| 阶段 | 时间 | 内容 |
|------|------|------|
| MVP | 2 周 | 核心功能（Agent 管理 + 任务调度） |
| v1.0 | 4 周 | 工作流引擎 + 基础界面 |
| v1.5 | 6 周 | 数据分析 + 优化 |
| v2.0 | 8 周 | 移动端 + 高级功能 |

### 6.3 成本估算

| 项目 | 月成本 | 说明 |
|------|--------|------|
| 服务器 | ¥500 | 云服务器（2 核 4G） |
| 数据库 | ¥200 | RDS PostgreSQL |
| Redis | ¥100 | 缓存服务 |
| AI API | ¥1000 | 按使用量计费 |
| 存储 | ¥100 | 对象存储 |
| **总计** | **¥1900/月** | - |

---

## 7. 风险与挑战

### 7.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Agent 响应慢 | 用户体验差 | 添加超时和重试机制 |
| 工作流执行失败 | 任务中断 | 添加错误处理和回滚 |
| API 限流 | 服务不可用 | 添加缓存和降级 |

### 7.2 运营风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| AI 成本高 | 亏损 | 优化提示词，减少调用 |
| 用户少 | 无收入 | 早期免费，积累用户 |
| 竞争激烈 | 难获客 | 差异化定位 |

---

## 8. 开发计划

### 8.1 第一阶段（2 周）- MVP

**目标**: 核心功能可用

**任务**:
- [ ] 项目初始化
- [ ] Agent 管理 API
- [ ] 任务调度 API
- [ ] 基础前端界面
- [ ] 部署上线

### 8.2 第二阶段（2 周）- 工作流

**目标**: 工作流引擎可用

**任务**:
- [ ] 工作流定义格式
- [ ] 工作流执行引擎
- [ ] 条件分支处理
- [ ] 错误处理
- [ ] 工作流管理界面

### 8.3 第三阶段（2 周）- 优化

**目标**: 性能和体验优化

**任务**:
- [ ] 性能优化
- [ ] 数据分析
- [ ] 监控告警
- [ ] 文档完善

---

## 9. 下一步行动

### 小后端 ⚙️

1. ✅ 完成技术架构文档（今天）
2. ⏳ 创建项目骨架（明天）
3. ⏳ 实现 Agent 管理 API（后天）

### 需要协调

- 小市：提供市场需求详情
- 小前端：UI 设计稿
- 小测：测试用例

---

## 10. MVP 完成状态（2026-03-12）

### ✅ 已完成

**后端骨架**:
- ✅ Express.js 项目结构
- ✅ SQLite/PostgreSQL 双数据库支持
- ✅ Agent 管理 API（完整 CRUD + 统计）
- ✅ Task 管理 API（完整 CRUD + 状态更新 + 分配）
- ✅ Workflow 路由（占位）
- ✅ 数据库初始化脚本
- ✅ 健康检查 API

**API 测试**:
- ✅ GET /api/v1/agents - 获取 Agent 列表
- ✅ POST /api/v1/agents - 创建 Agent
- ✅ GET /api/v1/agents/:id/stats - 获取 Agent 统计
- ✅ GET /api/v1/tasks - 获取任务列表
- ✅ POST /api/v1/tasks - 创建任务
- ✅ PUT /api/v1/tasks/:id/status - 更新任务状态
- ✅ POST /api/v1/tasks/:id/assign - 分配任务

**数据库**:
- ✅ 4 张表：agents, tasks, workflows, workflow_runs
- ✅ 示例数据：3 个 Agents（小软、小市、小测）

### 📁 输出路径

- 后端代码：`projects/agent-company/backend/`
- 数据库：`projects/agent-company/backend/data/agent_company.db`
- 技术文档：`projects/agent-company/docs/TECH_ARCHITECTURE.md`

---

**文档状态**: ✅ v1.0 MVP 已完成  
**下次更新**: 前端开发完成后

---

*最后更新：2026-03-12 17:55*  
*作者：小软 🤖*
