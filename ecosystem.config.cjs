module.exports = {
  apps: [
    {
      name: "redis-server",
      script: "/usr/bin/redis-server",
      args: "/var/www/suatkocar.dev/food-ordering-system/backend/src/redis/redis.conf",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "food-ordering-backend",
      script: "dist/app.js",
      cwd: "/var/www/suatkocar.dev/food-ordering-system/backend",
      env: {
        NODE_ENV: "production",
      },
      env_file:
        "/var/www/suatkocar.dev/food-ordering-system/backend/.env.production",
      watch: false,
      autorestart: true,
    },
    {
      name: "food-ordering-frontend",
      script: "start.js",
      cwd: "/var/www/suatkocar.dev/food-ordering-system/frontend",
      env: {
        NODE_ENV: "production",
      },
      env_file:
        "/var/www/suatkocar.dev/food-ordering-system/frontend/.env.production",
      watch: false,
      autorestart: true,
    },
    {
      name: "webhook-listener",
      script: "webhook.cjs",
      cwd: "/var/www/suatkocar.dev/food-ordering-system",
      interpreter: "/usr/local/node-v22.2.0/bin/node",
      env: {
        NODE_ENV: "production",
        PATH: "/usr/local/node-v22.2.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin:/opt/jdk-22.0.1/bin:/var/www/suatkocar.dev/food-ordering-system/node_modules/.bin:/var/www/suatkocar.dev/food-ordering-system/frontend/node_modules/.bin:/var/www/suatkocar.dev/food-ordering-system/backend/node_modules/.bin",
      },
      env_file:
        "/var/www/suatkocar.dev/food-ordering-system/backend/.env.production",
      watch: false,
      autorestart: true,
    },
  ],
};
