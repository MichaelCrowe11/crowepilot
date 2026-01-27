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
import path5 from "path";

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
async function chatWithOllama(options) {
  const res = await fetch(`${options.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      stream: false,
      options: options.temperature !== void 0 ? { temperature: options.temperature } : void 0
    })
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Ollama error (${res.status})`);
  }
  const data = await res.json();
  return (data.message?.content || data.response || "").trim();
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

// src/custodian/tool-runner.ts
import crypto from "crypto";
import fs3 from "fs/promises";
import path4 from "path";
import { exec, execFile } from "child_process";
import { promisify } from "util";
var execAsync = promisify(exec);
var execFileAsync = promisify(execFile);
var TOOL_TAG_REGEX = /<tool\s+name="([^"]+)">\s*([\s\S]*?)\s*<\/tool>/g;
function buildToolInstructions(options) {
  const lines = [
    "Tool use is allowed and should be used when it helps. Ignore any earlier instruction that forbids tool use.",
    "Call tools by responding with one or more tags in the exact format:",
    '<tool name="TOOL_NAME">{"param": "value"}</tool>',
    "Available tools and parameters:",
    '- list_dir: {"path": "relative/path"}',
    '- tree: {"path": "relative/path", "depth": 2, "maxEntries": 500}',
    '- read_file: {"path": "relative/path", "start_line": 1, "end_line": 200, "with_line_numbers": false}',
    '- write_file: {"path": "relative/path", "content": "file contents"}',
    '- append_file: {"path": "relative/path", "content": "more contents"}',
    '- replace_text: {"path": "relative/path", "find": "old", "replace": "new", "all": true, "regex": false}',
    '- mkdir: {"path": "relative/path"}',
    '- copy_file: {"from": "relative/path", "to": "relative/path"}',
    '- move_file: {"from": "relative/path", "to": "relative/path"}',
    '- stat: {"path": "relative/path"}',
    '- hash_file: {"path": "relative/path"}',
    '- search: {"path": "relative/path", "pattern": "*.ts"}',
    '- search_text: {"path": "relative/path", "pattern": "TODO", "globs": ["*.ts"], "literal": true, "case_sensitive": false}',
    "- git_status: {}",
    '- git_diff: {"staged": false, "path": "relative/path"}',
    '- git_log: {"max": 20, "path": "relative/path"}',
    '- git_show: {"ref": "HEAD"}',
    "- git_branches: {}"
  ];
  if (options.allowShell) {
    lines.push('- shell: {"command": "command to run"}');
  } else {
    lines.push("The shell tool is disabled. Do not call it.");
  }
  if (options.allowDelete) {
    lines.push('- delete_path: {"path": "relative/path", "recursive": false, "force": false}');
  } else {
    lines.push("The delete_path tool is disabled. Do not call it.");
  }
  if (options.allowNetwork) {
    lines.push('- http_get: {"url": "https://example.com"}');
  } else {
    lines.push("Network tools are disabled. Do not call http_get.");
  }
  lines.push(
    "Put each tool call on its own line.",
    "Do not wrap tool calls in code fences.",
    "After tool results are provided, continue with a normal answer.",
    "Use relative paths under the repo root; never use absolute paths."
  );
  return lines.join("\n");
}
function buildToolSystemPromptWithOptions(basePrompt, options) {
  const base = basePrompt?.trim();
  const toolInstructions = buildToolInstructions(options);
  if (!base) return toolInstructions;
  return `${base}

${toolInstructions}`;
}
function parseToolCalls(content) {
  const calls = [];
  let match;
  while ((match = TOOL_TAG_REGEX.exec(content)) !== null) {
    const name = match[1].trim();
    const rawArgs = match[2].trim();
    let args = {};
    let parseError;
    if (rawArgs) {
      try {
        args = JSON.parse(rawArgs);
      } catch (error) {
        parseError = error.message;
      }
    }
    calls.push({ name, rawArgs, args, parseError });
  }
  return calls;
}
function resolveSafePath(repoRoot, targetPath) {
  const root = path4.resolve(repoRoot);
  const resolved = path4.resolve(root, targetPath);
  if (resolved === root || resolved.startsWith(root + path4.sep)) {
    return resolved;
  }
  throw new Error(`Path escapes repo root: ${targetPath}`);
}
function coerceString(value) {
  if (typeof value === "string") return value;
  if (value === void 0 || value === null) return "";
  return JSON.stringify(value, null, 2);
}
function coerceStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === "string");
  }
  if (typeof value === "string") return [value];
  return [];
}
function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return fallback;
}
function truncate2(content, limit) {
  if (content.length <= limit) return content;
  return content.slice(0, limit) + `
... [truncated ${content.length - limit} chars]`;
}
async function runTool(call, options) {
  if (call.parseError) {
    return `Error: Invalid JSON for tool '${call.name}': ${call.parseError}
${call.rawArgs}`;
  }
  const maxOutputChars = options.maxOutputChars ?? 12e3;
  const maxFileChars = options.maxFileChars ?? 2e4;
  const maxDownloadBytes = options.maxDownloadBytes ?? 5 * 1024 * 1024;
  switch (call.name) {
    case "list_dir": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path) || ".");
      const entries = await fs3.readdir(target, { withFileTypes: true });
      const lines = entries.map((entry) => entry.isDirectory() ? `${entry.name}/` : entry.name);
      return truncate2(lines.join("\n") || "(empty)", maxOutputChars);
    }
    case "tree": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path) || ".");
      const maxEntries = Math.min(Math.max(1, toNumber(call.args.maxEntries, 500)), 5e3);
      const depth = Math.max(0, toNumber(call.args.depth, 2));
      const lines = [];
      let count = 0;
      const walk = async (dir, level) => {
        if (level > depth || count >= maxEntries) return;
        const entries = await fs3.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (count >= maxEntries) break;
          const display = `${"  ".repeat(level)}${entry.name}${entry.isDirectory() ? "/" : ""}`;
          lines.push(display);
          count += 1;
          if (entry.isDirectory()) {
            const next = path4.join(dir, entry.name);
            const stat = await fs3.lstat(next);
            if (!stat.isSymbolicLink()) {
              await walk(next, level + 1);
            }
          }
        }
      };
      await walk(target, 0);
      if (count >= maxEntries) {
        lines.push(`... [truncated after ${maxEntries} entries]`);
      }
      return truncate2(lines.join("\n") || "(empty)", maxOutputChars);
    }
    case "read_file": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path));
      const content = await fs3.readFile(target, "utf-8");
      const startLineRaw = call.args.start_line ?? call.args.startLine;
      const endLineRaw = call.args.end_line ?? call.args.endLine;
      const withLineNumbers = toBoolean(call.args.with_line_numbers ?? call.args.withLineNumbers, false);
      if (startLineRaw !== void 0 || endLineRaw !== void 0) {
        const startLine = Math.max(1, toNumber(startLineRaw, 1));
        const endLine = Math.max(startLine, toNumber(endLineRaw, Number.MAX_SAFE_INTEGER));
        const lines = content.split(/\r?\n/);
        const sliced = lines.slice(startLine - 1, endLine);
        const rendered = withLineNumbers ? sliced.map((line, index) => `${startLine + index}: ${line}`).join("\n") : sliced.join("\n");
        return truncate2(rendered, maxFileChars);
      }
      return truncate2(content, maxFileChars);
    }
    case "write_file": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path));
      const content = coerceString(call.args.content);
      await fs3.mkdir(path4.dirname(target), { recursive: true });
      await fs3.writeFile(target, content, "utf-8");
      return `Wrote ${content.length} chars to ${path4.relative(options.repoRoot, target)}`;
    }
    case "append_file": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path));
      const content = coerceString(call.args.content);
      await fs3.mkdir(path4.dirname(target), { recursive: true });
      await fs3.appendFile(target, content, "utf-8");
      return `Appended ${content.length} chars to ${path4.relative(options.repoRoot, target)}`;
    }
    case "replace_text": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path));
      const find = coerceString(call.args.find);
      const replace = coerceString(call.args.replace);
      const useRegex = toBoolean(call.args.regex, false);
      const replaceAll = toBoolean(call.args.all, true);
      if (!find) return "Error: replace_text requires a non-empty 'find' value.";
      const content = await fs3.readFile(target, "utf-8");
      let updated = content;
      let count = 0;
      if (useRegex) {
        let regex;
        try {
          regex = new RegExp(find, replaceAll ? "g" : "");
        } catch (error) {
          return `Error: invalid regex (${error.message})`;
        }
        const matches = content.match(regex);
        count = matches ? matches.length : 0;
        updated = content.replace(regex, replace);
      } else if (replaceAll) {
        const parts = content.split(find);
        count = parts.length - 1;
        updated = parts.join(replace);
      } else {
        const index = content.indexOf(find);
        if (index >= 0) {
          count = 1;
          updated = content.slice(0, index) + replace + content.slice(index + find.length);
        }
      }
      if (count === 0) return "No matches found.";
      await fs3.writeFile(target, updated, "utf-8");
      return `Replaced ${count} occurrence${count === 1 ? "" : "s"} in ${path4.relative(options.repoRoot, target)}`;
    }
    case "mkdir": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path));
      await fs3.mkdir(target, { recursive: true });
      return `Created directory ${path4.relative(options.repoRoot, target)}`;
    }
    case "copy_file": {
      const from = resolveSafePath(options.repoRoot, coerceString(call.args.from));
      const to = resolveSafePath(options.repoRoot, coerceString(call.args.to));
      await fs3.mkdir(path4.dirname(to), { recursive: true });
      await fs3.copyFile(from, to);
      return `Copied ${path4.relative(options.repoRoot, from)} -> ${path4.relative(options.repoRoot, to)}`;
    }
    case "move_file": {
      const from = resolveSafePath(options.repoRoot, coerceString(call.args.from));
      const to = resolveSafePath(options.repoRoot, coerceString(call.args.to));
      await fs3.mkdir(path4.dirname(to), { recursive: true });
      await fs3.rename(from, to);
      return `Moved ${path4.relative(options.repoRoot, from)} -> ${path4.relative(options.repoRoot, to)}`;
    }
    case "delete_path": {
      if (!options.allowDelete) {
        return "Error: delete_path tool is disabled. Re-run with --allow-delete to enable.";
      }
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path));
      if (path4.resolve(target) === path4.resolve(options.repoRoot)) {
        return "Error: refusing to delete the repo root.";
      }
      const recursive = toBoolean(call.args.recursive, false);
      const force = toBoolean(call.args.force, false);
      try {
        const stat = await fs3.lstat(target);
        if (stat.isDirectory() && !recursive) {
          return "Error: target is a directory. Set recursive=true to delete.";
        }
      } catch {
        if (!force) return "Error: path does not exist.";
      }
      await fs3.rm(target, { recursive, force: force || false });
      return `Deleted ${path4.relative(options.repoRoot, target)}`;
    }
    case "search": {
      const pattern = coerceString(call.args.pattern) || "*";
      const searchPath = resolveSafePath(options.repoRoot, coerceString(call.args.path) || ".");
      try {
        const { stdout } = await execFileAsync("rg", ["--files", "-g", pattern, searchPath], {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024
        });
        const output = stdout.trim();
        return truncate2(output || "(no matches)", maxOutputChars);
      } catch (error) {
        const message = error.message || "rg failed";
        return `Error: search failed (${message})`;
      }
    }
    case "search_text": {
      const pattern = coerceString(call.args.pattern);
      if (!pattern) return "Error: search_text requires a pattern.";
      const searchPath = resolveSafePath(options.repoRoot, coerceString(call.args.path) || ".");
      const globs = coerceStringArray(call.args.globs);
      const literal = toBoolean(call.args.literal, false);
      const caseSensitiveRaw = call.args.case_sensitive ?? call.args.caseSensitive;
      const maxMatches = Math.min(Math.max(1, toNumber(call.args.max_matches ?? call.args.maxMatches, 200)), 1e3);
      const args = ["--no-heading", "--line-number", "--column", "--max-count", String(maxMatches)];
      if (literal) args.push("-F");
      if (caseSensitiveRaw !== void 0) {
        if (toBoolean(caseSensitiveRaw, false)) {
          args.push("-s");
        } else {
          args.push("-i");
        }
      }
      for (const glob of globs) {
        args.push("-g", glob);
      }
      args.push("--", pattern, searchPath);
      try {
        const { stdout } = await execFileAsync("rg", args, {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024
        });
        const output = stdout.trim();
        return truncate2(output || "(no matches)", maxOutputChars);
      } catch (error) {
        const err = error;
        const output = (err.stdout || "").trim();
        if (err.code === 1 && output === "") {
          return "(no matches)";
        }
        const message = err.stderr?.trim() || err.message || "rg failed";
        return `Error: search_text failed (${message})`;
      }
    }
    case "stat": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path));
      const stats = await fs3.lstat(target);
      const payload = {
        path: path4.relative(options.repoRoot, target),
        size: stats.size,
        mode: stats.mode,
        mtime: stats.mtime.toISOString(),
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        isSymbolicLink: stats.isSymbolicLink()
      };
      return JSON.stringify(payload, null, 2);
    }
    case "hash_file": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path));
      const buffer = await fs3.readFile(target);
      const hash = crypto.createHash("sha256").update(buffer).digest("hex");
      return `${hash}  ${path4.relative(options.repoRoot, target)}`;
    }
    case "git_status": {
      try {
        const { stdout } = await execFileAsync("git", ["status", "-sb"], {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024
        });
        return truncate2(stdout.trim() || "(no output)", maxOutputChars);
      } catch (error) {
        const message = error.stderr || error.message;
        return `Error: git_status failed (${message})`;
      }
    }
    case "git_diff": {
      const staged = toBoolean(call.args.staged, false);
      const target = coerceString(call.args.path);
      const args = ["diff", "--no-color"];
      if (staged) args.push("--staged");
      if (target) args.push("--", target);
      try {
        const { stdout } = await execFileAsync("git", args, {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024
        });
        return truncate2(stdout.trim() || "(no diff)", maxOutputChars);
      } catch (error) {
        const message = error.stderr || error.message;
        return `Error: git_diff failed (${message})`;
      }
    }
    case "git_log": {
      const max = Math.min(Math.max(1, toNumber(call.args.max, 20)), 200);
      const target = coerceString(call.args.path);
      const args = ["log", "--oneline", "-n", String(max)];
      if (target) args.push("--", target);
      try {
        const { stdout } = await execFileAsync("git", args, {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024
        });
        return truncate2(stdout.trim() || "(no commits)", maxOutputChars);
      } catch (error) {
        const message = error.stderr || error.message;
        return `Error: git_log failed (${message})`;
      }
    }
    case "git_show": {
      const ref = coerceString(call.args.ref) || "HEAD";
      const args = ["show", "--no-color", ref];
      try {
        const { stdout } = await execFileAsync("git", args, {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024
        });
        return truncate2(stdout.trim() || "(no output)", maxOutputChars);
      } catch (error) {
        const message = error.stderr || error.message;
        return `Error: git_show failed (${message})`;
      }
    }
    case "git_branches": {
      try {
        const { stdout } = await execFileAsync("git", ["branch", "--all", "--no-color"], {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024
        });
        return truncate2(stdout.trim() || "(no branches)", maxOutputChars);
      } catch (error) {
        const message = error.stderr || error.message;
        return `Error: git_branches failed (${message})`;
      }
    }
    case "http_get": {
      if (!options.allowNetwork) {
        return "Error: http_get tool is disabled. Re-run with --allow-network to enable.";
      }
      const url = coerceString(call.args.url);
      if (!url) return "Error: http_get requires a url.";
      if (!/^https?:\/\//i.test(url)) return "Error: http_get only supports http/https URLs.";
      const res = await fetch(url, {
        headers: { "User-Agent": "crowepilot-tool-runner" }
      });
      const contentLength = Number(res.headers.get("content-length") || 0);
      if (contentLength && contentLength > maxDownloadBytes) {
        return `Error: response too large (${contentLength} bytes).`;
      }
      const text = await res.text();
      if (!res.ok) {
        return truncate2(`Error: HTTP ${res.status}
${text}`, maxOutputChars);
      }
      return truncate2(text, maxOutputChars);
    }
    case "shell": {
      if (!options.allowShell) {
        return "Error: shell tool is disabled. Re-run with --allow-shell to enable.";
      }
      const command = coerceString(call.args.command);
      if (!command) return "Error: shell tool requires a command.";
      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024
        });
        const combined = [stdout?.trim(), stderr?.trim()].filter(Boolean).join("\n");
        return truncate2(combined || "(no output)", maxOutputChars);
      } catch (error) {
        const err = error;
        const combined = [err.stdout?.trim(), err.stderr?.trim(), err.message].filter(Boolean).join("\n");
        return truncate2(combined || "Error: shell command failed.", maxOutputChars);
      }
    }
    default:
      return `Error: unknown tool '${call.name}'`;
  }
}
async function runWithTools(options) {
  const messages = [];
  const systemPrompt = buildToolSystemPromptWithOptions(options.system, {
    allowShell: options.allowShell ?? false,
    allowDelete: options.allowDelete ?? false,
    allowNetwork: options.allowNetwork ?? false
  });
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: options.prompt });
  const maxSteps = options.maxSteps ?? 8;
  for (let step = 0; step < maxSteps; step += 1) {
    const assistantContent = await chatWithOllama({
      baseUrl: options.baseUrl,
      model: options.model,
      messages,
      temperature: options.temperature
    });
    const toolCalls = parseToolCalls(assistantContent);
    if (toolCalls.length === 0) {
      return assistantContent;
    }
    messages.push({ role: "assistant", content: assistantContent });
    for (const call of toolCalls) {
      let result;
      try {
        result = await runTool(call, {
          repoRoot: options.repoRoot,
          allowShell: options.allowShell,
          allowDelete: options.allowDelete,
          allowNetwork: options.allowNetwork,
          maxOutputChars: options.maxOutputChars,
          maxFileChars: options.maxFileChars,
          maxDownloadBytes: options.maxDownloadBytes
        });
      } catch (error) {
        result = `Error: ${error.message}`;
      }
      messages.push({
        role: "user",
        content: `Tool result (${call.name}):
${result}`
      });
    }
  }
  throw new Error("Tool runner exceeded max steps without a final response.");
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
  const useTools = options.useTools ?? false;
  const allowShell = options.allowShell ?? false;
  const allowDelete = options.allowDelete ?? false;
  const allowNetwork = options.allowNetwork ?? false;
  const context = includeContext ? await buildRepoContext(repoRoot, {
    maxFiles: config.contextMaxFiles,
    maxChars: config.contextMaxChars
  }) : "";
  const prompt = options.prompt?.trim() || "Provide an architectural review and optimization plan.";
  const composedPrompt = context ? `Context:
${context}

Request:
${prompt}` : prompt;
  if (useTools) {
    return runWithTools({
      baseUrl: config.ollamaBaseUrl,
      model,
      prompt: composedPrompt,
      system: systemPrompt,
      repoRoot,
      allowShell,
      allowDelete,
      allowNetwork
    });
  }
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
    includeContext: options.includeContext,
    useTools: options.useTools,
    allowShell: options.allowShell,
    allowDelete: options.allowDelete,
    allowNetwork: options.allowNetwork
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
  const entryPath = entryCandidate && entryCandidate.endsWith(".js") ? path5.resolve(entryCandidate) : null;
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
  runWithTools,
  isCustodianHealthy,
  runCustodianRequest,
  runCustodianRemote,
  ensureCustodianRunning,
  stopCustodianRemote,
  startSession,
  chatCommand
};
