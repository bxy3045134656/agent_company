/**
 * LazyLoad Component
 * 懒加载组件 - 性能优化
 */

import React, { Suspense, lazy } from 'react'
import { Spin } from 'antd'

/**
 * 懒加载页面组件
 * @param {string} path - 组件路径
 * @param {string} name - 组件名称
 */
export function lazyLoad(path, name) {
  return lazy(() => import(`../pages/${path}`))
}

/**
 * 加载占位符
 */
export function LoadingFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <Spin size="large" tip="加载中..." />
    </div>
  )
}

/**
 * 懒加载路由配置
 */
export const lazyRoutes = {
  Dashboard: lazyLoad('Dashboard', 'Dashboard'),
  Monitor: lazyLoad('Monitor', 'Monitor'),
  MemberList: lazyLoad('MemberList', 'MemberList'),
  MemberProfile: lazyLoad('MemberProfile', 'MemberProfile'),
  TaskList: lazyLoad('TaskList', 'TaskList'),
  WorkflowManagement: lazyLoad('WorkflowManagement', 'WorkflowManagement'),
  Finance: lazyLoad('Finance', 'Finance'),
  TokenStats: lazyLoad('TokenStats', 'TokenStats'),
  GitHubTasks: lazyLoad('GitHubTasks', 'GitHubTasks'),
}

export default { lazyLoad, LoadingFallback, lazyRoutes }
