/** PM2 生产环境进程配置 */
module.exports = {
  apps: [
    {
      name: 'tarot-api',
      script: 'node_modules/.bin/tsx',
      args: 'server/index.ts',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      // 确保 PM2 加载 .env（与 dotenv 双保险）
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
