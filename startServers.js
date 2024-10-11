import { exec } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

const envFile = path.resolve(__dirname, 'backend', `.env.${process.env.NODE_ENV || 'development'}`);
dotenv.config({ path: envFile });

function runScript(command, cwd) {
    return new Promise((resolve, reject) => {
        const process = exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${command}`, error);
                reject(error);
            }
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            resolve();
        });
    });
}

async function startServers() {
    const env = process.env.NODE_ENV || 'development';

    try {
        console.log(`Starting servers in ${env} mode...`);

        if (env === 'production') {
            console.log("Starting Redis with PM2...");
            await runScript('pm2 start /usr/bin/redis-server --name redis-server -- /var/www/suatkocar.dev/food-ordering-system/backend/src/redis/redis.conf');

            console.log("Starting backend with PM2...");
            await runScript('pm2 start app.js --name food-ordering-backend', path.resolve(__dirname, 'backend'));

            console.log("Starting frontend with PM2...");
            await runScript('pm2 start start.js --name food-ordering-frontend', path.resolve(__dirname, 'frontend'));

            console.log("Servers are running via PM2.");
        } else {
            console.log("Starting backend server in dev mode...");
            await runScript('npm run dev', path.resolve(__dirname, 'backend'));

            console.log("Starting frontend server in dev mode...");
            await runScript('npm run dev', path.resolve(__dirname, 'frontend'));
        }

        console.log("All servers are running.");
    } catch (error) {
        console.error("Error starting servers:", error);
    }
}

startServers();
