import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import Dashboard from './pages/Dashboard'
import MemberList from './pages/MemberList'
import TaskList from './pages/TaskList'
import Forum from './pages/Forum'
import Monitor from './pages/Monitor'
import Header from './components/Header'
import Sider from './components/Sider'

const { Content } = Layout

function App() {
  return (
    <HashRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider />
        <Layout>
          <Header />
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/members" element={<MemberList />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/monitor" element={<Monitor />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </HashRouter>
  )
}

export default App
