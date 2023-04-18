module.exports = {
  apps: [
    {
      name: "playwright-server",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      watch: true,
      ignore_watch: ["node_modules"],
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
