import { create } from 'zustand'
import taskService from '../services/taskService'

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  dataSource: 'openclaw', // 'openclaw' | 'local'

  // 加载所有任务
  fetchTasks: async (params = {}) => {
    // 默认使用 OpenClaw 数据源
    const fetchParams = { source: 'openclaw', ...params }
    
    set({ loading: true, error: null })
    try {
      const tasks = await taskService.getAll(fetchParams)
      set({ tasks, loading: false, dataSource: fetchParams.source })
    } catch (error) {
      console.warn('OpenClaw 获取失败，尝试本地数据:', error.message)
      // 降级：尝试从本地获取
      try {
        const localTasks = await taskService.getAll({ ...params, source: 'local' })
        set({ tasks: localTasks, loading: false, dataSource: 'local' })
      } catch (localError) {
        set({ error: localError.message, loading: false })
      }
    }
  },

  // 添加任务
  addTask: async (data) => {
    try {
      const newTask = await taskService.create(data)
      set((state) => ({ tasks: [newTask, ...state.tasks] }))
      return newTask
    } catch (error) {
      throw error
    }
  },

  // 更新任务
  updateTask: async (id, data) => {
    try {
      const updated = await taskService.update(id, data)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }))
      return updated
    } catch (error) {
      throw error
    }
  },

  // 更新任务状态
  updateTaskStatus: async (id, status, result = null) => {
    try {
      const updated = await taskService.updateStatus(id, status, result)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }))
      return updated
    } catch (error) {
      throw error
    }
  },

  // 分配任务
  assignTask: async (id, agentId) => {
    try {
      const updated = await taskService.assign(id, agentId)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }))
      return updated
    } catch (error) {
      throw error
    }
  },

  // 删除任务
  deleteTask: async (id) => {
    try {
      await taskService.delete(id)
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }))
    } catch (error) {
      throw error
    }
  },

  // 清除错误
  clearError: () => set({ error: null }),
}))

export default useTaskStore
