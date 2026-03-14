import React, { useEffect, useState } from 'react'
import { 
  Card, Table, Tag, Button, Space, Typography, Modal, Form, Input, 
  Select, Descriptions, message, Popconfirm, Row, Col, Badge, Divider,
  Empty, Tooltip
} from 'antd'
import {
  AppstoreOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons'
import * as workflowService from '../services/workflowService'

const { Title, Text } = Typography
const { TextArea } = Input

// 工作流状态配置
const STATUS_CONFIG = {
  active: { color: 'success', text: '运行中', icon: <CheckCircleOutlined /> },
  disabled: { color: 'default', text: '已禁用', icon: <CloseCircleOutlined /> },
}

// 触发类型配置
const TRIGGER_CONFIG = {
  schedule: { text: '定时触发', color: 'blue' },
  webhook: { text: 'Webhook 触发', color: 'purple' },
  manual: { text: '手动触发', color: 'orange' },
}

function WorkflowList() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [form] = Form.useForm()
  const [filters, setFilters] = useState({})
  const [searchText, setSearchText] = useState('')

  // 加载工作流列表
  const loadWorkflows = async (filterParams = {}) => {
    setLoading(true)
    try {
      const result = await workflowService.getWorkflows(filterParams)
      if (result.success) {
        setWorkflows(result.data)
      }
    } catch (error) {
      message.error('加载工作流列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflows(filters)
  }, [filters])

  // 搜索
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchText }))
  }

  // 状态筛选
  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status: status || undefined }))
  }

  // 负责人筛选
  const handleOwnerFilter = (owner) => {
    setFilters(prev => ({ ...prev, owner: owner || undefined }))
  }

  // 查看详情
  const handleViewDetail = async (record) => {
    try {
      const result = await workflowService.getWorkflow(record.id)
      if (result.success) {
        setSelectedWorkflow(result.data)
        setDetailModalVisible(true)
      }
    } catch (error) {
      message.error('获取工作流详情失败')
    }
  }

  // 创建工作流
  const handleCreate = () => {
    form.resetFields()
    setCreateModalVisible(true)
  }

  const handleCreateSubmit = async (values) => {
    try {
      const result = await workflowService.createWorkflow(values)
      if (result.success) {
        message.success('工作流创建成功')
        setCreateModalVisible(false)
        loadWorkflows(filters)
      }
    } catch (error) {
      message.error('创建工作流失败')
    }
  }

  // 编辑工作流
  const handleEdit = async (record) => {
    try {
      const result = await workflowService.getWorkflow(record.id)
      if (result.success) {
        setSelectedWorkflow(result.data)
        form.setFieldsValue(result.data)
        setEditModalVisible(true)
      }
    } catch (error) {
      message.error('获取工作流详情失败')
    }
  }

  const handleEditSubmit = async (values) => {
    try {
      const result = await workflowService.updateWorkflow(selectedWorkflow.id, values)
      if (result.success) {
        message.success('工作流更新成功')
        setEditModalVisible(false)
        loadWorkflows(filters)
      }
    } catch (error) {
      message.error('更新工作流失败')
    }
  }

  // 删除工作流
  const handleDelete = async (id) => {
    try {
      const result = await workflowService.deleteWorkflow(id)
      if (result.success) {
        message.success('工作流删除成功')
        loadWorkflows(filters)
      }
    } catch (error) {
      message.error('删除工作流失败')
    }
  }

  // 切换状态
  const handleToggleStatus = async (record) => {
    const newStatus = record.status === 'active' ? 'disabled' : 'active'
    try {
      const result = await workflowService.updateWorkflowStatus(record.id, newStatus)
      if (result.success) {
        message.success(`工作流已${newStatus === 'active' ? '启用' : '禁用'}`)
        loadWorkflows(filters)
      }
    } catch (error) {
      message.error('更新状态失败')
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text, record) => (
        <Space>
          <AppstoreOutlined style={{ color: '#667eea', fontSize: 18 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = STATUS_CONFIG[status]
        return (
          <Badge 
            color={config.color} 
            text={config.text}
            icon={config.icon}
          />
        )
      },
    },
    {
      title: '触发方式',
      dataIndex: 'trigger',
      key: 'trigger',
      width: 120,
      render: (trigger) => (
        <Tag color={TRIGGER_CONFIG[trigger]?.color}>
          {TRIGGER_CONFIG[trigger]?.text}
        </Tag>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 100,
      render: (owner) => (
        <Space>
          <AppstoreOutlined />
          {owner}
        </Space>
      ),
    },
    {
      title: '步骤数',
      dataIndex: 'steps',
      key: 'steps',
      width: 80,
      render: (steps) => `${steps?.length || 0} 个`,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '禁用' : '启用'}>
            <Button 
              type="text" 
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个工作流吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="text" 
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 唯一的负责人列表（用于筛选）
  const owners = [...new Set(workflows.map(w => w.owner))]

  return (
    <div>
      {/* 头部 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        margin: '-24px -24px 24px -24px', 
        padding: '48px 24px', 
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 24px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
              <AppstoreOutlined style={{ marginRight: 12 }} />
              工作流管理
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
              创建、编辑和管理工作流自动化任务
            </Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            style={{ background: 'white', color: '#667eea', border: 'none' }}
          >
            新建工作流
          </Button>
        </div>
      </div>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Input
            placeholder="搜索工作流名称或描述"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
          />
          <Select
            placeholder="按状态筛选"
            style={{ width: 150 }}
            allowClear
            onChange={handleStatusFilter}
          >
            <Select.Option value="active">运行中</Select.Option>
            <Select.Option value="disabled">已禁用</Select.Option>
          </Select>
          <Select
            placeholder="按负责人筛选"
            style={{ width: 150 }}
            allowClear
            onChange={handleOwnerFilter}
          >
            {owners.map(owner => (
              <Select.Option key={owner} value={owner}>{owner}</Select.Option>
            ))}
          </Select>
          <Button icon={<FilterOutlined />} onClick={() => setFilters({})}>
            重置筛选
          </Button>
        </Space>
      </Card>

      {/* 工作流列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={workflows}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个工作流`,
          }}
          locale={{
            emptyText: (
              <Empty 
                description="暂无工作流" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* 创建工作流模态框 */}
      <Modal
        title={<><PlusOutlined /> 创建工作流</>}
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubmit}
        >
          <Form.Item
            name="name"
            label="工作流名称"
            rules={[{ required: true, message: '请输入工作流名称' }]}
          >
            <Input placeholder="例如：内容发布工作流" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea 
              rows={3} 
              placeholder="描述工作流的功能和用途"
            />
          </Form.Item>
          
          <Form.Item
            name="owner"
            label="负责人"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select placeholder="选择负责人">
              <Select.Option value="白小白">白小白</Select.Option>
              <Select.Option value="小软">小软</Select.Option>
              <Select.Option value="小测">小测</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="trigger"
            label="触发方式"
            initialValue="manual"
          >
            <Select>
              <Select.Option value="manual">手动触发</Select.Option>
              <Select.Option value="schedule">定时触发</Select.Option>
              <Select.Option value="webhook">Webhook 触发</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            initialValue="disabled"
          >
            <Select>
              <Select.Option value="active">运行中</Select.Option>
              <Select.Option value="disabled">已禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑工作流模态框 */}
      <Modal
        title={<><EditOutlined /> 编辑工作流</>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          initialValues={selectedWorkflow}
        >
          <Form.Item
            name="name"
            label="工作流名称"
            rules={[{ required: true, message: '请输入工作流名称' }]}
          >
            <Input placeholder="工作流名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea 
              rows={3} 
              placeholder="描述工作流的功能和用途"
            />
          </Form.Item>
          
          <Form.Item
            name="owner"
            label="负责人"
          >
            <Select>
              <Select.Option value="白小白">白小白</Select.Option>
              <Select.Option value="小软">小软</Select.Option>
              <Select.Option value="小测">小测</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="trigger"
            label="触发方式"
          >
            <Select>
              <Select.Option value="manual">手动触发</Select.Option>
              <Select.Option value="schedule">定时触发</Select.Option>
              <Select.Option value="webhook">Webhook 触发</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
          >
            <Select>
              <Select.Option value="active">运行中</Select.Option>
              <Select.Option value="disabled">已禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title={<><EyeOutlined /> 工作流详情</>}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false)
              handleEdit(selectedWorkflow)
            }}
          >
            编辑
          </Button>,
        ]}
        width={800}
      >
        {selectedWorkflow && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="工作流名称">
                <Space>
                  <AppstoreOutlined style={{ color: '#667eea' }} />
                  <strong>{selectedWorkflow.name}</strong>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="描述">{selectedWorkflow.description}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge 
                  color={STATUS_CONFIG[selectedWorkflow.status].color} 
                  text={STATUS_CONFIG[selectedWorkflow.status].text}
                />
              </Descriptions.Item>
              <Descriptions.Item label="触发方式">
                <Tag color={TRIGGER_CONFIG[selectedWorkflow.trigger]?.color}>
                  {TRIGGER_CONFIG[selectedWorkflow.trigger]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="负责人">
                <Space>
                  <AppstoreOutlined />
                  {selectedWorkflow.owner}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="步骤数">{selectedWorkflow.steps?.length || 0} 个</Descriptions.Item>
              <Descriptions.Item label="版本号">v{selectedWorkflow.version}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(selectedWorkflow.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(selectedWorkflow.updatedAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>

            {selectedWorkflow.steps && selectedWorkflow.steps.length > 0 && (
              <>
                <Divider orientation="left">工作流步骤</Divider>
                <Table
                  dataSource={selectedWorkflow.steps}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '步骤 ID', dataIndex: 'id', key: 'id', width: 80 },
                    { title: '步骤名称', dataIndex: 'name', key: 'name' },
                    { 
                      title: '类型', 
                      dataIndex: 'type', 
                      key: 'type',
                      render: (type) => <Tag>{type}</Tag>
                    },
                    { 
                      title: '状态', 
                      dataIndex: 'status', 
                      key: 'status',
                      render: (status) => (
                        <Badge 
                          status={status === 'completed' ? 'success' : 'processing'} 
                          text={status === 'completed' ? '已完成' : '待处理'}
                        />
                      )
                    },
                  ]}
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default WorkflowList
