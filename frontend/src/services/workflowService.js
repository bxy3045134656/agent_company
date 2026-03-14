import axios from 'axios'

const API_BASE = '/api/v1/workflows'

/**
 * 获取工作流列表
 * @param {Object} filters - 筛选条件
 * @param {string} filters.status - 状态筛选
 * @param {string} filters.owner - 负责人筛选
 * @param {string} filters.search - 搜索关键词
 */
export async function getWorkflows(filters = {}) {
  const response = await axios.get(API_BASE, { params: filters })
  return response.data
}

/**
 * 获取单个工作流详情
 * @param {string} id - 工作流 ID
 */
export async function getWorkflow(id) {
  const response = await axios.get(`${API_BASE}/${id}`)
  return response.data
}

/**
 * 创建工作流
 * @param {Object} data - 工作流数据
 */
export async function createWorkflow(data) {
  const response = await axios.post(API_BASE, data)
  return response.data
}

/**
 * 更新工作流
 * @param {string} id - 工作流 ID
 * @param {Object} data - 更新数据
 */
export async function updateWorkflow(id, data) {
  const response = await axios.put(`${API_BASE}/${id}`, data)
  return response.data
}

/**
 * 删除工作流
 * @param {string} id - 工作流 ID
 */
export async function deleteWorkflow(id) {
  const response = await axios.delete(`${API_BASE}/${id}`)
  return response.data
}

/**
 * 更新工作流状态
 * @param {string} id - 工作流 ID
 * @param {string} status - 新状态 (active/disabled)
 */
export async function updateWorkflowStatus(id, status) {
  const response = await axios.patch(`${API_BASE}/${id}/status`, { status })
  return response.data
}
