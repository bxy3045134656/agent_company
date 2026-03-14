import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import Dashboard from './pages/Dashboard'
import MemberList from './pages/MemberList'
import MemberProfile from './pages/MemberProfile'
import TaskList from './pages/TaskList'
import Forum from './pages/Forum'
import Monitor from './pages/Monitor'
import StagePage from './pages/StagePage'
import WorkflowList from './pages/WorkflowList'
import NotificationsPage from './pages/NotificationsPage'
import IncomeStats from './pages/IncomeStats'
import CostCalculation from './pages/CostCalculation'
import ProfitAnalysis from './pages/ProfitAnalysis'
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
              <Route path="/members/:id" element={<MemberProfile />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/workflows" element={<WorkflowList />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/monitor" element={<Monitor />} />
              <Route path="/stage" element={<StagePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/finance/income" element={<IncomeStats />} />
              <Route path="/finance/cost" element={<CostCalculation />} />
              <Route path="/finance/profit" element={<ProfitAnalysis />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </HashRouter>
  )
}

export default App
