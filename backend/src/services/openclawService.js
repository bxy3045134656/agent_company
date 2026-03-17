const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class OpenClawService {
  constructor() { this.cache = null; this.cacheTime = 0; this.cacheTTL = 30000; }
  async getSessions() {
    if (this.cache && Date.now() - this.cacheTime < this.cacheTTL) { console.log('[OpenClaw] 使用缓存数据'); return { success: true, data: this.cache, cached: true }; }
    try {
      console.log('[OpenClaw] 尝试获取会话列表...');
      const openclawCmd = 'D:\\openclaw\\bin\\node_modules\\.bin\\openclaw.cmd';
      const { stdout, stderr } = await execPromise('"' + openclawCmd + '" sessions list --json', { timeout: 5000, encoding: 'utf8', maxBuffer: 1024 * 1024 });
      if (stderr) console.warn('[OpenClaw] warning:', stderr);
      let data = [];
      try { const parsed = JSON.parse(stdout); data = parsed.sessions || parsed; } catch (e) { console.error('[OpenClaw] JSON 解析失败:', e.message); data = []; }
      if (data && data.length > 0) { this.cache = data; this.cacheTime = Date.now(); console.log('[OpenClaw] 获取成功，' + data.length + ' 个会话'); return { success: true, data: data, cached: false }; }
      console.log('[OpenClaw] 返回空数据，使用降级方案');
    } catch (error) { console.error('[OpenClaw] getSessions failed:', error.message); }
    const fallbackAgents = [
      { key: 'agent:main:main', name: 'main', display_name: '白小白 🌸', status: 'active', channel: 'qqbot', kind: 'main', updatedAt: new Date().toISOString() },
      { key: 'agent:xiaoruan:main', name: 'xiaoruan', display_name: '小软 🤖', status: 'active', channel: 'qqbot', kind: 'agent', updatedAt: new Date().toISOString() },
      { key: 'agent:xiaoce:main', name: 'xiaoce', display_name: '小测 🔍', status: 'active', channel: 'qqbot', kind: 'agent', updatedAt: new Date().toISOString() }
    ];
    const resultData = this.cache || fallbackAgents;
    return { success: this.cache !== null, error: this.cache ? null : '使用降级数据', data: resultData, fallback: !this.cache };
  }
  transformSessionsToAgents(sessions) {
    if (!sessions || sessions.length === 0) return [];
    return sessions.map(session => {
      let name = 'unknown', displayName = '未知', kind = 'agent';
      if (session.key) {
        const parts = session.key.split(':');
        if (parts.length >= 3) {
          const sessionId = parts[2];
          if (sessionId === 'main') { name = 'main'; displayName = '白小白 🌸'; kind = 'main'; }
          else if (sessionId === 'cron') { name = 'cron-' + parts[3].substring(0,8); displayName = '定时任务 🔔'; kind = 'cron'; }
          else if (sessionId === 'qqbot') { name = 'qqbot'; displayName = 'QQ 机器人 🤖'; kind = 'bot'; }
        }
      }
      let status = 'active';
      if (session.status) status = session.status;
      else if (kind === 'main') status = 'active';
      else if (kind === 'cron') status = 'busy';
      return { id: name, name: name, display_name: displayName, status: status, source: 'openclaw', session_key: session.key, channel: session.channel || 'qqbot', kind: kind, updatedAt: session.updatedAt || new Date().toISOString() };
    });
  }
  clearCache() { this.cache = null; this.cacheTime = 0; console.log('[OpenClaw] 缓存已清理'); }
}
module.exports = new OpenClawService();