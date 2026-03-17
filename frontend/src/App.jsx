import React, { Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout, Spin } from 'antd'
import Header from './components/Header'
import Sider from './components/Sider'
import { lazyRoutes, LazyComponent } from './router/lazyRoutes'

const { Content } = Layout

// 加载占位符
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

function App() {
  return (
    <HashRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider />
        <Layout>
          <Header />
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                {lazyRoutes.map(route => (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={<LazyComponent component={route.component} />} 
                  />
                ))}
              </Routes>
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </HashRouter>
  )
}

export default App
