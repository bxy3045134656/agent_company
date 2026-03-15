import { useEffect, useRef, useState } from 'react'

/**
 * Dashboard WebSocket Hook
 * 用于仪表盘实时更新
 */
function useDashboardWebSocket(onUpdate) {
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const reconnectTimerRef = useRef(null)

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket('ws://localhost:3001/ws/dashboard')
        wsRef.current = ws

        ws.onopen = () => {
          console.log('✅ Dashboard WebSocket 已连接')
          setConnected(true)
          if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current)
            reconnectTimerRef.current = null
          }
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('📡 收到 Dashboard WebSocket 消息:', data)
            setLastMessage(data)
            
            // 调用回调函数处理更新
            if (onUpdate && typeof onUpdate === 'function') {
              onUpdate(data)
            }
          } catch (error) {
            console.error('❌ 解析 WebSocket 消息失败:', error)
          }
        }

        ws.onclose = () => {
          console.log('⚠️ Dashboard WebSocket 连接关闭')
          setConnected(false)
          // 3 秒后重连
          reconnectTimerRef.current = setTimeout(() => {
            console.log('🔄 尝试重新连接 Dashboard WebSocket...')
            connect()
          }, 3000)
        }

        ws.onerror = (error) => {
          console.error('❌ Dashboard WebSocket 错误:', error)
          setConnected(false)
        }
      } catch (error) {
        console.error('❌ 创建 WebSocket 连接失败:', error)
        // 失败后 3 秒重试
        reconnectTimerRef.current = setTimeout(() => {
          connect()
        }, 3000)
      }
    }

    connect()

    // 清理函数
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [onUpdate])

  return { connected, lastMessage }
}

export default useDashboardWebSocket
