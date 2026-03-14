/**
 * 成员面板服务
 * 提供个人信息、状态管理、配置管理等 API 调用
 */

import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

/**
 * 获取成员详情
 */
export const getMemberDetail = async (id) => {
  const response = await axios.get(`${API_BASE}/agents/${id}`)
  return response.data
}

/**
 * 获取成员统计
 */
export const getMemberStats = async (id) => {
  const response = await axios.get(`${API_BASE}/agents/${id}/stats`)
  return response.data
}

/**
 * 更新成员状态
 */
export const updateMemberStatus = async (id, status) => {
  const response = await axios.put(`${API_BASE}/agents/${id}`, {
    status
  })
  return response.data
}

/**
 * 获取成员任务历史
 */
export const getMemberTasks = async (id, options = {}) => {
  const params = new URLSearchParams(options)
  const response = await axios.get(`${API_BASE}/agents/${id}/tasks?${params}`)
  return response.data
}

/**
 * 获取成员配置
 */
export const getMemberConfig = async (id) => {
  const response = await axios.get(`${API_BASE}/agents/${id}/config`)
  return response.data
}

/**
 * 更新成员配置
 */
export const updateMemberConfig = async (id, config) => {
  const response = await axios.put(`${API_BASE}/agents/${id}/config`, config)
  return response.data
}

/**
 * 获取工作效率统计
 */
export const getEfficiencyStats = async (id, timeRange = '7d') => {
  const response = await axios.get(`${API_BASE}/agents/${id}/efficiency?range=${timeRange}`)
  return response.data
}

/**
 * 获取工作时间统计
 */
export const getWorkTimeStats = async (id, date) => {
  const response = await axios.get(`${API_BASE}/agents/${id}/worktime?date=${date}`)
  return response.data
}

/**
 * 发送休息提醒
 */
export const sendRestReminder = async (id) => {
  const response = await axios.post(`${API_BASE}/agents/${id}/rest`)
  return response.data
}

/**
 * 更新工作模式
 */
export const updateWorkMode = async (id, mode) => {
  const response = await axios.put(`${API_BASE}/agents/${id}/mode`, { mode })
  return response.data
}

/**
 * 更新并发数
 */
export const updateConcurrency = async (id, concurrency) => {
  const response = await axios.put(`${API_BASE}/agents/${id}/concurrency`, { concurrency })
  return response.data
}

/**
 * 手动干预
 */
export const manualIntervention = async (id, action, params = {}) => {
  const response = await axios.post(`${API_BASE}/agents/${id}/intervene`, {
    action,
    params
  })
  return response.data
}

export default {
  getMemberDetail,
  getMemberStats,
  updateMemberStatus,
  getMemberTasks,
  getMemberConfig,
  updateMemberConfig,
  getEfficiencyStats,
  getWorkTimeStats,
  sendRestReminder,
  updateWorkMode,
  updateConcurrency,
  manualIntervention,
}
