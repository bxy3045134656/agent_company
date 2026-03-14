/**
 * 通知系统测试脚本
 * 用于测试 WebSocket 通知推送功能
 * 
 * 使用方法：node test-notifications.js
 */

const http = require('http');

const API_BASE = 'http://localhost:3001/api/v1';

/**
 * 发送 HTTP 请求
 */
function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(body));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * 创建测试通知
 */
async function createNotification(type, category, priority, title, message, data = {}) {
  try {
    const result = await request('POST', '/notifications', {
      type,
      category,
      priority,
      title,
      message,
      data
    });
    console.log('✅ 创建成功:', result.data.type, '-', result.data.message);
    return result.data;
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
    throw error;
  }
}

/**
 * 获取通知列表
 */
async function getNotifications(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const result = await request('GET', '/notifications' + (query ? '?' + query : ''));
    console.log(`📋 获取到 ${result.data.notifications.length} 条通知`);
    return result.data;
  } catch (error) {
    console.error('❌ 获取失败:', error.message);
    throw error;
  }
}

/**
 * 获取未读数量
 */
async function getUnreadCount() {
  try {
    const result = await request('GET', '/notifications/unread/count');
    console.log(`🔔 未读通知：${result.data.count}`);
    return result.data.count;
  } catch (error) {
    console.error('❌ 获取失败:', error.message);
    throw error;
  }
}

/**
 * 获取统计信息
 */
async function getStats() {
  try {
    const result = await request('GET', '/notifications/stats');
    console.log('📊 统计信息:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ 获取失败:', error.message);
    throw error;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始测试通知系统...\n');

  try {
    // 1. 测试创建 Dashboard 更新通知
    console.log('1️⃣ 创建 Dashboard 更新通知...');
    await createNotification(
      'dashboard_update',
      'dashboard',
      'normal',
      '数据更新',
      'Dashboard 实时数据已更新，查看最新统计信息',
      { metrics: { users: 100, tasks: 50, workflows: 10 } }
    );

    // 2. 测试创建 Forum 回复通知
    console.log('\n2️⃣ 创建 Forum 回复通知...');
    await createNotification(
      'forum_reply',
      'forum',
      'normal',
      '新回复',
      '有人在帖子 "Agent Company 项目讨论" 中回复了你',
      { postId: 1, replyId: 10, author: '白小白' }
    );

    // 3. 测试创建 Forum @提及通知
    console.log('\n3️⃣ 创建 Forum @提及通知...');
    await createNotification(
      'forum_mention',
      'forum',
      'high',
      '@提及',
      '白小白 在帖子中提到了你',
      { postId: 2, author: '白小白', content: '@小软 请查看这个任务' }
    );

    // 4. 测试创建 Monitor 告警通知
    console.log('\n4️⃣ 创建 Monitor 告警通知...');
    await createNotification(
      'monitor_alert',
      'monitor',
      'high',
      '服务告警',
      'Backend API 响应时间超过阈值 (500ms)',
      { service: 'backend', metric: 'response_time', value: 650, threshold: 500 }
    );

    // 5. 测试创建 Agent 状态更新
    console.log('\n5️⃣ 创建 Agent 状态更新...');
    await createNotification(
      'agent_status',
      'agent',
      'normal',
      '状态变更',
      '小软 已从 "空闲" 切换到 "工作中"',
      { agentId: 'xiaoruan', from: 'idle', to: 'working' }
    );

    // 6. 获取通知列表
    console.log('\n📋 获取通知列表...');
    await getNotifications({ limit: 10 });

    // 7. 获取未读数量
    console.log('\n🔔 获取未读数量...');
    await getUnreadCount();

    // 8. 获取统计信息
    console.log('\n📊 获取统计信息...');
    await getStats();

    console.log('\n✅ 所有测试完成！\n');
    console.log('📍 查看通知页面：http://localhost:3002/notifications');
    console.log('📍 WebSocket 连接：ws://localhost:3001/ws/notifications\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.log('\n💡 请确保后端服务已启动：npm run dev (backend)');
  }
}

// 运行测试
runTests();
