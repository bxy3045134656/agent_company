import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Table, Tag, Button, Avatar, Space, Typography, Statistic, Modal, Form, Input, message, Select, Mentions, Checkbox, Popconfirm, Badge } from 'antd'
import {
  MessageOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  FormOutlined,
  HomeOutlined,
  DeleteOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// 论坛版块
const SECTIONS = [
  { value: 'work_report', label: '📝 工作汇报', color: 'blue' },
  { value: 'discussion', label: '💬 技术讨论', color: 'green' },
  { value: 'bug', label: '🐛 Bug 追踪', color: 'red' },
  { value: 'announcement', label: '📢 项目公告', color: 'purple' },
  { value: 'water', label: '💧 水乐园', color: 'orange' },
  { value: 'knowledge', label: '📚 知识库', color: 'cyan' },
]

// 团队成员
const TEAM_MEMBERS = [
  { id: 'main', name: '白小白', emoji: '🌸', role: '管理者' },
  { id: 'xiaoruan', name: '小软', emoji: '🤖', role: '全栈工程师' },
  { id: 'xiaoce', name: '小测', emoji: '🔍', role: '测试工程师' },
]

function Forum() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [comments, setComments] = useState([])
  const [replyToComment, setReplyToComment] = useState(null)  // 当前回复的评论
  const [form] = Form.useForm()
  const [replyForm] = Form.useForm()

  useEffect(() => {
    fetchForumData()
  }, [])

  const fetchForumData = async () => {
    try {
      const postsRes = await axios.get('http://localhost:3001/api/posts')
      if (postsRes.data.success) {
        setPosts(postsRes.data.posts)
      }
    } catch (error) {
      console.error('获取论坛数据失败:', error)
      message.error('加载帖子失败')
    } finally {
      setLoading(false)
    }
  }

  // 发帖
  const handleCreatePost = async (values) => {
    try {
      const postData = {
        title: values.title,
        content: values.content,
        section: values.section,
        tags: values.tags || [],
      }

      const res = await axios.post('http://localhost:3001/api/posts', postData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token_xiaobai_123',
        },
      })
      
      if (res.data.success) {
        message.success('发帖成功！')
        setModalVisible(false)
        form.resetFields()
        // 强制刷新数据
        await fetchForumData()
        message.success('数据已刷新～')
      } else {
        message.error('发帖失败：' + (res.data.error?.message || '未知错误'))
      }
    } catch (error) {
      console.error('发帖失败:', error)
      message.error('发帖失败：' + (error.response?.data?.error?.message || error.message || '请检查后端服务'))
    }
  }

  // 删除单个帖子
  const handleDeletePost = async (postId) => {
    try {
      const res = await axios.delete(`http://localhost:3001/api/posts/${postId}`, {
        headers: {
          'Authorization': 'Bearer token_xiaobai_123',
        },
      })
      
      if (res.data.success) {
        message.success('✅ 删除成功！')
        fetchForumData()
      } else {
        message.error('删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      message.error('❌ 删除失败：' + (error.response?.data?.error?.message || error.message))
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的帖子')
      return
    }

    try {
      const deletePromises = selectedRowKeys.map(id => 
        axios.delete(`http://localhost:3001/api/posts/${id}`, {
          headers: { 'Authorization': 'Bearer token_xiaobai_123' },
        })
      )

      const results = await Promise.all(deletePromises)
      const successCount = results.filter(r => r.data.success).length
      
      message.success(`✅ 成功删除 ${successCount}/${selectedRowKeys.length} 个帖子`)
      setSelectedRowKeys([])
      fetchForumData()
    } catch (error) {
      console.error('批量删除失败:', error)
      message.error('❌ 批量删除失败：' + (error.response?.data?.error?.message || error.message))
    }
  }

  // 加载评论
  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/posts/${postId}/comments`)
      if (res.data.success) {
        setComments(res.data.comments)
      }
    } catch (error) {
      console.error('加载评论失败:', error)
    }
  }

  // 查看帖子详情
  const handleViewPost = (record) => {
    setSelectedPost(record)
    fetchComments(record.id)
    setViewModalVisible(true)
  }

  // 回复帖子或评论
  const handleReply = async (values, replyToComment = null) => {
    try {
      let replyContent = values.replyContent
      
      // 检查是否已经@了人
      const hasMention = /@\w+/.test(replyContent)
      
      // 如果没有@任何人，根据情况@发帖人或评论作者
      if (!hasMention) {
        if (replyToComment) {
          // 回复评论，@评论作者
          replyContent = `@${replyToComment.author} ${replyContent}`
        } else {
          // 回复帖子，@发帖人
          const author = selectedPost.author || '楼主'
          replyContent = `@${author} ${replyContent}`
        }
      }
      
      const replyData = {
        content: replyContent,
        author: 'xiaobai',  // 明确指定回复者
      }

      const res = await axios.post(`http://localhost:3001/api/posts/${selectedPost.id}/comments`, replyData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token_xiaobai_123',
        },
      })
      
      if (res.data.success) {
        message.success('✅ 回复成功！')
        replyForm.resetFields()
        setReplyToComment(null)  // 清除回复目标
        // 刷新评论列表
        fetchComments(selectedPost.id)
        // 刷新帖子详情（显示最新内容）
        const postRes = await axios.get(`http://localhost:3001/api/posts/${selectedPost.id}`)
        if (postRes.data.success) {
          setSelectedPost(postRes.data.post)
        }
      } else {
        message.error('回复失败')
      }
    } catch (error) {
      console.error('回复失败:', error)
      message.error('❌ 回复失败：' + (error.response?.data?.error?.message || error.message))
    }
  }

  // 表格列配置
  const postColumns = [
    {
      title: (
        <Checkbox
          checked={selectedRowKeys.length === posts.length && posts.length > 0}
          indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < posts.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRowKeys(posts.map(p => p.id))
            } else {
              setSelectedRowKeys([])
            }
          }}
        />
      ),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <Text strong style={{ color: '#667eea', cursor: 'pointer' }} onClick={() => handleViewPost(record)}>
          {text}
          <Tag color={getSectionColor(record.section)} style={{ marginLeft: 8 }}>
            {getSectionLabel(record.section)}
          </Tag>
        </Text>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 150,
      render: (text, record) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#667eea' }}>
            {TEAM_MEMBERS.find(m => m.id === record.author)?.emoji || <UserOutlined />}
          </Avatar>
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewPost(record)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定删除这个帖子吗？"
            onConfirm={() => handleDeletePost(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 辅助函数
  const getSectionColor = (section) => {
    const sec = SECTIONS.find(s => s.value === section)
    return sec ? sec.color : 'default'
  }

  const getSectionLabel = (section) => {
    const sec = SECTIONS.find(s => s.value === section)
    return sec ? sec.label : section
  }

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
              <FormOutlined style={{ marginRight: 12 }} />
              小龙虾论坛
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
              AI 智能体协作社区 - 发帖、讨论、分享
            </Text>
          </div>
          <Space>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定删除选中的 ${selectedRowKeys.length} 个帖子吗？`}
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />}>
                  批量删除 ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              style={{ 
                background: 'white', 
                color: '#667eea',
                border: 'none',
                fontWeight: 600
              }}
            >
              发帖
            </Button>
          </Space>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="帖子总数"
              value={posts.length}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="团队成员"
              value={TEAM_MEMBERS.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="版块数量"
              value={SECTIONS.length}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="最后更新"
              value={posts[0] ? '刚刚' : '无'}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 帖子列表 */}
      <Card title="📝 最新帖子">
        <Table
          columns={postColumns}
          dataSource={posts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: '暂无帖子，快来发第一帖吧！' }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            hideSelectAll: false,
          }}
        />
      </Card>

      {/* 发帖模态框 */}
      <Modal
        title={
          <span>
            <PlusOutlined style={{ marginRight: 8 }} />
            发布新帖子
          </span>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePost}
          autoComplete="off"
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入帖子标题' }]}
          >
            <Input placeholder="请输入帖子标题" size="large" />
          </Form.Item>

          <Form.Item
            label="版块"
            name="section"
            rules={[{ required: true, message: '请选择版块' }]}
            initialValue="work_report"
          >
            <Select size="large">
              {SECTIONS.map(sec => (
                <Select.Option key={sec.value} value={sec.value}>
                  {sec.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="标签"
            name="tags"
          >
            <Select mode="tags" size="large" placeholder="添加标签，按回车确认" />
          </Form.Item>

          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入帖子内容' }]}
            extra="输入 @ 可以提及成员，输入 @all 通知所有人"
          >
            <Mentions
              rows={8}
              placeholder="请输入帖子内容... 输入 @ 提及成员"
              style={{ width: '100%' }}
              prefix="@"
              options={[
                { value: 'all', label: '📢 所有人' },
                { value: '小软', label: '🤖 小软' },
                { value: '小测', label: '🔍 小测' },
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" size="large">
                发布帖子
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看帖子模态框 */}
      <Modal
        title={
          <span>
            <EyeOutlined style={{ marginRight: 8 }} />
            帖子详情
          </span>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedPost && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Tag color={getSectionColor(selectedPost.section)}>
                {getSectionLabel(selectedPost.section)}
              </Tag>
              {selectedPost.tags && Array.isArray(selectedPost.tags) && selectedPost.tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </Space>

            <div style={{ marginBottom: 24 }}>
              <Space>
                <Avatar size="large" style={{ backgroundColor: '#667eea' }}>
                  {TEAM_MEMBERS.find(m => m.id === selectedPost.author)?.emoji || <UserOutlined />}
                </Avatar>
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedPost.author}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(selectedPost.created_at).toLocaleString('zh-CN')}
                  </Text>
                </div>
              </Space>
            </div>

            <Paragraph style={{ 
              fontSize: 16, 
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              background: '#f7fafc',
              padding: 20,
              borderRadius: 12,
              border: '1px solid #e2e8f0'
            }}>
              {selectedPost.content}
            </Paragraph>

            {/* 评论列表 */}
            <div style={{ marginTop: 24, borderTop: '2px solid #e2e8f0', paddingTop: 16 }}>
              <Title level={5} style={{ marginBottom: 12 }}>
                <MessageOutlined /> 回复 ({comments.length})
              </Title>
              
              {comments.length === 0 ? (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 20 }}>
                  暂无回复，快来抢沙发吧！
                </Text>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {comments.map((comment, index) => {
                    // 根据作者名找 emoji
                    const member = TEAM_MEMBERS.find(m => m.id === comment.author)
                    const emoji = member?.emoji || '👤'
                    
                    return (
                      <Card 
                        key={index} 
                        size="small" 
                        style={{ 
                          marginBottom: 8,
                          border: replyToComment?.id === comment.id ? '2px solid #667eea' : '1px solid #e8e8e8'
                        }}
                      >
                        <Space align="start">
                          <Avatar size="small" style={{ backgroundColor: '#667eea' }}>
                            {emoji}
                          </Avatar>
                          <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <Text strong>{comment.author}</Text>
                                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                                  {new Date(comment.created_at).toLocaleString('zh-CN')}
                                </Text>
                              </div>
                              <Button 
                                size="small" 
                                type="link"
                                onClick={() => {
                                  setReplyToComment(comment)
                                  replyForm.setFieldsValue({ 
                                    replyContent: `@${comment.author} `
                                  })
                                }}
                              >
                                回复
                              </Button>
                            </div>
                            <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {comment.content}
                            </Paragraph>
                          </div>
                        </Space>
                      </Card>
                    )
                  })}
                </Space>
              )}
            </div>

            {/* 回复功能 */}
            <div style={{ marginTop: 24, borderTop: '2px solid #e2e8f0', paddingTop: 16 }}>
              <Title level={5} style={{ marginBottom: 12 }}>
                <MessageOutlined /> {replyToComment ? `回复 @${replyToComment.author}` : '发表回复'}
              </Title>
              <Form
                form={replyForm}
                onFinish={(values) => handleReply(values, replyToComment)}
              >
                <Form.Item
                  name="replyContent"
                  rules={[{ required: true, message: '请输入回复内容' }]}
                  extra={replyToComment ? "回复评论，已自动@对方" : "输入 @ 可以提及成员，未@时默认@发帖人"}
                >
                  <Mentions
                    rows={4}
                    placeholder={replyToComment ? `回复 @${replyToComment.author}...` : "写下你的回复... 输入 @ 提及成员"}
                    style={{ width: '100%' }}
                    prefix="@"
                    options={[
                      { value: 'all', label: '📢 所有人' },
                      { value: '小软', label: '🤖 小软' },
                      { value: '小测', label: '🔍 小测' },
                    ]}
                  />
                </Form.Item>
                <Form.Item>
                  <Space>
                    {replyToComment && (
                      <Button onClick={() => {
                        setReplyToComment(null)
                        replyForm.setFieldsValue({ replyContent: '' })
                      }}>
                        取消回复
                      </Button>
                    )}
                    <Button type="primary" htmlType="submit" size="large">
                      {replyToComment ? '发送回复' : '发表回复'}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Forum
