import crypto from "crypto"
import fs from "fs/promises"
import path from "path"
import { exec, execFile } from "child_process"
import { promisify } from "util"
import { chatWithOllama, type ChatMessage } from "./ollama"

const execAsync = promisify(exec)
const execFileAsync = promisify(execFile)

interface ToolCall {
  name: string
  rawArgs: string
  args: Record<string, unknown>
  parseError?: string
}

export interface ToolRunnerOptions {
  baseUrl: string
  model: string
  prompt: string
  system?: string
  repoRoot: string
  temperature?: number
  maxSteps?: number
  allowShell?: boolean
  allowDelete?: boolean
  allowNetwork?: boolean
  maxOutputChars?: number
  maxFileChars?: number
  maxDownloadBytes?: number
}

const TOOL_TAG_REGEX = /<tool\s+name="([^"]+)">\s*([\s\S]*?)\s*<\/tool>/g

function buildToolInstructions(options: {
  allowShell: boolean
  allowDelete: boolean
  allowNetwork: boolean
}) {
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
    "- git_branches: {}",
  ]

  if (options.allowShell) {
    lines.push('- shell: {"command": "command to run"}')
  } else {
    lines.push("The shell tool is disabled. Do not call it.")
  }

  if (options.allowDelete) {
    lines.push('- delete_path: {"path": "relative/path", "recursive": false, "force": false}')
  } else {
    lines.push("The delete_path tool is disabled. Do not call it.")
  }

  if (options.allowNetwork) {
    lines.push('- http_get: {"url": "https://example.com"}')
  } else {
    lines.push("Network tools are disabled. Do not call http_get.")
  }

  lines.push(
    "Put each tool call on its own line.",
    "Do not wrap tool calls in code fences.",
    "After tool results are provided, continue with a normal answer.",
    "Use relative paths under the repo root; never use absolute paths."
  )

  return lines.join("\n")
}

function buildToolSystemPromptWithOptions(
  basePrompt: string | undefined,
  options: { allowShell: boolean; allowDelete: boolean; allowNetwork: boolean }
) {
  const base = basePrompt?.trim()
  const toolInstructions = buildToolInstructions(options)
  if (!base) return toolInstructions
  return `${base}\n\n${toolInstructions}`
}

function parseToolCalls(content: string): ToolCall[] {
  const calls: ToolCall[] = []
  let match: RegExpExecArray | null
  while ((match = TOOL_TAG_REGEX.exec(content)) !== null) {
    const name = match[1].trim()
    const rawArgs = match[2].trim()
    let args: Record<string, unknown> = {}
    let parseError: string | undefined
    if (rawArgs) {
      try {
        args = JSON.parse(rawArgs) as Record<string, unknown>
      } catch (error) {
        parseError = (error as Error).message
      }
    }
    calls.push({ name, rawArgs, args, parseError })
  }
  return calls
}

function resolveSafePath(repoRoot: string, targetPath: string) {
  const root = path.resolve(repoRoot)
  const resolved = path.resolve(root, targetPath)
  if (resolved === root || resolved.startsWith(root + path.sep)) {
    return resolved
  }
  throw new Error(`Path escapes repo root: ${targetPath}`)
}

function coerceString(value: unknown) {
  if (typeof value === "string") return value
  if (value === undefined || value === null) return ""
  return JSON.stringify(value, null, 2)
}

function coerceStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string")
  }
  if (typeof value === "string") return [value]
  return []
}

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (normalized === "true") return true
    if (normalized === "false") return false
  }
  return fallback
}

function truncate(content: string, limit: number) {
  if (content.length <= limit) return content
  return content.slice(0, limit) + `\n... [truncated ${content.length - limit} chars]`
}

async function runTool(
  call: ToolCall,
  options: Pick<
    ToolRunnerOptions,
    | "repoRoot"
    | "allowShell"
    | "allowDelete"
    | "allowNetwork"
    | "maxOutputChars"
    | "maxFileChars"
    | "maxDownloadBytes"
  >
) {
  if (call.parseError) {
    return `Error: Invalid JSON for tool '${call.name}': ${call.parseError}\n${call.rawArgs}`
  }

  const maxOutputChars = options.maxOutputChars ?? 12000
  const maxFileChars = options.maxFileChars ?? 20000
  const maxDownloadBytes = options.maxDownloadBytes ?? 5 * 1024 * 1024

  switch (call.name) {
    case "list_dir": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path) || ".")
      const entries = await fs.readdir(target, { withFileTypes: true })
      const lines = entries.map((entry) => (entry.isDirectory() ? `${entry.name}/` : entry.name))
      return truncate(lines.join("\n") || "(empty)", maxOutputChars)
    }
    case "tree": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path) || ".")
      const maxEntries = Math.min(Math.max(1, toNumber(call.args.maxEntries, 500)), 5000)
      const depth = Math.max(0, toNumber(call.args.depth, 2))
      const lines: string[] = []
      let count = 0

      const walk = async (dir: string, level: number) => {
        if (level > depth || count >= maxEntries) return
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
          if (count >= maxEntries) break
          const display = `${"  ".repeat(level)}${entry.name}${entry.isDirectory() ? "/" : ""}`
          lines.push(display)
          count += 1
          if (entry.isDirectory()) {
            const next = path.join(dir, entry.name)
            const stat = await fs.lstat(next)
            if (!stat.isSymbolicLink()) {
              await walk(next, level + 1)
            }
          }
        }
      }

      await walk(target, 0)
      if (count >= maxEntries) {
        lines.push(`... [truncated after ${maxEntries} entries]`)
      }
      return truncate(lines.join("\n") || "(empty)", maxOutputChars)
    }
    case "read_file": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path))
      const content = await fs.readFile(target, "utf-8")
      const startLineRaw = call.args.start_line ?? call.args.startLine
      const endLineRaw = call.args.end_line ?? call.args.endLine
      const withLineNumbers = toBoolean(
        call.args.with_line_numbers ?? call.args.withLineNumbers,
        false
      )

      if (startLineRaw !== undefined || endLineRaw !== undefined) {
        const startLine = Math.max(1, toNumber(startLineRaw, 1))
        const endLine = Math.max(startLine, toNumber(endLineRaw, Number.MAX_SAFE_INTEGER))
        const lines = content.split(/\r?\n/)
        const sliced = lines.slice(startLine - 1, endLine)
        const rendered = withLineNumbers
          ? sliced.map((line, index) => `${startLine + index}: ${line}`).join("\n")
          : sliced.join("\n")
        return truncate(rendered, maxFileChars)
      }

      return truncate(content, maxFileChars)
    }
    case "write_file": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path))
      const content = coerceString(call.args.content)
      await fs.mkdir(path.dirname(target), { recursive: true })
      await fs.writeFile(target, content, "utf-8")
      return `Wrote ${content.length} chars to ${path.relative(options.repoRoot, target)}`
    }
    case "append_file": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path))
      const content = coerceString(call.args.content)
      await fs.mkdir(path.dirname(target), { recursive: true })
      await fs.appendFile(target, content, "utf-8")
      return `Appended ${content.length} chars to ${path.relative(options.repoRoot, target)}`
    }
    case "replace_text": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path))
      const find = coerceString(call.args.find)
      const replace = coerceString(call.args.replace)
      const useRegex = toBoolean(call.args.regex, false)
      const replaceAll = toBoolean(call.args.all, true)

      if (!find) return "Error: replace_text requires a non-empty 'find' value."

      const content = await fs.readFile(target, "utf-8")
      let updated = content
      let count = 0

      if (useRegex) {
        let regex: RegExp
        try {
          regex = new RegExp(find, replaceAll ? "g" : "")
        } catch (error) {
          return `Error: invalid regex (${(error as Error).message})`
        }
        const matches = content.match(regex)
        count = matches ? matches.length : 0
        updated = content.replace(regex, replace)
      } else if (replaceAll) {
        const parts = content.split(find)
        count = parts.length - 1
        updated = parts.join(replace)
      } else {
        const index = content.indexOf(find)
        if (index >= 0) {
          count = 1
          updated = content.slice(0, index) + replace + content.slice(index + find.length)
        }
      }

      if (count === 0) return "No matches found."
      await fs.writeFile(target, updated, "utf-8")
      return `Replaced ${count} occurrence${count === 1 ? "" : "s"} in ${path.relative(options.repoRoot, target)}`
    }
    case "mkdir": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path))
      await fs.mkdir(target, { recursive: true })
      return `Created directory ${path.relative(options.repoRoot, target)}`
    }
    case "copy_file": {
      const from = resolveSafePath(options.repoRoot, coerceString(call.args.from))
      const to = resolveSafePath(options.repoRoot, coerceString(call.args.to))
      await fs.mkdir(path.dirname(to), { recursive: true })
      await fs.copyFile(from, to)
      return `Copied ${path.relative(options.repoRoot, from)} -> ${path.relative(options.repoRoot, to)}`
    }
    case "move_file": {
      const from = resolveSafePath(options.repoRoot, coerceString(call.args.from))
      const to = resolveSafePath(options.repoRoot, coerceString(call.args.to))
      await fs.mkdir(path.dirname(to), { recursive: true })
      await fs.rename(from, to)
      return `Moved ${path.relative(options.repoRoot, from)} -> ${path.relative(options.repoRoot, to)}`
    }
    case "delete_path": {
      if (!options.allowDelete) {
        return "Error: delete_path tool is disabled. Re-run with --allow-delete to enable."
      }
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path))
      if (path.resolve(target) === path.resolve(options.repoRoot)) {
        return "Error: refusing to delete the repo root."
      }
      const recursive = toBoolean(call.args.recursive, false)
      const force = toBoolean(call.args.force, false)
      try {
        const stat = await fs.lstat(target)
        if (stat.isDirectory() && !recursive) {
          return "Error: target is a directory. Set recursive=true to delete."
        }
      } catch {
        if (!force) return "Error: path does not exist."
      }
      await fs.rm(target, { recursive, force: force || false })
      return `Deleted ${path.relative(options.repoRoot, target)}`
    }
    case "search": {
      const pattern = coerceString(call.args.pattern) || "*"
      const searchPath = resolveSafePath(options.repoRoot, coerceString(call.args.path) || ".")
      try {
        const { stdout } = await execFileAsync("rg", ["--files", "-g", pattern, searchPath], {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024,
        })
        const output = stdout.trim()
        return truncate(output || "(no matches)", maxOutputChars)
      } catch (error) {
        const message = (error as Error).message || "rg failed"
        return `Error: search failed (${message})`
      }
    }
    case "search_text": {
      const pattern = coerceString(call.args.pattern)
      if (!pattern) return "Error: search_text requires a pattern."
      const searchPath = resolveSafePath(options.repoRoot, coerceString(call.args.path) || ".")
      const globs = coerceStringArray(call.args.globs)
      const literal = toBoolean(call.args.literal, false)
      const caseSensitiveRaw = call.args.case_sensitive ?? call.args.caseSensitive
      const maxMatches = Math.min(
        Math.max(1, toNumber(call.args.max_matches ?? call.args.maxMatches, 200)),
        1000
      )

      const args = ["--no-heading", "--line-number", "--column", "--max-count", String(maxMatches)]
      if (literal) args.push("-F")
      if (caseSensitiveRaw !== undefined) {
        if (toBoolean(caseSensitiveRaw, false)) {
          args.push("-s")
        } else {
          args.push("-i")
        }
      }
      for (const glob of globs) {
        args.push("-g", glob)
      }
      args.push("--", pattern, searchPath)

      try {
        const { stdout } = await execFileAsync("rg", args, {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024,
        })
        const output = stdout.trim()
        return truncate(output || "(no matches)", maxOutputChars)
      } catch (error) {
        const err = error as Error & { stdout?: string; stderr?: string; code?: number }
        const output = (err.stdout || "").trim()
        if (err.code === 1 && output === "") {
          return "(no matches)"
        }
        const message = err.stderr?.trim() || err.message || "rg failed"
        return `Error: search_text failed (${message})`
      }
    }
    case "stat": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path))
      const stats = await fs.lstat(target)
      const payload = {
        path: path.relative(options.repoRoot, target),
        size: stats.size,
        mode: stats.mode,
        mtime: stats.mtime.toISOString(),
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        isSymbolicLink: stats.isSymbolicLink(),
      }
      return JSON.stringify(payload, null, 2)
    }
    case "hash_file": {
      const target = resolveSafePath(options.repoRoot, coerceString(call.args.path))
      const buffer = await fs.readFile(target)
      const hash = crypto.createHash("sha256").update(buffer).digest("hex")
      return `${hash}  ${path.relative(options.repoRoot, target)}`
    }
    case "git_status": {
      try {
        const { stdout } = await execFileAsync("git", ["status", "-sb"], {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024,
        })
        return truncate(stdout.trim() || "(no output)", maxOutputChars)
      } catch (error) {
        const message = (error as Error & { stderr?: string }).stderr || (error as Error).message
        return `Error: git_status failed (${message})`
      }
    }
    case "git_diff": {
      const staged = toBoolean(call.args.staged, false)
      const target = coerceString(call.args.path)
      const args = ["diff", "--no-color"]
      if (staged) args.push("--staged")
      if (target) args.push("--", target)
      try {
        const { stdout } = await execFileAsync("git", args, {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024,
        })
        return truncate(stdout.trim() || "(no diff)", maxOutputChars)
      } catch (error) {
        const message = (error as Error & { stderr?: string }).stderr || (error as Error).message
        return `Error: git_diff failed (${message})`
      }
    }
    case "git_log": {
      const max = Math.min(Math.max(1, toNumber(call.args.max, 20)), 200)
      const target = coerceString(call.args.path)
      const args = ["log", "--oneline", "-n", String(max)]
      if (target) args.push("--", target)
      try {
        const { stdout } = await execFileAsync("git", args, {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024,
        })
        return truncate(stdout.trim() || "(no commits)", maxOutputChars)
      } catch (error) {
        const message = (error as Error & { stderr?: string }).stderr || (error as Error).message
        return `Error: git_log failed (${message})`
      }
    }
    case "git_show": {
      const ref = coerceString(call.args.ref) || "HEAD"
      const args = ["show", "--no-color", ref]
      try {
        const { stdout } = await execFileAsync("git", args, {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024,
        })
        return truncate(stdout.trim() || "(no output)", maxOutputChars)
      } catch (error) {
        const message = (error as Error & { stderr?: string }).stderr || (error as Error).message
        return `Error: git_show failed (${message})`
      }
    }
    case "git_branches": {
      try {
        const { stdout } = await execFileAsync("git", ["branch", "--all", "--no-color"], {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024,
        })
        return truncate(stdout.trim() || "(no branches)", maxOutputChars)
      } catch (error) {
        const message = (error as Error & { stderr?: string }).stderr || (error as Error).message
        return `Error: git_branches failed (${message})`
      }
    }
    case "http_get": {
      if (!options.allowNetwork) {
        return "Error: http_get tool is disabled. Re-run with --allow-network to enable."
      }
      const url = coerceString(call.args.url)
      if (!url) return "Error: http_get requires a url."
      if (!/^https?:\/\//i.test(url)) return "Error: http_get only supports http/https URLs."

      const res = await fetch(url, {
        headers: { "User-Agent": "crowepilot-tool-runner" },
      })
      const contentLength = Number(res.headers.get("content-length") || 0)
      if (contentLength && contentLength > maxDownloadBytes) {
        return `Error: response too large (${contentLength} bytes).`
      }
      const text = await res.text()
      if (!res.ok) {
        return truncate(`Error: HTTP ${res.status}\n${text}`, maxOutputChars)
      }
      return truncate(text, maxOutputChars)
    }
    case "shell": {
      if (!options.allowShell) {
        return "Error: shell tool is disabled. Re-run with --allow-shell to enable."
      }
      const command = coerceString(call.args.command)
      if (!command) return "Error: shell tool requires a command."
      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: options.repoRoot,
          maxBuffer: 1024 * 1024,
        })
        const combined = [stdout?.trim(), stderr?.trim()].filter(Boolean).join("\n")
        return truncate(combined || "(no output)", maxOutputChars)
      } catch (error) {
        const err = error as Error & { stdout?: string; stderr?: string }
        const combined = [err.stdout?.trim(), err.stderr?.trim(), err.message]
          .filter(Boolean)
          .join("\n")
        return truncate(combined || "Error: shell command failed.", maxOutputChars)
      }
    }
    default:
      return `Error: unknown tool '${call.name}'`
  }
}

export async function runWithTools(options: ToolRunnerOptions) {
  const messages: ChatMessage[] = []
  const systemPrompt = buildToolSystemPromptWithOptions(options.system, {
    allowShell: options.allowShell ?? false,
    allowDelete: options.allowDelete ?? false,
    allowNetwork: options.allowNetwork ?? false,
  })
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt })
  messages.push({ role: "user", content: options.prompt })

  const maxSteps = options.maxSteps ?? 8

  for (let step = 0; step < maxSteps; step += 1) {
    const assistantContent = await chatWithOllama({
      baseUrl: options.baseUrl,
      model: options.model,
      messages,
      temperature: options.temperature,
    })

    const toolCalls = parseToolCalls(assistantContent)
    if (toolCalls.length === 0) {
      return assistantContent
    }

    messages.push({ role: "assistant", content: assistantContent })

    for (const call of toolCalls) {
      let result: string
      try {
        result = await runTool(call, {
          repoRoot: options.repoRoot,
          allowShell: options.allowShell,
          allowDelete: options.allowDelete,
          allowNetwork: options.allowNetwork,
          maxOutputChars: options.maxOutputChars,
          maxFileChars: options.maxFileChars,
          maxDownloadBytes: options.maxDownloadBytes,
        })
      } catch (error) {
        result = `Error: ${(error as Error).message}`
      }

      messages.push({
        role: "user",
        content: `Tool result (${call.name}):\n${result}`,
      })
    }
  }

  throw new Error("Tool runner exceeded max steps without a final response.")
}
