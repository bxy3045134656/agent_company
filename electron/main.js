/**
 * Agent Company - Electron 主进程
 * 桌面应用入口文件
 */

const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron')
const path = require('path')

// 保持全局引用，防止被垃圾回收
let mainWindow = null
let tray = null

// 开发模式判断
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Agent Company',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  })

  // 加载应用
  const startUrl = process.env.VITE_DEV_SERVER_URL || path.join(__dirname, '../dist/index.html')
  mainWindow.loadFile(startUrl)

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    console.log('Agent Company 已启动')
  })

  // 关闭时最小化到托盘
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  // 开发模式打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
}

// 创建系统托盘
function createTray() {
  // 创建托盘图标 - 使用程序生成的图标
  let trayIcon
  try {
    const iconPath = path.join(__dirname, 'assets', 'icon.png')
    trayIcon = nativeImage.createFromPath(iconPath)
    
    // 如果图标不存在或无效，创建空白图标
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty()
    }
  } catch (e) {
    trayIcon = nativeImage.createEmpty()
  }
  
  try {
    if (!trayIcon.isEmpty()) {
      tray = new Tray(trayIcon)
    
    // 创建托盘菜单
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '打开 Agent Company',
        click: () => {
          mainWindow.show()
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          app.isQuitting = true
          app.quit()
        }
      }
    ])
    
    tray.setToolTip('Agent Company')
    tray.setContextMenu(contextMenu)
    
    // 双击打开
    tray.on('double-click', () => {
      mainWindow.show()
    })
  } catch (e) {
    console.log('托盘图标不存在，跳过托盘创建')
  }
}

// 应用就绪
app.whenReady().then(() => {
  createWindow()
  createTray()
})

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// macOS 上点击 Dock 图标时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 应用退出前清理
app.on('before-quit', () => {
  app.isQuitting = true
})