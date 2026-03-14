/**
 * Workflow 模型
 * 工作流定义和管理
 */

const { v4: uuidv4 } = require('uuid');

// 内存存储（后续可替换为数据库）
let workflows = [];

// 初始化示例数据
function initWorkflows() {
  workflows = [
    {
      id: uuidv4(),
      name: '内容发布工作流',
      description: '自动发布博客文章到多个平台',
      status: 'active',
      trigger: 'schedule',
      steps: [
        { id: 1, name: '内容审核', type: 'review', status: 'completed' },
        { id: 2, name: '格式转换', type: 'transform', status: 'pending' },
        { id: 3, name: '多平台发布', type: 'publish', status: 'pending' }
      ],
      owner: '白小白',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    },
    {
      id: uuidv4(),
      name: '代码审查工作流',
      description: '自动审查 PR 代码质量',
      status: 'active',
      trigger: 'webhook',
      steps: [
        { id: 1, name: '代码扫描', type: 'scan', status: 'completed' },
        { id: 2, name: '规范检查', type: 'lint', status: 'completed' },
        { id: 3, name: '生成报告', type: 'report', status: 'pending' }
      ],
      owner: '小软',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    },
    {
      id: uuidv4(),
      name: '测试自动化工作流',
      description: '自动执行测试用例并生成报告',
      status: 'disabled',
      trigger: 'manual',
      steps: [
        { id: 1, name: '环境准备', type: 'setup', status: 'pending' },
        { id: 2, name: '执行测试', type: 'test', status: 'pending' },
        { id: 3, name: '生成报告', type: 'report', status: 'pending' }
      ],
      owner: '小测',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    }
  ];
}

// 获取所有工作流
function getAllWorkflows(filters = {}) {
  let result = [...workflows];
  
  // 按状态筛选
  if (filters.status) {
    result = result.filter(w => w.status === filters.status);
  }
  
  // 按负责人筛选
  if (filters.owner) {
    result = result.filter(w => w.owner === filters.owner);
  }
  
  // 搜索
  if (filters.search) {
    const keyword = filters.search.toLowerCase();
    result = result.filter(w => 
      w.name.toLowerCase().includes(keyword) ||
      w.description.toLowerCase().includes(keyword)
    );
  }
  
  return result;
}

// 获取单个工作流
function getWorkflowById(id) {
  return workflows.find(w => w.id === id);
}

// 创建工作流
function createWorkflow(data) {
  const workflow = {
    id: uuidv4(),
    name: data.name,
    description: data.description || '',
    status: data.status || 'disabled',
    trigger: data.trigger || 'manual',
    steps: data.steps || [],
    owner: data.owner || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  };
  
  workflows.push(workflow);
  return workflow;
}

// 更新工作流
function updateWorkflow(id, data) {
  const index = workflows.findIndex(w => w.id === id);
  if (index === -1) {
    return null;
  }
  
  workflows[index] = {
    ...workflows[index],
    ...data,
    updatedAt: new Date().toISOString(),
    version: workflows[index].version + 1
  };
  
  return workflows[index];
}

// 删除工作流
function deleteWorkflow(id) {
  const index = workflows.findIndex(w => w.id === id);
  if (index === -1) {
    return false;
  }
  
  workflows.splice(index, 1);
  return true;
}

// 启用/禁用工作流
function toggleWorkflowStatus(id, status) {
  return updateWorkflow(id, { status });
}

module.exports = {
  initWorkflows,
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  toggleWorkflowStatus
};
