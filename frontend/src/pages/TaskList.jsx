import React, { useEffect, useState } from 'react'
import { Table, Tag, Space, Button, Modal, Form, Input, Select, message, Popconfirm, Alert, Row, Col, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, ReloadOutlined, CloudOutlined, DatabaseOutlined } from '@ant-design/icons'
import useTaskStore from '../store/taskStore'
import useAgentStore from '../store/agentStore'

const { TextArea } = Input

function TaskList() {
  const { tasks, loading, fetchTasks, addTask, updateTask, deleteTask, updateTaskStatus, dataSource } = useTaskStore()
  const { agents, fetchAgents } = useAgentStore()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [form] = Form.useForm()
  const [filterStatus, setFilterStatus] = useState(null)
  const [filterAgent, setFilterAgent] = useState(null)

  useEffect(() => {
    fetchTasks()
    fetchAgents()
  }, [])

  const handleAdd = () => {
    setEditingTask(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingTask(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteTask(id)
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingTask) {
        await updateTask(editingTask.id, values)
        message.success('更新成功')
      } else {
        await addTask(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchTasks()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleComplete = async (id) => {
    try {
      await updateTaskStatus(id, 'completed', { completedAt: new Date().toISOString() })
      message.success('任务已完成')
      fetchTasks()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      assigned: 'blue',
      in_progress: 'purple',
      completed: 'green',
      failed: 'red',
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: '待处理',
      assigned: '已分配',
      in_progress: '进行中',
      completed: '已完成',
      failed: '失败',
    }
    return texts[status] || status
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={priority === 'high' ? 'red' : priority === 'normal' ? 'blue' : 'gray'}>
          {priority === 'high' ? '高' : priority === 'normal' ? '中' : '低'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status !== 'completed' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleComplete(record.id)}
            >
              完成
            </Button>
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 数据源提示 */}
      {dataSource === 'openclaw' && (
        <Alert
          message="✅ 实时数据模式"
          description="当前显示的是从 OpenClaw 获取的真实任务数据"
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          icon={<CloudOutlined />}
        />
      )}

      {/* 筛选和控制面板 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space wrap>
              <Select
                placeholder="筛选状态"
                allowClear
                style={{ width: 120 }}
                onChange={setFilterStatus}
                options={[
                  { value: 'pending', label: '待处理' },
                  { value: 'assigned', label: '已分配' },
                  { value: 'in_progress', label: '进行中' },
                  { value: 'completed', label: '已完成' },
                ]}
              />
              <Select
                placeholder="筛选 Agent"
                allowClear
                style={{ width: 150 }}
                onChange={setFilterAgent}
                options={agents.map(a => ({ value: a.id, label: a.display_name }))}
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => fetchTasks({ status: filterStatus, agent_id: filterAgent })}
                loading={loading}
              >
                刷新
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新建任务
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="任务标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="任务描述" />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue="normal">
            <Select>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="normal">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="agent_id" label="分配给 Agent">
            <Select allowClear placeholder="选择 Agent">
              {agents.map((agent) => (
                <Select.Option key={agent.id} value={agent.id}>
                  {agent.display_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TaskList
