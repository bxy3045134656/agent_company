/**
 * 环境变量初始化脚本
 * 首次启动时生成随机 JWT Secret
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ENV_PATH = path.join(__dirname, '.env')
const ENV_EXAMPLE_PATH = path.join(__dirname, '.env.example')

function generateSecret() {
  return crypto.randomBytes(32).toString('hex')
}

function initEnv() {
  // 检查 .env 是否存在
  if (!fs.existsSync(ENV_PATH)) {
    // 检查 .env.example 是否存在
    if (fs.existsSync(ENV_EXAMPLE_PATH)) {
      // 复制 .env.example 为 .env
      let envContent = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8')
      
      // 生成随机 JWT_SECRET
      const newSecret = generateSecret()
      envContent = envContent.replace(
        'JWT_SECRET=your-secret-key-change-in-production',
        `JWT_SECRET=${newSecret}`
      )
      
      // 写入 .env
      fs.writeFileSync(ENV_PATH, envContent, 'utf8')
      console.log('✅ .env 已创建，JWT Secret 已生成')
      console.log(`   JWT_SECRET: ${newSecret.substring(0, 8)}...`)
    }
  } else {
    // .env 已存在，检查 JWT_SECRET
    const envContent = fs.readFileSync(ENV_PATH, 'utf8')
    if (envContent.includes('your-secret-key-change-in-production')) {
      // 需要更新 JWT_SECRET
      let newContent = envContent.replace(
        /JWT_SECRET=.*/,
        `JWT_SECRET=${generateSecret()}`
      )
      fs.writeFileSync(ENV_PATH, newContent, 'utf8')
      console.log('✅ JWT Secret 已更新')
    } else {
      console.log('✅ JWT Secret 已配置')
    }
  }
}

// 运行
initEnv()