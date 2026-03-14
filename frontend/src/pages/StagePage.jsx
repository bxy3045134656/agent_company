/**
 * StagePage.jsx
 * 舞台系统页面 - 3D 展示所有 Agent 工作状态
 * @author 小软 🤖
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, Spin, Alert } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import StageScene from '../components/StageScene';
import stageService from '../services/stageService';

/**
 * StagePage - 舞台系统主页面
 */
const StagePage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    // 初始化加载 Agent 数据
    loadAgents();

    // 连接 WebSocket
    stageService.addListener(handleWebSocketMessage);
    stageService.connect();

    return () => {
      stageService.removeListener(handleWebSocketMessage);
      stageService.disconnect();
    };
  }, []);

  /**
   * 加载 Agent 数据
   */
  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await stageService.getAgents();
      setAgents(data);
    } catch (error) {
      console.error('❌ 加载 Agent 数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * WebSocket 消息处理
   * @param {Object} data - WebSocket 数据
   */
  const handleWebSocketMessage = (data) => {
    if (data.type === 'connected') {
      setWsConnected(true);
    } else if (data.type === 'disconnected') {
      setWsConnected(false);
    } else if (data.type === 'agent_update' || data.agents) {
      // 更新 Agent 数据
      setAgents(data.agents || data);
    }
  };

  /**
   * Agent 点击处理
   * @param {Object} agent - Agent 数据
   */
  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    console.log('👆 点击 Agent:', agent);
  };

  /**
   * 统计数据
   */
  const stats = {
    total: agents.length,
    working: agents.filter(a => a.status === 'working').length,
    idle: agents.filter(a => a.status === 'idle').length,
    error: agents.filter(a => a.status === 'error').length
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="加载舞台系统中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>
          🎭 Agent 舞台系统
        </h1>
        <p style={{ color: '#666' }}>
          实时 3D 展示所有 Agent 的工作状态
        </p>
      </div>

      {/* WebSocket 连接状态 */}
      <Alert
        message={wsConnected ? '✅ WebSocket 已连接' : '⚠️ WebSocket 未连接'}
        type={wsConnected ? 'success' : 'warning'}
        showIcon
        style={{ marginBottom: '24px' }}
      />

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Agent 总数"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="工作中"
              value={stats.working}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="空闲"
              value={stats.idle}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="异常"
              value={stats.error}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 3D 舞台场景 */}
      <Card
        title="🌟 舞台场景"
        extra={
          <Tag color={wsConnected ? 'green' : 'orange'}>
            {wsConnected ? '实时同步' : '离线模式'}
          </Tag>
        }
        style={{
          height: '600px',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <StageScene
          agents={agents}
          onAgentClick={handleAgentClick}
        />
      </Card>

      {/* Agent 详情面板 */}
      {selectedAgent && (
        <Card
          title={`📊 ${selectedAgent.name} - 详情`}
          onClose={() => setSelectedAgent(null)}
          style={{ marginTop: '24px' }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <p><strong>状态:</strong></p>
              <Tag color={
                selectedAgent.status === 'working' ? 'green' :
                selectedAgent.status === 'idle' ? 'orange' : 'red'
              }>
                {selectedAgent.statusText}
              </Tag>
            </Col>
            <Col span={8}>
              <p><strong>当前任务:</strong></p>
              <p>{selectedAgent.task || '暂无任务'}</p>
            </Col>
            <Col span={8}>
              <p><strong>进度:</strong></p>
              <p>{selectedAgent.progress || 0}%</p>
            </Col>
          </Row>
        </Card>
      )}

      {/* Agent 列表 */}
      <Card title="📋 Agent 列表" style={{ marginTop: '24px' }}>
        <Row gutter={16}>
          {agents.map(agent => (
            <Col span={8} key={agent.id} style={{ marginBottom: '16px' }}>
              <Card
                hoverable
                onClick={() => handleAgentClick(agent)}
                style={{
                  borderColor: agent.color,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: agent.color,
                      marginRight: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px'
                    }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0 }}>{agent.name}</h4>
                    <Tag
                      color={
                        agent.status === 'working' ? 'green' :
                        agent.status === 'idle' ? 'orange' : 'red'
                      }
                    >
                      {agent.statusText}
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default StagePage;
