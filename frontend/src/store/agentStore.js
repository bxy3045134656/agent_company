import { create } from 'zustand'
import agentService from '../services/agentService'

const useAgentStore = create((set, get) => ({
  agents: [],
  loading: false,
  error: null,

  // 加载所有 Agents
  fetchAgents: async () => {
    set({ loading: true, error: null })
    try {
      const agents = await agentService.getAll()
      set({ agents, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // 添加 Agent
  addAgent: async (data) => {
    try {
      const newAgent = await agentService.create(data)
      set((state) => ({ agents: [newAgent, ...state.agents] }))
      return newAgent
    } catch (error) {
      throw error
    }
  },

  // 更新 Agent
  updateAgent: async (id, data) => {
    try {
      const updated = await agentService.update(id, data)
      set((state) => ({
        agents: state.agents.map((a) => (a.id === id ? updated : a)),
      }))
      return updated
    } catch (error) {
      throw error
    }
  },

  // 删除 Agent
  deleteAgent: async (id) => {
    try {
      await agentService.delete(id)
      set((state) => ({
        agents: state.agents.filter((a) => a.id !== id),
      }))
    } catch (error) {
      throw error
    }
  },

  // 清除错误
  clearError: () => set({ error: null }),
}))

export default useAgentStore
