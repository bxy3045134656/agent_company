/**
 * Lazy Routes Configuration
 * 路由懒加载配置 - v4.0 性能优化
 */

import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// 加载占位符组件
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

// 懒加载页面组件
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Monitor = lazy(() => import('../pages/Monitor'));
const MemberList = lazy(() => import('../pages/MemberList'));
const MemberProfile = lazy(() => import('../pages/MemberProfile'));
const TaskList = lazy(() => import('../pages/TaskList'));
const WorkflowManagement = lazy(() => import('../pages/WorkflowManagement'));
const Finance = lazy(() => import('../pages/Finance'));
const TokenStats = lazy(() => import('../pages/TokenStats'));
const GitHubTasks = lazy(() => import('../pages/GitHubTasks'));
const Forum = lazy(() => import('../pages/Forum'));
const TrafficMonitor = lazy(() => import('../pages/TrafficMonitor'));
const AgentTrafficDetail = lazy(() => import('../pages/AgentTrafficDetail'));
const ChatPanel = lazy(() => import('../pages/ChatPanel'));

// 路由配置
export const lazyRoutes = [
  {
    path: '/dashboard',
    component: Dashboard,
    title: '仪表盘',
  },
  {
    path: '/monitor',
    component: Monitor,
    title: '监控面板',
  },
  {
    path: '/members',
    component: MemberList,
    title: '成员列表',
  },
  {
    path: '/members/:id',
    component: MemberProfile,
    title: '成员详情',
  },
  {
    path: '/tasks',
    component: TaskList,
    title: '任务管理',
  },
  {
    path: '/workflows',
    component: WorkflowManagement,
    title: '工作流管理',
  },
  {
    path: '/finance',
    component: Finance,
    title: '财务系统',
  },
  {
    path: '/token-stats',
    component: TokenStats,
    title: 'Token 统计',
  },
  {
    path: '/github-tasks',
    component: GitHubTasks,
    title: 'GitHub 任务',
  },
  {
    path: '/forum',
    component: Forum,
    title: '论坛社区',
  },
  {
    path: '/traffic',
    component: TrafficMonitor,
    title: '流量监控',
  },
  {
    path: '/traffic/agent/:agentId',
    component: AgentTrafficDetail,
    title: 'Agent 流量详情',
  },
  {
    path: '/chat',
    component: ChatPanel,
    title: '对话面板',
  },
];

// 包装懒加载组件
export const LazyComponent = ({ component: Component, ...props }) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component {...props} />
  </Suspense>
);

export default { lazyRoutes, LazyComponent, LoadingFallback };
