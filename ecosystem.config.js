module.exports = {
  apps: [
    {
      script: "./src/index.ts",
      watch: false,
      name: "skd",
      exec_mode: "cluster",
      instances: 2,
      autorestart: true,
    },
  ],

  deploy: {
    production: {
      user: "SSH_USERNAME",
      host: "SSH_HOSTMACHINE",
      ref: "origin/master",
      repo: "GIT_REPOSITORY",
      path: "DESTINATION_PATH",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
