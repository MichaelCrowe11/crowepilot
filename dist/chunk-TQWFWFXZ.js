// src/commands/chat.ts
import chalk2 from "chalk";
import { spawn as spawn2 } from "child_process";

// src/config/constants.ts
import chalk from "chalk";
var VERSION = "0.1.0";
var BANNER = chalk.cyan(`
   \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557    \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557\u2588\u2588\u2557      \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557
  \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551    \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551\u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D
  \u2588\u2588\u2551     \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551 \u2588\u2557 \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551\u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551
  \u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551\u2588\u2588\u2588\u2557\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2551\u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551
  \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u255A\u2588\u2588\u2588\u2554\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551     \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D   \u2588\u2588\u2551
   \u255A\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D  \u255A\u2550\u2550\u255D\u255A\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D     \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D    \u255A\u2550\u255D
`) + chalk.dim(`  v${VERSION} - AI-Powered Coding Assistant`);
var DEFAULT_MODEL = "anthropic/claude-sonnet-4-20250514";
var DEFAULT_AGENT = "build";
var OPENCODE_SERVER_PORT = 4096;
var OPENCODE_SERVER_URL = `http://localhost:${OPENCODE_SERVER_PORT}`;
var OPENCODE_CONFIG_DIR = ".opencode";
var OPENCODE_CONFIG_FILE = "opencode.json";

// src/custodian/client.ts
import { spawn } from "child_process";
import path4 from "path";

// src/custodian/config.ts
import fs from "fs/promises";
import path2 from "path";

// src/custodian/constants.ts
import os from "os";
import path from "path";
var CUSTODIAN_DEFAULT_MODEL = "Mcrowe1210/DeepParallel";
var CUSTODIAN_DEFAULT_PORT = 5123;
var CUSTODIAN_OLLAMA_URL = "http://127.0.0.1:11434";
var CUSTODIAN_LABEL = "com.crowelogic.crowepilot.custodian";
var CUSTODIAN_CONFIG_DIR_GLOBAL = path.join(os.homedir(), ".config", "crowepilot");
var CUSTODIAN_CONFIG_FILE_GLOBAL = path.join(CUSTODIAN_CONFIG_DIR_GLOBAL, "custodian.json");
var CUSTODIAN_PID_FILE = path.join(CUSTODIAN_CONFIG_DIR_GLOBAL, "custodian.pid");
var CUSTODIAN_LOG_DIR = path.join(os.homedir(), "Library", "Logs", "crowepilot");
var CUSTODIAN_SYSTEM_PROMPT = "You are the CrowePilot Custodian and Architect. Your job is to safeguard code quality, guide architecture, and propose optimizations. Be decisive, practical, and concise. When unsure, ask the smallest number of clarifying questions.";

// src/custodian/config.ts
var DEFAULTS = {
  model: CUSTODIAN_DEFAULT_MODEL,
  port: CUSTODIAN_DEFAULT_PORT,
  autostart: true,
  systemPrompt: CUSTODIAN_SYSTEM_PROMPT,
  ollamaBaseUrl: CUSTODIAN_OLLAMA_URL,
  contextMaxFiles: 200,
  contextMaxChars: 6e3
};
function getLocalConfigPath(repoRoot) {
  return path2.join(repoRoot, ".crowepilot", "custodian.json");
}
async function readJsonFile(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}
async function readIfExists(filePath) {
  try {
    return await readJsonFile(filePath);
  } catch {
    return {};
  }
}
async function loadCustodianConfig(options) {
  const repoRoot = options?.repoRoot || process.cwd();
  const scope = options?.scope || "merged";
  const globalPath = CUSTODIAN_CONFIG_FILE_GLOBAL;
  const localPath = getLocalConfigPath(repoRoot);
  const globalConfig = scope === "local" ? {} : await readIfExists(globalPath);
  const localConfig = scope === "global" ? {} : await readIfExists(localPath);
  const merged = {
    ...DEFAULTS,
    ...globalConfig,
    ...localConfig,
    repoRoot
  };
  return { config: merged, paths: { global: globalPath, local: localPath } };
}
async function writeCustodianConfig(options) {
  const repoRoot = options.repoRoot || process.cwd();
  const scope = options.scope || "local";
  const targetPath = scope === "global" ? CUSTODIAN_CONFIG_FILE_GLOBAL : getLocalConfigPath(repoRoot);
  const targetDir = path2.dirname(targetPath);
  const sanitized = { ...options.config };
  delete sanitized.repoRoot;
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(targetPath, JSON.stringify(sanitized, null, 2));
  return targetPath;
}
async function setCustodianConfigValue(options) {
  const repoRoot = options.repoRoot || process.cwd();
  const scope = options.scope || "local";
  const { config } = await loadCustodianConfig({ repoRoot, scope });
  const keys = options.key.split(".");
  let current = config;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in current) || typeof current[k] !== "object" || current[k] === null) {
      current[k] = {};
    }
    current = current[k];
  }
  current[keys[keys.length - 1]] = options.value;
  const targetPath = await writeCustodianConfig({
    repoRoot,
    scope,
    config
  });
  return targetPath;
}
function getCustodianConfigPaths(repoRoot) {
  const root = repoRoot || process.cwd();
  return {
    global: CUSTODIAN_CONFIG_FILE_GLOBAL,
    local: getLocalConfigPath(root)
  };
}

// src/custodian/ollama.ts
async function generateWithOllama(options) {
  const res = await fetch(`${options.baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: options.model,
      prompt: options.prompt,
      system: options.system,
      stream: false,
      options: options.temperature !== void 0 ? { temperature: options.temperature } : void 0
    })
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Ollama error (${res.status})`);
  }
  const data = await res.json();
  return (data.response || "").trim();
}

// src/custodian/context.ts
import fs2 from "fs/promises";
import path3 from "path";
var DEFAULT_IGNORES = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".cache",
  ".crowepilot",
  ".opencode"
]);
async function pathExists(filePath) {
  try {
    await fs2.access(filePath);
    return true;
  } catch {
    return false;
  }
}
async function listFiles(root, options) {
  const results = [];
  const queue = [root];
  while (queue.length > 0 && results.length < options.maxFiles) {
    const current = queue.shift();
    if (!current) continue;
    let entries;
    try {
      entries = await fs2.readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (results.length >= options.maxFiles) break;
      if (DEFAULT_IGNORES.has(entry.name)) continue;
      const fullPath = path3.join(current, entry.name);
      const relativePath = path3.relative(root, fullPath);
      if (entry.isDirectory()) {
        queue.push(fullPath);
        continue;
      }
      if (entry.isFile()) {
        results.push(relativePath);
      }
    }
  }
  return results.sort();
}
function truncate(text, maxChars) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n...";
}
async function readIfExists2(filePath, maxChars) {
  if (!await pathExists(filePath)) return null;
  const content = await fs2.readFile(filePath, "utf-8");
  return truncate(content, maxChars);
}
function summarizePackageJson(raw) {
  try {
    const parsed = JSON.parse(raw);
    const summary = {
      name: parsed.name,
      version: parsed.version,
      scripts: parsed.scripts ? Object.keys(parsed.scripts) : void 0,
      dependencies: parsed.dependencies ? Object.keys(parsed.dependencies) : void 0,
      devDependencies: parsed.devDependencies ? Object.keys(parsed.devDependencies) : void 0
    };
    return JSON.stringify(summary, null, 2);
  } catch {
    return raw;
  }
}
async function buildRepoContext(repoRoot, options) {
  const safeOptions = {
    maxFiles: Math.max(10, options.maxFiles),
    maxChars: Math.max(1e3, options.maxChars)
  };
  const files = await listFiles(repoRoot, safeOptions);
  const packageJsonPath = path3.join(repoRoot, "package.json");
  const packageJsonRaw = await readIfExists2(packageJsonPath, safeOptions.maxChars);
  const packageJson = packageJsonRaw ? summarizePackageJson(packageJsonRaw) : null;
  const readmePath = path3.join(repoRoot, "README.md");
  const readme = await readIfExists2(readmePath, safeOptions.maxChars);
  const sections = [];
  sections.push(`Repository: ${path3.basename(repoRoot)}`);
  if (packageJson) {
    sections.push("\npackage.json summary:\n" + packageJson);
  }
  if (readme) {
    sections.push("\nREADME.md excerpt:\n" + readme);
  }
  if (files.length > 0) {
    sections.push("\nFile list:\n" + files.join("\n"));
  }
  return truncate(sections.join("\n"), safeOptions.maxChars);
}

// src/custodian/client.ts
function getBaseUrl(port) {
  return `http://127.0.0.1:${port}`;
}
async function fetchJson(url, options, timeoutMs = 1500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
async function isCustodianHealthy(port) {
  const data = await fetchJson(`${getBaseUrl(port)}/health`);
  return Boolean(data?.status === "ok");
}
async function runCustodianRequest(options) {
  const { config } = await loadCustodianConfig({ repoRoot: options.repoRoot });
  const repoRoot = options.repoRoot || config.repoRoot;
  const model = options.model || config.model;
  const systemPrompt = options.systemPrompt || config.systemPrompt;
  const includeContext = options.includeContext ?? true;
  const context = includeContext ? await buildRepoContext(repoRoot, {
    maxFiles: config.contextMaxFiles,
    maxChars: config.contextMaxChars
  }) : "";
  const prompt = options.prompt?.trim() || "Provide an architectural review and optimization plan.";
  const composedPrompt = context ? `Context:
${context}

Request:
${prompt}` : prompt;
  return generateWithOllama({
    baseUrl: config.ollamaBaseUrl,
    model,
    prompt: composedPrompt,
    system: systemPrompt
  });
}
async function runCustodianRemote(options) {
  const payload = {
    prompt: options.prompt,
    repoRoot: options.repoRoot,
    model: options.model,
    systemPrompt: options.systemPrompt,
    includeContext: options.includeContext
  };
  const data = await fetchJson(
    `${getBaseUrl(options.port)}/run`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    },
    6e4
  );
  if (!data?.response) {
    throw new Error("Custodian service did not return a response");
  }
  return String(data.response);
}
async function ensureCustodianRunning(options = {}) {
  const { config } = await loadCustodianConfig({ repoRoot: options.repoRoot });
  const port = options.port ?? config.port;
  if (await isCustodianHealthy(port)) return true;
  const entryCandidate = process.argv[1];
  const entryPath = entryCandidate && entryCandidate.endsWith(".js") ? path4.resolve(entryCandidate) : null;
  const nodePath = entryPath ? process.execPath : "crowepilot";
  const args = entryPath ? [entryPath, "custodian", "serve", "--daemon", "--port", String(port)] : ["custodian", "serve", "--daemon", "--port", String(port)];
  if (options.repoRoot || config.repoRoot) {
    args.push("--repo", options.repoRoot || config.repoRoot);
  }
  if (options.model || config.model) {
    args.push("--model", options.model || config.model);
  }
  const child = spawn(nodePath, args, {
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      CROWEPILOT_CUSTODIAN_AUTOSTART: "0"
    }
  });
  child.unref();
  for (let attempt = 0; attempt < 6; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (await isCustodianHealthy(port)) return true;
  }
  if (!options.quiet) {
    console.error("Custodian failed to start on port", port);
  }
  return false;
}
async function stopCustodianRemote(port) {
  await fetchJson(`${getBaseUrl(port)}/shutdown`, { method: "POST" }, 2e3);
}

// src/commands/chat.ts
async function startSession(options = {}) {
  const { prompt, model, agent, verbose } = options;
  const opencodeInstalled = await checkOpenCodeInstalled();
  if (!opencodeInstalled) {
    console.log(chalk2.yellow("\nOpenCode not found. Installing..."));
    await installOpenCode();
  }
  console.log(BANNER);
  console.log();
  console.log(chalk2.dim("Starting AI coding session..."));
  console.log(chalk2.dim(`Model: ${model || DEFAULT_MODEL}`));
  console.log(chalk2.dim(`Agent: ${agent || DEFAULT_AGENT}`));
  console.log();
  const custodianEnv = process.env.CROWEPILOT_CUSTODIAN_AUTOSTART;
  const allowCustodianAutostart = !(custodianEnv === "0" || custodianEnv === "false");
  let custodianConfig = null;
  if (allowCustodianAutostart) {
    try {
      custodianConfig = await loadCustodianConfig({ repoRoot: process.cwd() });
      if (custodianConfig.config.autostart) {
        await ensureCustodianRunning({
          repoRoot: custodianConfig.config.repoRoot,
          model: custodianConfig.config.model,
          port: custodianConfig.config.port,
          quiet: !verbose
        });
      }
    } catch (error) {
      if (verbose) {
        console.warn(chalk2.yellow("Custodian autostart skipped:"), error.message);
      }
    }
  }
  const args = [];
  if (model) {
    args.push("--model", model);
  }
  if (agent) {
    args.push("--agent", agent);
  }
  if (prompt) {
    args.push("--prompt", prompt);
  }
  if (verbose) {
    args.push("--verbose");
  }
  const opencode = spawn2("opencode", args, {
    stdio: "inherit",
    env: {
      ...process.env,
      // Pass through any crowepilot-specific env vars
      CROWEPILOT_VERSION: VERSION,
      CROWEPILOT_CUSTODIAN_URL: custodianConfig ? `http://127.0.0.1:${custodianConfig.config.port}` : process.env.CROWEPILOT_CUSTODIAN_URL,
      CROWEPILOT_CUSTODIAN_MODEL: custodianConfig?.config.model || process.env.CROWEPILOT_CUSTODIAN_MODEL
    }
  });
  opencode.on("error", (err) => {
    if (err.code === "ENOENT") {
      console.error(chalk2.red("\nError: OpenCode binary not found."));
      console.error(chalk2.dim("Run: curl -fsSL https://opencode.ai/install | bash"));
      process.exit(1);
    }
    console.error(chalk2.red("\nError:"), err.message);
    process.exit(1);
  });
  opencode.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}
async function checkOpenCodeInstalled() {
  return new Promise((resolve) => {
    const proc = spawn2("which", ["opencode"], {
      stdio: "pipe"
    });
    proc.on("exit", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}
async function installOpenCode() {
  console.log(chalk2.cyan("Installing OpenCode..."));
  return new Promise((resolve) => {
    const proc = spawn2("bash", ["-c", "curl -fsSL https://opencode.ai/install | bash"], {
      stdio: "inherit"
    });
    proc.on("exit", (code) => {
      if (code !== 0) {
        console.error(chalk2.red("Failed to install OpenCode"));
        process.exit(1);
      }
      console.log(chalk2.green("OpenCode installed successfully!"));
      resolve();
    });
    proc.on("error", (err) => {
      console.error(chalk2.red("Failed to install OpenCode:"), err.message);
      process.exit(1);
    });
  });
}
var chatCommand = {
  command: "chat [prompt..]",
  describe: "Start an interactive AI coding session",
  builder: (yargs) => yargs.positional("prompt", {
    describe: "Initial prompt to send to the AI",
    type: "string",
    array: true
  }).option("model", {
    alias: "m",
    type: "string",
    description: "Model to use",
    default: DEFAULT_MODEL
  }).option("agent", {
    alias: "a",
    type: "string",
    description: "Agent mode (build, plan)",
    default: DEFAULT_AGENT
  }),
  handler: async (argv) => {
    const prompt = argv.prompt?.join(" ");
    await startSession({
      prompt,
      model: argv.model,
      agent: argv.agent,
      verbose: argv.verbose
    });
  }
};

export {
  VERSION,
  BANNER,
  DEFAULT_MODEL,
  DEFAULT_AGENT,
  OPENCODE_CONFIG_DIR,
  OPENCODE_CONFIG_FILE,
  CUSTODIAN_DEFAULT_MODEL,
  CUSTODIAN_DEFAULT_PORT,
  CUSTODIAN_OLLAMA_URL,
  CUSTODIAN_LABEL,
  CUSTODIAN_PID_FILE,
  CUSTODIAN_LOG_DIR,
  CUSTODIAN_SYSTEM_PROMPT,
  loadCustodianConfig,
  writeCustodianConfig,
  setCustodianConfigValue,
  getCustodianConfigPaths,
  generateWithOllama,
  buildRepoContext,
  isCustodianHealthy,
  runCustodianRequest,
  runCustodianRemote,
  ensureCustodianRunning,
  stopCustodianRemote,
  startSession,
  chatCommand
};
