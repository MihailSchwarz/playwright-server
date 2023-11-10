module.exports = {
  apps: [
    {
      name: "playwright-server",
      script: "server.js",
      // Опции
      autorestart: true, // Отключить автоперезапуск PM2
      cron_restart: "0 * * * *", // Запланировать перезапуск каждый час
      watch: true, // Если вам нужно, чтобы PM2 перезапускал приложение при изменении файлов
    },
  ],
};
