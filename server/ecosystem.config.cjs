// PM2 Ecosystem Configuration for Production
// Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: "amadewi-api",
      script: "dist/index.js",
      cwd: "/var/www/amadewitransport/server",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // NOTE: Set these on the VPS directly via `pm2 env` or `.env` — NEVER commit secrets
        // DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_ANON_KEY,
        // JWT_SECRET, IPINFO_TOKEN
      },
      // Auto-restart if it crashes
      autorestart: true,
      // Wait 5s before restart
      restart_delay: 5000,
      // Max 10 restarts in 60s window — prevents infinite crash loops
      max_restarts: 10,
      min_uptime: "60s",
      // Logging
      error_file: "/var/www/amadewitransport/logs/pm2-error.log",
      out_file: "/var/www/amadewitransport/logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // Memory limit
      max_memory_restart: "512M",
      // Watch is disabled for production
      watch: false,
    },
  ],
};
