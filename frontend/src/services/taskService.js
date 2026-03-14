import api from './api'

export const taskService = {
  // 获取所有任务
  async getAll(params = {}) {
    const response = await api.get('/v1/tasks', { params })
    return response.data || []
  },

  // 获取单个任务
  async getById(id) {
    const response = await api.get(`/v1/tasks/${id}`)
    return response.data
  },

  // 创建任务
  async create(data) {
    const response = await api.post('/v1/tasks', data)
    return response.data
  },

  // 更新任务
  async update(id, data) {
    const response = await api.put(`/v1/tasks/${id}`, data)
    return response.data
  },

  // 更新任务状态
  async updateStatus(id, status, result = null) {
    const response = await api.put(`/v1/tasks/${id}/status`, { status, result })
    return response.data
  },

  // 分配任务
  async assign(id, agentId) {
    const response = await api.post(`/v1/tasks/${id}/assign`, { agent_id: agentId })
    return response.data
  },

  // 删除任务
  async delete(id) {
    const response = await api.delete(`/v1/tasks/${id}`)
    return response.data
  },
}

export default taskService
