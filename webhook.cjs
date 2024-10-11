const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");
const util = require("util");
const fs = require("fs");

const execPromise = util.promisify(exec);

const envPath = path.resolve(__dirname, "backend/.env.production");
dotenv.config({ path: envPath });

const logFile = path.join(__dirname, "logs", "all_processes.log");

function log(message, type = "INFO") {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(logMessage.trim());
}

log("GITHUB_WEBHOOK_SECRET: " + process.env.GITHUB_WEBHOOK_SECRET);
log("Current working directory: " + process.cwd());
log("PATH: " + process.env.PATH);

const app = express();
app.use(bodyParser.json());

const secret = process.env.GITHUB_WEBHOOK_SECRET;

function verifySignature(req, res, buf, encoding) {
  const signature = req.headers["x-hub-signature-256"];
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(buf, encoding);
  const digest = `sha256=${hmac.digest("hex")}`;
  if (signature !== digest) {
    throw new Error("Invalid signature");
  }
}

app.use(bodyParser.json({ verify: verifySignature }));

app.post("/food-ordering-system/webhook/", (req, res) => {
  log("Webhook received!");
  log("Headers: " + JSON.stringify(req.headers));
  log("Body: " + JSON.stringify(req.body));

  const startTime = Date.now();

  res.sendStatus(200);

  if (req.body.ref === "refs/heads/main") {
    const changedFiles = req.body.commits.flatMap((commit) => [
      ...commit.modified,
      ...commit.added,
      ...commit.removed,
    ]);
    const databaseChanged = changedFiles.some((file) =>
      file.startsWith("database/")
    );

    const projectRoot = "/var/www/suatkocar.dev/food-ordering-system";
    const frontendRoot = path.join(projectRoot, "frontend");

    let commands = ["git pull"];

    if (databaseChanged) {
      commands.push(
        "NODE_ENV=production node /var/www/suatkocar.dev/food-ordering-system/create-database.js"
      );
    }

    commands = commands.concat([
      "npm install",
      "npm run clean",
      "npm run build",
      "pm2 restart food-ordering-backend",
      "pm2 restart food-ordering-frontend",
      "sudo systemctl reload nginx",
    ]);

    (async () => {
      try {
        for (const command of commands) {
          log(`Executing: ${command}`);
          const isNpmInstall = command.trim().startsWith("npm install");
          const env = {
            ...process.env,
            PATH: `/usr/local/node-v22.2.0/bin:${process.env.PATH}:/usr/local/bin:/usr/bin:/bin:${projectRoot}/node_modules/.bin:${frontendRoot}/node_modules/.bin`,
          };

          if (isNpmInstall) {
            delete env.NODE_ENV;
          } else {
            env.NODE_ENV = "production";
          }

          const { stdout, stderr } = await execPromise(command, {
            cwd: command.includes("--prefix frontend")
              ? frontendRoot
              : projectRoot,
            env,
            maxBuffer: 1024 * 1024 * 10,
          });
          log("stdout: " + stdout);
          if (stderr) log("stderr: " + stderr, "ERROR");
        }
      } catch (error) {
        log("Error during execution: " + error, "ERROR");
        log("Error stack: " + error.stack, "ERROR");
      } finally {
        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const durationSec = (durationMs / 1000).toFixed(2);

        log(`Webhook Total processing time: ${durationSec} seconds`);
      }
    })();
  }
});

app.listen(3002, () => {
  log("Webhook listener is running on port 3002");
});
