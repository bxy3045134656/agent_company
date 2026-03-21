import React, { useState, useEffect, useRef } from 'react'
import { Card, Input, Button, List, Avatar, Space, Typography, Select, Badge, Tooltip, Divider } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined, ReloadOutlined, SettingOutlined, ClearOutlined } from '@ant-design/icons'

const { Text, Title } = Typography
const { TextArea } = Input
const { Option } = Select

// 从环境变量读取 API 地址
const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost'
const API_PORT = import.meta.env.VITE_API_PORT || '3001'
const API_BASE = `${API_HOST}:${API_PORT}/api/v1`

/**
 * 对话面板组件
 * 与 OpenClaw Agent 通讯
 */
function ChatPanel() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('mama')
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(true)
  const messagesEndRef = useRef(null)

  // Agent 列表
  const agents = [
    { id: 'mama', name: '玛玛', emoji: '👩', role: '主助手' },
    { id: 'nuonuo', name: '诺诺', emoji: '🦞', role: '系统管理' },
    { id: 'mamameng', name: '码码', emoji: '🦀', role: '全栈开发' },
    { id: 'xiaoruan', name: '小软', emoji: '🤖', role: '全栈工程师' },
    { id: 'xiaoce', name: '小测', emoji: '🔍', role: '测试工程师' },
  ]

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      // 调用 Agent API
      const response = await fetch(`${API_BASE}/agents/${selectedAgent}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputValue,
          agentId: selectedAgent
        })
      })

      const data = await response.json()

      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response || data.message || '收到消息',
        agent: data.agent || selectedAgent,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('发送消息失败:', error)
      
      // 模拟回复（等 OpenClaw API 实现后移除）
      const mockReply = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `模拟回复：${inputValue}\n\n(当前 API 暂未实现，使用模拟数据)`,
        agent: selectedAgent,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, mockReply])
    } finally {
      setLoading(false)
    }
  }

  // 键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 清空对话
  const handleClear = () => {
    setMessages([])
  }

  // 切换 Agent
  const handleAgentChange = (agentId) => {
    setSelectedAgent(agentId)
    // 添加系统提示
    const agent = agents.find(a => a.id === agentId)
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'system',
      content: `已切换到 ${agent?.emoji} ${agent?.name}`,
      timestamp: new Date().toISOString()
    }])
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const currentAgent = agents.find(a => a.id === selectedAgent)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 200px)', minHeight: 500 }}>
      {/* 左侧 Agent 列表 */}
      <div style={{ width: 200, borderRight: '1px solid #f0f0f0', padding: '16px 0' }}>
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <Text strong>选择 Agent</Text>
        </div>
        <List
          dataSource={agents}
          renderItem={(agent) => (
            <List.Item
              onClick={() => handleAgentChange(agent.id)}
              style={{ 
                cursor: 'pointer', 
                padding: '12px 16px',
                background: selectedAgent === agent.id ? '#e6f7ff' : 'transparent'
              }}
            >
              <List.Item.Meta
                avatar={<Badge dot={agent.id === selectedAgent} offset={[-5, 30]}><Avatar>{agent.emoji}</Avatar></Badge>}
                title={agent.name}
                description={<Text type="secondary" style={{ fontSize: 12 }}>{agent.role}</Text>}
              />
            </List.Item>
          )}
        />
      </div>

      {/* 右侧对话区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 对话头部 */}
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <span style={{ fontSize: 24 }}>{currentAgent?.emoji}</span>
            <div>
              <Text strong>{currentAgent?.name}</Text>
              <br />
              <Badge status={connected ? 'success' : 'error'} text={connected ? '已连接' : '未连接'} />
            </div>
          </Space>
          <Space>
            <Tooltip title="刷新连接">
              <Button icon={<ReloadOutlined />} />
            </Tooltip>
            <Tooltip title="清空对话">
              <Button icon={<ClearOutlined />} onClick={handleClear} />
            </Tooltip>
          </Space>
        </div>

        {/* 消息列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16, background: '#fafafa' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 100 }}>
              <RobotOutlined style={{ fontSize: 48, color: '#ccc' }} />
              <p style={{ color: '#999', marginTop: 16 }}>开始与 {currentAgent?.name} 对话吧</p>
            </div>
          ) : (
            <List
              dataSource={messages}
              renderItem={(message) => (
                <List.Item style={{ border: 'none', padding: message.role === 'user' ? '8px 0' : '16px 0' }}>
                  <div style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' 
                  }}>
                    {message.role !== 'user' && (
                      <Avatar style={{ marginRight: 8 }}>{currentAgent?.emoji}</Avatar>
                    )}
                    <div style={{ 
                      maxWidth: '70%',
                      background: message.role === 'user' ? '#1890ff' : '#fff',
                      color: message.role === 'user' ? '#fff' : '#333',
                      padding: '12px 16px',
                      borderRadius: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{message.content}</div>
                      <Text style={{ 
                        fontSize: 11, 
                        opacity: 0.7,
                        display: 'block',
                        marginTop: 4,
                        color: message.role === 'user' ? 'rgba(255,255,255,0.8)' : '#999'
                      }}>
                        {formatTime(message.timestamp)}
                      </Text>
                    </div>
                    {message.role === 'user' && (
                      <Avatar style={{ marginLeft: 8, background: '#52c41a' }} icon={<UserOutlined />} />
                    )}
                  </div>
                </List.Item>
              )}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div style={{ padding: 16, borderTop: '1px solid #f0f0f0', background: '#fff' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`发送消息给 ${currentAgent?.name}...`}
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                按 Enter 发送，Shift + Enter 换行
              </Text>
              <Button 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={handleSend}
                loading={loading}
                disabled={!inputValue.trim()}
              >
                发送
              </Button>
            </div>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel