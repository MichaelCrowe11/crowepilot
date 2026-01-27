#!/usr/bin/env node
import {
  BANNER,
  CUSTODIAN_DEFAULT_MODEL,
  CUSTODIAN_DEFAULT_PORT,
  CUSTODIAN_LABEL,
  CUSTODIAN_LOG_DIR,
  CUSTODIAN_OLLAMA_URL,
  CUSTODIAN_PID_FILE,
  CUSTODIAN_SYSTEM_PROMPT,
  DEFAULT_AGENT,
  DEFAULT_MODEL,
  OPENCODE_CONFIG_DIR,
  OPENCODE_CONFIG_FILE,
  VERSION,
  buildRepoContext,
  chatCommand,
  ensureCustodianRunning,
  generateWithOllama,
  getCustodianConfigPaths,
  isCustodianHealthy,
  loadCustodianConfig,
  runCustodianRemote,
  runCustodianRequest,
  runWithTools,
  setCustodianConfigValue,
  stopCustodianRemote,
  writeCustodianConfig
} from "./chunk-ZDJC7QCH.js";

// src/index.ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk4 from "chalk";

// src/commands/init.ts
import chalk from "chalk";
import path from "path";
import fs from "fs/promises";
var DEFAULT_CONFIG = {
  $schema: "https://opencode.ai/config.json",
  model: DEFAULT_MODEL,
  default_agent: DEFAULT_AGENT,
  agent: {
    build: {
      description: "Full development access - can read, write, and execute code"
    },
    plan: {
      description: "Read-only analysis mode - explores and plans without making changes"
    }
  },
  permission: {
    edit: "ask",
    bash: "ask"
  }
};
var DEFAULT_CUSTODIAN_CONFIG = {
  model: CUSTODIAN_DEFAULT_MODEL,
  port: CUSTODIAN_DEFAULT_PORT,
  autostart: true,
  systemPrompt: CUSTODIAN_SYSTEM_PROMPT,
  ollamaBaseUrl: CUSTODIAN_OLLAMA_URL,
  contextMaxFiles: 200,
  contextMaxChars: 6e3
};
var initCommand = {
  command: "init",
  describe: "Initialize CrowePilot in current directory",
  builder: (yargs2) => yargs2.option("force", {
    alias: "f",
    type: "boolean",
    description: "Overwrite existing configuration",
    default: false
  }).option("minimal", {
    type: "boolean",
    description: "Create minimal configuration",
    default: false
  }),
  handler: async (argv) => {
    const cwd = process.cwd();
    const configDir = path.join(cwd, OPENCODE_CONFIG_DIR);
    const configFile = path.join(configDir, OPENCODE_CONFIG_FILE);
    console.log(chalk.cyan("\nInitializing CrowePilot...\n"));
    const configExists = await fs.access(configFile).then(() => true).catch(() => false);
    if (configExists && !argv.force) {
      console.log(chalk.yellow("CrowePilot already initialized in this directory."));
      console.log(chalk.dim("Use --force to overwrite existing configuration."));
      return;
    }
    await fs.mkdir(path.join(configDir, "agents"), { recursive: true });
    await fs.mkdir(path.join(configDir, "commands"), { recursive: true });
    const config = argv.minimal ? { $schema: "https://opencode.ai/config.json", model: DEFAULT_MODEL } : DEFAULT_CONFIG;
    await fs.writeFile(configFile, JSON.stringify(config, null, 2));
    console.log(chalk.green("\u2713"), "Created", chalk.dim(configFile));
    const custodianDir = path.join(cwd, ".crowepilot");
    const custodianConfigFile = path.join(custodianDir, "custodian.json");
    const custodianExists = await fs.access(custodianConfigFile).then(() => true).catch(() => false);
    if (!custodianExists) {
      await fs.mkdir(custodianDir, { recursive: true });
      await fs.writeFile(custodianConfigFile, JSON.stringify(DEFAULT_CUSTODIAN_CONFIG, null, 2));
      console.log(chalk.green("\u2713"), "Created", chalk.dim(custodianConfigFile));
    }
    const exampleAgent = `---
description: CrowePilot custom agent example
model: ${DEFAULT_MODEL}
---

You are a helpful coding assistant customized for this project.

## Project Context
- Read the README.md and key source files to understand the codebase
- Follow existing code style and patterns
- Prefer simple, readable solutions

## Guidelines
- Always explain your reasoning before making changes
- Run tests after making modifications
- Keep commits focused and well-documented
`;
    await fs.writeFile(path.join(configDir, "agents", "custom.md"), exampleAgent);
    console.log(chalk.green("\u2713"), "Created example agent", chalk.dim(".opencode/agents/custom.md"));
    const exampleCommand = `---
description: Run tests and show coverage
agent: build
---

Run the test suite with coverage reporting. Analyze any failures and suggest fixes.
`;
    await fs.writeFile(path.join(configDir, "commands", "test.md"), exampleCommand);
    console.log(
      chalk.green("\u2713"),
      "Created example command",
      chalk.dim(".opencode/commands/test.md")
    );
    const gitignorePath = path.join(cwd, ".gitignore");
    const gitignoreExists = await fs.access(gitignorePath).then(() => true).catch(() => false);
    if (gitignoreExists) {
      const content = await fs.readFile(gitignorePath, "utf-8");
      if (!content.includes(".opencode")) {
        await fs.writeFile(gitignorePath, content + "\n# OpenCode/CrowePilot\n.opencode/\n");
        console.log(chalk.green("\u2713"), "Updated", chalk.dim(".gitignore"));
      }
    }
    console.log();
    console.log(chalk.green("CrowePilot initialized successfully!"));
    console.log();
    console.log(chalk.dim("Next steps:"));
    console.log(chalk.dim("  1. Edit .opencode/opencode.json to customize settings"));
    console.log(chalk.dim("  2. Create custom agents in .opencode/agents/"));
    console.log(chalk.dim("  3. Create custom commands in .opencode/commands/"));
    console.log(chalk.dim("  4. Run 'crowepilot' to start coding"));
    console.log();
  }
};

// src/commands/config.ts
import chalk2 from "chalk";
import path2 from "path";
import os from "os";
import fs2 from "fs/promises";
import { spawn } from "child_process";
var GLOBAL_CONFIG_DIR = path2.join(os.homedir(), ".config", "opencode");
var GLOBAL_CONFIG_FILE = path2.join(GLOBAL_CONFIG_DIR, "opencode.json");
async function fileExists(filePath) {
  return fs2.access(filePath).then(() => true).catch(() => false);
}
async function readJsonFile(filePath) {
  const content = await fs2.readFile(filePath, "utf-8");
  return JSON.parse(content);
}
var configCommand = {
  command: "config <action> [key] [value]",
  describe: "Manage CrowePilot configuration",
  builder: (yargs2) => yargs2.positional("action", {
    describe: "Action to perform",
    choices: ["get", "set", "list", "path", "edit"],
    type: "string"
  }).positional("key", {
    describe: "Configuration key",
    type: "string"
  }).positional("value", {
    describe: "Configuration value",
    type: "string"
  }).option("global", {
    alias: "g",
    type: "boolean",
    description: "Use global configuration",
    default: false
  }),
  handler: async (argv) => {
    const {
      action,
      key,
      value,
      global: useGlobal
    } = argv;
    const configPath = useGlobal ? GLOBAL_CONFIG_FILE : path2.join(process.cwd(), OPENCODE_CONFIG_DIR, OPENCODE_CONFIG_FILE);
    switch (action) {
      case "path": {
        console.log(chalk2.cyan("Configuration paths:"));
        console.log();
        console.log(chalk2.dim("Global:"), GLOBAL_CONFIG_FILE);
        console.log(
          chalk2.dim("Local: "),
          path2.join(process.cwd(), OPENCODE_CONFIG_DIR, OPENCODE_CONFIG_FILE)
        );
        break;
      }
      case "list": {
        const exists = await fileExists(configPath);
        if (!exists) {
          console.log(chalk2.yellow(`No configuration file found at ${configPath}`));
          console.log(chalk2.dim("Run 'crowepilot init' to create one."));
          return;
        }
        const config = await readJsonFile(configPath);
        console.log(chalk2.cyan(`Configuration (${useGlobal ? "global" : "local"}):`));
        console.log();
        console.log(JSON.stringify(config, null, 2));
        break;
      }
      case "get": {
        if (!key) {
          console.error(chalk2.red("Error: key is required for 'get' action"));
          process.exit(1);
        }
        const exists = await fileExists(configPath);
        if (!exists) {
          console.log(chalk2.yellow(`No configuration file found at ${configPath}`));
          return;
        }
        const config = await readJsonFile(configPath);
        const keys = key.split(".");
        let result = config;
        for (const k of keys) {
          if (result && typeof result === "object" && k in result) {
            result = result[k];
          } else {
            console.log(chalk2.yellow(`Key '${key}' not found`));
            return;
          }
        }
        if (typeof result === "object") {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(result);
        }
        break;
      }
      case "set": {
        if (!key) {
          console.error(chalk2.red("Error: key is required for 'set' action"));
          process.exit(1);
        }
        if (value === void 0) {
          console.error(chalk2.red("Error: value is required for 'set' action"));
          process.exit(1);
        }
        const configDir = path2.dirname(configPath);
        await fs2.mkdir(configDir, { recursive: true });
        let config = {};
        const exists = await fileExists(configPath);
        if (exists) {
          config = await readJsonFile(configPath);
        }
        const keys = key.split(".");
        let current = config;
        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (!(k in current) || typeof current[k] !== "object") {
            current[k] = {};
          }
          current = current[k];
        }
        let parsedValue;
        try {
          parsedValue = JSON.parse(value);
        } catch {
          parsedValue = value;
        }
        current[keys[keys.length - 1]] = parsedValue;
        await fs2.writeFile(configPath, JSON.stringify(config, null, 2));
        console.log(chalk2.green("\u2713"), `Set ${key} = ${value}`);
        break;
      }
      case "edit": {
        const editor = process.env.EDITOR || "vim";
        const exists = await fileExists(configPath);
        if (!exists) {
          console.log(chalk2.yellow(`No configuration file found at ${configPath}`));
          console.log(chalk2.dim("Run 'crowepilot init' to create one."));
          return;
        }
        const proc = spawn(editor, [configPath], {
          stdio: "inherit"
        });
        await new Promise((resolve) => {
          proc.on("exit", () => resolve());
        });
        break;
      }
      default:
        console.error(chalk2.red(`Unknown action: ${action}`));
        process.exit(1);
    }
  }
};

// src/commands/custodian.ts
import chalk3 from "chalk";
import inquirer from "inquirer";
import fs4 from "fs/promises";
import path4 from "path";

// src/custodian/server.ts
import http from "http";
async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString("utf-8");
  if (!raw) return {};
  return JSON.parse(raw);
}
async function startCustodianServer(options = {}) {
  const { config } = await loadCustodianConfig({ repoRoot: options.repoRoot });
  const port = options.port ?? config.port;
  const server = http.createServer(async (req, res) => {
    try {
      if (!req.url) {
        res.writeHead(400);
        res.end("Missing URL");
        return;
      }
      if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "ok",
            model: options.model ?? config.model,
            repoRoot: options.repoRoot ?? config.repoRoot,
            port,
            uptime: process.uptime()
          })
        );
        return;
      }
      if (req.method === "POST" && req.url === "/run") {
        const payload = await readJsonBody(req);
        const repoRoot = payload.repoRoot || options.repoRoot || config.repoRoot;
        const model = payload.model || options.model || config.model;
        const systemPrompt = payload.systemPrompt || options.systemPrompt || config.systemPrompt;
        const includeContext = payload.includeContext ?? options.includeContext ?? true;
        const useTools = payload.useTools ?? options.useTools ?? false;
        const allowShell = payload.allowShell ?? options.allowShell ?? false;
        const allowDelete = payload.allowDelete ?? options.allowDelete ?? false;
        const allowNetwork = payload.allowNetwork ?? options.allowNetwork ?? false;
        const context = includeContext ? await buildRepoContext(repoRoot, {
          maxFiles: config.contextMaxFiles,
          maxChars: config.contextMaxChars
        }) : "";
        const prompt = payload.prompt?.trim() || "Provide an architectural review and optimization plan.";
        const composedPrompt = context ? `Context:
${context}

Request:
${prompt}` : prompt;
        const response = useTools ? await runWithTools({
          baseUrl: config.ollamaBaseUrl,
          model,
          prompt: composedPrompt,
          system: systemPrompt,
          repoRoot,
          allowShell,
          allowDelete,
          allowNetwork
        }) : await generateWithOllama({
          baseUrl: config.ollamaBaseUrl,
          model,
          prompt: composedPrompt,
          system: systemPrompt
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ response }));
        return;
      }
      if (req.method === "POST" && req.url === "/shutdown") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "shutting_down" }));
        server.close(() => process.exit(0));
        return;
      }
      res.writeHead(404);
      res.end("Not found");
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
  await new Promise((resolve) => {
    server.listen(port, () => resolve());
  });
  return { server, port };
}

// src/custodian/launchd.ts
import fs3 from "fs/promises";
import os2 from "os";
import path3 from "path";
import { spawn as spawn2 } from "child_process";
function getPlistPath() {
  return path3.join(os2.homedir(), "Library", "LaunchAgents", `${CUSTODIAN_LABEL}.plist`);
}
function buildPlist(args) {
  const programArgs = [
    args.nodePath,
    args.entryPath,
    "custodian",
    "serve",
    "--daemon",
    "--port",
    String(args.port)
  ];
  if (args.repoRoot) {
    programArgs.push("--repo", args.repoRoot);
  }
  if (args.model) {
    programArgs.push("--model", args.model);
  }
  const stdoutPath = path3.join(CUSTODIAN_LOG_DIR, "custodian.out.log");
  const stderrPath = path3.join(CUSTODIAN_LOG_DIR, "custodian.err.log");
  return {
    plist: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>${CUSTODIAN_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
      ${programArgs.map((arg) => `<string>${arg}</string>`).join("\n      ")}
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${stdoutPath}</string>
    <key>StandardErrorPath</key>
    <string>${stderrPath}</string>
  </dict>
</plist>
`,
    plistPath: getPlistPath(),
    stdoutPath,
    stderrPath
  };
}
async function runLaunchctl(args) {
  await new Promise((resolve, reject) => {
    const proc = spawn2("launchctl", args, { stdio: "inherit" });
    proc.on("exit", (code) => code === 0 ? resolve() : reject(new Error("launchctl failed")));
    proc.on("error", (err) => reject(err));
  });
}
async function installLaunchAgent(options) {
  const { plist, plistPath, stdoutPath, stderrPath } = buildPlist(options);
  await fs3.mkdir(path3.dirname(plistPath), { recursive: true });
  await fs3.mkdir(path3.dirname(stdoutPath), { recursive: true });
  await fs3.writeFile(plistPath, plist);
  try {
    await runLaunchctl(["unload", plistPath]);
  } catch {
  }
  await runLaunchctl(["load", "-w", plistPath]);
  return { plistPath, stdoutPath, stderrPath };
}
async function uninstallLaunchAgent() {
  const plistPath = getPlistPath();
  try {
    await runLaunchctl(["unload", plistPath]);
  } catch {
  }
  await fs3.rm(plistPath, { force: true });
  await fs3.rm(CUSTODIAN_PID_FILE, { force: true });
  return plistPath;
}
async function startLaunchAgent() {
  await runLaunchctl(["start", CUSTODIAN_LABEL]);
}
async function stopLaunchAgent() {
  await runLaunchctl(["stop", CUSTODIAN_LABEL]);
}
function getLaunchAgentPath() {
  return getPlistPath();
}

// src/commands/custodian.ts
var ACTIONS = [
  "run",
  "serve",
  "install",
  "uninstall",
  "start",
  "stop",
  "status",
  "config",
  "setup"
];
async function fileExists2(filePath) {
  try {
    await fs4.access(filePath);
    return true;
  } catch {
    return false;
  }
}
function parseValue(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
async function writePidFile() {
  await fs4.mkdir(path4.dirname(CUSTODIAN_PID_FILE), { recursive: true });
  await fs4.writeFile(CUSTODIAN_PID_FILE, String(process.pid));
}
async function removePidFile() {
  await fs4.rm(CUSTODIAN_PID_FILE, { force: true });
}
var custodianCommand = {
  command: "custodian <action> [prompt..]",
  describe: "Manage the CrowePilot custodian (Ollama resident architect)",
  builder: (yargs2) => yargs2.positional("action", {
    describe: "Action to perform",
    choices: ACTIONS,
    type: "string"
  }).positional("prompt", {
    describe: "Prompt to send to the custodian",
    type: "string",
    array: true
  }).option("model", {
    type: "string",
    description: "Ollama model to use"
  }).option("port", {
    type: "number",
    description: "Custodian service port"
  }).option("repo", {
    type: "string",
    description: "Repository root for context"
  }).option("system", {
    type: "string",
    description: "Override system prompt"
  }).option("context", {
    type: "boolean",
    description: "Include repo context",
    default: true
  }).option("daemon", {
    type: "boolean",
    description: "Run in daemon mode",
    default: false
  }).option("tools", {
    type: "boolean",
    description: "Enable XML tool runner for the custodian",
    default: false
  }).option("allow-shell", {
    type: "boolean",
    description: "Allow shell tool execution when tool runner is enabled",
    default: false
  }).option("allow-delete", {
    type: "boolean",
    description: "Allow delete_path tool execution when tool runner is enabled",
    default: false
  }).option("allow-network", {
    type: "boolean",
    description: "Allow network tools (http_get) when tool runner is enabled",
    default: false
  }).option("allow-all-tools", {
    type: "boolean",
    description: "Enable all tool permissions (shell, delete, network)",
    default: false
  }).option("scope", {
    type: "string",
    choices: ["merged", "global", "local"],
    default: "merged",
    description: "Config scope"
  }).option("key", {
    type: "string",
    description: "Config key (for config action)"
  }).option("value", {
    type: "string",
    description: "Config value (for config action)"
  }),
  handler: async (argv) => {
    const args = argv;
    const action = args.action;
    const repoRoot = args.repo;
    const scope = args.scope || "merged";
    const prompt = args.prompt?.join(" ");
    switch (action) {
      case "setup": {
        const { config } = await loadCustodianConfig({ repoRoot, scope });
        const defaultRepo = repoRoot || config.repoRoot || process.cwd();
        const targetScope = scope === "merged" ? "local" : scope;
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "repoRoot",
            message: "Repository root",
            default: defaultRepo
          },
          {
            type: "input",
            name: "model",
            message: "Ollama model",
            default: config.model
          },
          {
            type: "number",
            name: "port",
            message: "Custodian port",
            default: config.port
          },
          {
            type: "confirm",
            name: "autostart",
            message: "Autostart custodian with CrowePilot?",
            default: config.autostart
          },
          {
            type: "input",
            name: "ollamaBaseUrl",
            message: "Ollama base URL",
            default: config.ollamaBaseUrl
          },
          {
            type: "input",
            name: "systemPrompt",
            message: "System prompt",
            default: config.systemPrompt
          },
          {
            type: "number",
            name: "contextMaxFiles",
            message: "Max files for context",
            default: config.contextMaxFiles
          },
          {
            type: "number",
            name: "contextMaxChars",
            message: "Max chars for context",
            default: config.contextMaxChars
          }
        ]);
        const normalized = {
          model: answers.model,
          port: toNumber(answers.port, config.port),
          autostart: Boolean(answers.autostart),
          ollamaBaseUrl: answers.ollamaBaseUrl,
          systemPrompt: answers.systemPrompt,
          contextMaxFiles: toNumber(answers.contextMaxFiles, config.contextMaxFiles),
          contextMaxChars: toNumber(answers.contextMaxChars, config.contextMaxChars)
        };
        const targetPath = await writeCustodianConfig({
          repoRoot: answers.repoRoot,
          scope: targetScope,
          config: normalized
        });
        console.log(chalk3.green("\u2713"), "Custodian config updated");
        console.log(chalk3.dim(targetPath));
        return;
      }
      case "run": {
        const { config } = await loadCustodianConfig({ repoRoot, scope });
        const port = args.port ?? config.port;
        const model = args.model ?? config.model;
        const systemPrompt = args.system ?? config.systemPrompt;
        const includeContext = args.context ?? true;
        const useTools = args.tools ?? false;
        const allowAllTools = args.allowAllTools ?? false;
        const allowShell = allowAllTools || (args.allowShell ?? false);
        const allowDelete = allowAllTools || (args.allowDelete ?? false);
        const allowNetwork = allowAllTools || (args.allowNetwork ?? false);
        try {
          let response;
          if (await isCustodianHealthy(port)) {
            response = await runCustodianRemote({
              port,
              prompt,
              repoRoot: repoRoot || config.repoRoot,
              model,
              systemPrompt,
              includeContext,
              useTools,
              allowShell,
              allowDelete,
              allowNetwork
            });
          } else {
            response = await runCustodianRequest({
              prompt,
              repoRoot: repoRoot || config.repoRoot,
              model,
              systemPrompt,
              includeContext,
              useTools,
              allowShell,
              allowDelete,
              allowNetwork
            });
          }
          console.log(response);
          return;
        } catch (error) {
          console.error(chalk3.red("Custodian failed:"), error.message);
          console.error(chalk3.dim("Ensure Ollama is running (try: `ollama serve`)."));
          process.exit(1);
        }
        break;
      }
      case "serve": {
        const { config } = await loadCustodianConfig({ repoRoot, scope });
        const port = args.port ?? config.port;
        const model = args.model ?? config.model;
        const systemPrompt = args.system ?? config.systemPrompt;
        const includeContext = args.context ?? true;
        const useTools = args.tools ?? false;
        const allowAllTools = args.allowAllTools ?? false;
        const allowShell = allowAllTools || (args.allowShell ?? false);
        const allowDelete = allowAllTools || (args.allowDelete ?? false);
        const allowNetwork = allowAllTools || (args.allowNetwork ?? false);
        const { server } = await startCustodianServer({
          repoRoot: repoRoot || config.repoRoot,
          port,
          model,
          systemPrompt,
          includeContext,
          useTools,
          allowShell,
          allowDelete,
          allowNetwork
        });
        if (args.daemon) {
          await writePidFile();
        } else {
          console.log(chalk3.green("Custodian listening on"), chalk3.dim(`http://127.0.0.1:${port}`));
        }
        const shutdown = async () => {
          server.close();
          await removePidFile();
          process.exit(0);
        };
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
        return;
      }
      case "install": {
        if (process.platform !== "darwin") {
          console.error(chalk3.red("Launchd install is only supported on macOS."));
          process.exit(1);
        }
        const { config } = await loadCustodianConfig({ repoRoot, scope });
        const port = args.port ?? config.port;
        const model = args.model ?? config.model;
        const entryPath = process.argv[1] ? path4.resolve(process.argv[1]) : process.execPath;
        const { plistPath, stdoutPath, stderrPath } = await installLaunchAgent({
          nodePath: process.execPath,
          entryPath,
          repoRoot: repoRoot || config.repoRoot,
          model,
          port
        });
        console.log(chalk3.green("\u2713"), "Launch agent installed");
        console.log(chalk3.dim(plistPath));
        console.log(chalk3.dim("Logs:"), stdoutPath, stderrPath);
        return;
      }
      case "uninstall": {
        if (process.platform !== "darwin") {
          console.error(chalk3.red("Launchd uninstall is only supported on macOS."));
          process.exit(1);
        }
        const plistPath = await uninstallLaunchAgent();
        console.log(chalk3.green("\u2713"), "Launch agent removed");
        console.log(chalk3.dim(plistPath));
        return;
      }
      case "start": {
        if (process.platform === "darwin" && await fileExists2(getLaunchAgentPath())) {
          await startLaunchAgent();
          console.log(chalk3.green("\u2713"), "Custodian started via launchd");
          return;
        }
        const { config } = await loadCustodianConfig({ repoRoot, scope });
        const started = await ensureCustodianRunning({
          repoRoot: repoRoot || config.repoRoot,
          model: args.model ?? config.model,
          port: args.port ?? config.port
        });
        if (started) {
          console.log(chalk3.green("\u2713"), "Custodian started");
        } else {
          process.exit(1);
        }
        return;
      }
      case "stop": {
        if (process.platform === "darwin" && await fileExists2(getLaunchAgentPath())) {
          await stopLaunchAgent();
          console.log(chalk3.green("\u2713"), "Custodian stopped via launchd");
          return;
        }
        const { config } = await loadCustodianConfig({ repoRoot, scope });
        const port = args.port ?? config.port;
        await stopCustodianRemote(port);
        await removePidFile();
        console.log(chalk3.green("\u2713"), "Custodian stop requested");
        return;
      }
      case "status": {
        const { config } = await loadCustodianConfig({ repoRoot, scope });
        const port = args.port ?? config.port;
        const healthy = await isCustodianHealthy(port);
        if (healthy) {
          console.log(chalk3.green("\u2713"), `Custodian healthy on port ${port}`);
        } else {
          console.log(chalk3.yellow("Custodian not responding on port"), port);
        }
        return;
      }
      case "config": {
        const subAction = args.prompt?.[0] || "list";
        const configKey = args.key || args.prompt?.[1];
        const configValue = args.value || args.prompt?.[2];
        if (subAction === "path") {
          const paths = getCustodianConfigPaths(repoRoot);
          console.log(chalk3.cyan("Custodian config paths:"));
          console.log(chalk3.dim("Global:"), paths.global);
          console.log(chalk3.dim("Local:"), paths.local);
          return;
        }
        if (subAction === "list") {
          const { config } = await loadCustodianConfig({ repoRoot, scope });
          console.log(JSON.stringify(config, null, 2));
          return;
        }
        if (subAction === "get") {
          if (!configKey) {
            console.error(chalk3.red("Config key is required"));
            process.exit(1);
          }
          const { config } = await loadCustodianConfig({ repoRoot, scope });
          const keys = configKey.split(".");
          let value = config;
          for (const k of keys) {
            if (value && typeof value === "object" && k in value) {
              value = value[k];
            } else {
              console.log(chalk3.yellow(`Key '${configKey}' not found`));
              return;
            }
          }
          console.log(typeof value === "object" ? JSON.stringify(value, null, 2) : value);
          return;
        }
        if (subAction === "set") {
          if (!configKey || configValue === void 0) {
            console.error(chalk3.red("Config key and value are required"));
            process.exit(1);
          }
          const targetPath = await setCustodianConfigValue({
            repoRoot,
            scope: scope === "merged" ? "local" : scope,
            key: configKey,
            value: parseValue(configValue)
          });
          console.log(chalk3.green("\u2713"), "Updated config");
          console.log(chalk3.dim(targetPath));
          return;
        }
        if (subAction === "init") {
          const { config } = await loadCustodianConfig({ repoRoot, scope });
          const targetPath = await writeCustodianConfig({
            repoRoot,
            scope: scope === "merged" ? "local" : scope,
            config
          });
          console.log(chalk3.green("\u2713"), "Custodian config created");
          console.log(chalk3.dim(targetPath));
          return;
        }
        console.error(chalk3.red(`Unknown config action: ${subAction}`));
        process.exit(1);
        break;
      }
      default:
        console.error(chalk3.red(`Unknown action: ${action}`));
        process.exit(1);
    }
  }
};

// src/index.ts
var cli = yargs(hideBin(process.argv)).scriptName("crowepilot").usage(BANNER + "\n\nUsage: $0 <command> [options]").command(chatCommand).command(initCommand).command(configCommand).command(custodianCommand).command(
  "$0 [prompt..]",
  "Start an AI coding session (default command)",
  (yargs2) => yargs2.positional("prompt", {
    describe: "Initial prompt to send",
    type: "string",
    array: true
  }),
  async (argv) => {
    const prompt = argv.prompt?.join(" ");
    const { startSession } = await import("./chat-5DXC3D6Z.js");
    await startSession({
      prompt,
      model: argv.model,
      agent: argv.agent,
      verbose: argv.verbose
    });
  }
).option("verbose", {
  alias: "v",
  type: "boolean",
  description: "Run with verbose logging"
}).option("model", {
  alias: "m",
  type: "string",
  description: "Model to use (e.g., anthropic/claude-sonnet-4-20250514)"
}).option("agent", {
  alias: "a",
  type: "string",
  description: "Agent to use (build, plan, or custom)"
}).version(VERSION).help().alias("h", "help").epilog(chalk4.dim("CroweLogic AI Coding Assistant - https://crowelogic.com")).strict().fail((msg, err, yargs2) => {
  if (err) {
    console.error(chalk4.red("Error:"), err.message);
    process.exit(1);
  }
  console.error(chalk4.red("Error:"), msg);
  console.error();
  yargs2.showHelp();
  process.exit(1);
});
cli.parse();
