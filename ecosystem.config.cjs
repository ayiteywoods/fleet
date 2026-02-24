/**
 * PM2 ecosystem config for NeraFleet on low-memory servers.
 * Use: pm2 start ecosystem.config.cjs
 *
 * - Single instance (no -i 2) to avoid doubling memory use.
 * - node_args limits Node heap so the process is less likely to be OOM-killed.
 */
module.exports = {
  apps: [
    {
      name: 'fleet-app',
      cwd: __dirname,
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--max-old-space-size=1536',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '1600M',
    },
  ],
};
