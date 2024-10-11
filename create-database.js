import { spawn } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from './logs/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, 'backend', `.env.${process.env.NODE_ENV || 'production'}`);
dotenv.config({ path: envPath });

function runScript(scriptPath) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn('python3', [scriptPath], {
            cwd: path.resolve(__dirname, 'database'),
            env: {
                ...process.env,
                DATABASE_HOST: process.env.DATABASE_HOST,
                DATABASE_USER: process.env.DATABASE_USER,
                DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
                DATABASE_NAME: process.env.DATABASE_NAME,
                DATABASE_PORT: process.env.DATABASE_PORT,
            }
        });

        childProcess.stdout.on('data', (data) => {
            log(`Python stdout: ${data}`, 'PYTHON');
        });

        childProcess.stderr.on('data', (data) => {
            log(`Python stderr: ${data}`, 'PYTHON_ERROR');
        });

        childProcess.on('error', (error) => {
            log(`Error: ${error.message}`, 'ERROR');
            reject(error);
        });

        childProcess.on('close', (code) => {
            log(`Child process exited with code ${code}`, 'INFO');
            if (code !== 0) {
                reject(new Error(`Script ${scriptPath} exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
}

async function main() {
    try {
        log(`Current working directory: ${process.cwd()}`);
        log("Environment variables:");
        log(`DATABASE_HOST: ${process.env.DATABASE_HOST}`);
        log(`DATABASE_USER: ${process.env.DATABASE_USER}`);
        log(`DATABASE_NAME: ${process.env.DATABASE_NAME}`);
        log(`DATABASE_PORT: ${process.env.DATABASE_PORT}`);

        log("Running 0-Create-Database.py...");
        await runScript('0-Create-Database.py');
        log("0-Create-Database.py completed successfully.");

        log("Running 1-Insert-Sample-Data-To-Database.py...");
        await runScript('1-Insert-Sample-Data-To-Database.py');
        log("1-Insert-Sample-Data-To-Database.py completed successfully.");
    } catch (error) {
        log(`An error occurred: ${error}`, 'ERROR');
    }
}

main();
