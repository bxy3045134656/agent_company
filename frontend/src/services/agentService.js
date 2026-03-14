import api from './api'

export const agentService = {
  // 获取所有 Agents
  async getAll(params = {}) {
    const response = await api.get('/v1/agents', { params })
    return response.data || []
  },

  // 获取单个 Agent
  async getById(id) {
    const response = await api.get(`/v1/agents/${id}`)
    return response.data
  },

  // 创建 Agent
  async create(data) {
    const response = await api.post('/v1/agents', data)
    return response.data
  },

  // 更新 Agent
  async update(id, data) {
    const response = await api.put(`/v1/agents/${id}`, data)
    return response.data
  },

  // 删除 Agent
  async delete(id) {
    const response = await api.delete(`/v1/agents/${id}`)
    return response.data
  },

  // 获取 Agent 统计
  async getStats(id) {
    const response = await api.get(`/v1/agents/${id}/stats`)
    return response.data
  },
}

export default agentService
