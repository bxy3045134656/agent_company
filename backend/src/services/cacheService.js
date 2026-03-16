/**
 * Cache Service
 * 缓存服务 - 性能优化
 */

class CacheService {
  constructor() {
    this.cache = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 分钟
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   */
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} ttl - 过期时间（毫秒）
   */
  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    })
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    const now = Date.now()
    let valid = 0
    let expired = 0

    this.cache.forEach((item) => {
      if (now > item.expiry) {
        expired++
      } else {
        valid++
      }
    })

    return { valid, expired, total: valid + expired }
  }
}

// 导出单例
module.exports = new CacheService()
