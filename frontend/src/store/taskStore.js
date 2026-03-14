import { create } from 'zustand'
import taskService from '../services/taskService'

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  // 加载所有任务
  fetchTasks: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const tasks = await taskService.getAll(params)
      set({ tasks, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
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
