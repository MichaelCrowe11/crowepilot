import { spawn } from "child_process"
import path from "path"
import { loadCustodianConfig } from "./config"
import { generateWithOllama } from "./ollama"
import { buildRepoContext } from "./context"
import { runWithTools } from "./tool-runner"

interface ClientRunOptions {
  prompt?: string
  repoRoot?: string
  model?: string
  systemPrompt?: string
  includeContext?: boolean
  useTools?: boolean
  allowShell?: boolean
  allowDelete?: boolean
  allowNetwork?: boolean
}

interface EnsureOptions {
  repoRoot?: string
  model?: string
  port?: number
  quiet?: boolean
}

function getBaseUrl(port: number) {
  return `http://127.0.0.1:${port}`
}

async function fetchJson(url: string, options?: RequestInit, timeoutMs = 1500) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export async function isCustodianHealthy(port: number) {
  const data = await fetchJson(`${getBaseUrl(port)}/health`)
  return Boolean(data?.status === "ok")
}

export async function runCustodianRequest(options: ClientRunOptions) {
  const { config } = await loadCustodianConfig({ repoRoot: options.repoRoot })
  const repoRoot = options.repoRoot || config.repoRoot
  const model = options.model || config.model
  const systemPrompt = options.systemPrompt || config.systemPrompt
  const includeContext = options.includeContext ?? true
  const useTools = options.useTools ?? false
  const allowShell = options.allowShell ?? false
  const allowDelete = options.allowDelete ?? false
  const allowNetwork = options.allowNetwork ?? false

  const context = includeContext
    ? await buildRepoContext(repoRoot, {
        maxFiles: config.contextMaxFiles,
        maxChars: config.contextMaxChars,
      })
    : ""

  const prompt = options.prompt?.trim() || "Provide an architectural review and optimization plan."
  const composedPrompt = context ? `Context:\n${context}\n\nRequest:\n${prompt}` : prompt

  if (useTools) {
    return runWithTools({
      baseUrl: config.ollamaBaseUrl,
      model,
      prompt: composedPrompt,
      system: systemPrompt,
      repoRoot,
      allowShell,
      allowDelete,
      allowNetwork,
    })
  }

  return generateWithOllama({
    baseUrl: config.ollamaBaseUrl,
    model,
    prompt: composedPrompt,
    system: systemPrompt,
  })
}

export async function runCustodianRemote(options: ClientRunOptions & { port: number }) {
  const payload = {
    prompt: options.prompt,
    repoRoot: options.repoRoot,
    model: options.model,
    systemPrompt: options.systemPrompt,
    includeContext: options.includeContext,
    useTools: options.useTools,
    allowShell: options.allowShell,
    allowDelete: options.allowDelete,
    allowNetwork: options.allowNetwork,
  }

  const data = await fetchJson(
    `${getBaseUrl(options.port)}/run`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    60000
  )

  if (!data?.response) {
    throw new Error("Custodian service did not return a response")
  }

  return String(data.response)
}

export async function ensureCustodianRunning(options: EnsureOptions = {}) {
  const { config } = await loadCustodianConfig({ repoRoot: options.repoRoot })
  const port = options.port ?? config.port

  if (await isCustodianHealthy(port)) return true

  const entryCandidate = process.argv[1]
  const entryPath =
    entryCandidate && entryCandidate.endsWith(".js") ? path.resolve(entryCandidate) : null
  const nodePath = entryPath ? process.execPath : "crowepilot"
  const args = entryPath
    ? [entryPath, "custodian", "serve", "--daemon", "--port", String(port)]
    : ["custodian", "serve", "--daemon", "--port", String(port)]

  if (options.repoRoot || config.repoRoot) {
    args.push("--repo", options.repoRoot || config.repoRoot)
  }

  if (options.model || config.model) {
    args.push("--model", options.model || config.model)
  }

  const child = spawn(nodePath, args, {
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      CROWEPILOT_CUSTODIAN_AUTOSTART: "0",
    },
  })

  child.unref()

  for (let attempt = 0; attempt < 6; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (await isCustodianHealthy(port)) return true
  }

  if (!options.quiet) {
    console.error("Custodian failed to start on port", port)
  }

  return false
}

export async function stopCustodianRemote(port: number) {
  await fetchJson(`${getBaseUrl(port)}/shutdown`, { method: "POST" }, 2000)
}
