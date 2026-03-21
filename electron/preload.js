/**
 * Electron Preload 脚本
 * 在渲染进程和主进程之间建立安全的通信桥梁
 */

const { contextBridge, ipcRenderer } = require('electron')

// 暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getPlatform: () => process.platform,
  
  // 监听主进程消息
  onMessage: (callback) => {
    ipcRenderer.on('message', (event, message) => callback(message))
  }
})