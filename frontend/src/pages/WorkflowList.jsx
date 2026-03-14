import React from 'react'
import { Empty, Button, Alert } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

function WorkflowList() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>工作流管理</h1>
        <Button type="primary" icon={<PlusOutlined />} disabled>
          新建工作流
        </Button>
      </div>

      <Alert
        message="工作流功能开发中"
        description="工作流功能将在下一阶段实现，包括工作流定义、执行引擎、条件分支等功能。"
        type="info"
        showIcon
        style={{ marginTop: 24 }}
      />

      <Empty
        description="暂无工作流"
        style={{ marginTop: 48 }}
      />
    </div>
  )
}

export default WorkflowList
