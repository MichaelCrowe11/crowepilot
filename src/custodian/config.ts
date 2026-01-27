import fs from "fs/promises"
import path from "path"
import {
  CUSTODIAN_CONFIG_FILE_GLOBAL,
  CUSTODIAN_CONFIG_DIR_GLOBAL,
  CUSTODIAN_DEFAULT_MODEL,
  CUSTODIAN_DEFAULT_PORT,
  CUSTODIAN_OLLAMA_URL,
  CUSTODIAN_SYSTEM_PROMPT,
  CUSTODIAN_TOOL_MODEL,
} from "./constants"

export interface CustodianConfig {
  model: string
  toolModel: string
  port: number
  repoRoot: string
  autostart: boolean
  systemPrompt: string
  ollamaBaseUrl: string
  contextMaxFiles: number
  contextMaxChars: number
}

export type ConfigScope = "merged" | "global" | "local"

const DEFAULTS: Omit<CustodianConfig, "repoRoot"> = {
  model: CUSTODIAN_DEFAULT_MODEL,
  toolModel: CUSTODIAN_TOOL_MODEL,
  port: CUSTODIAN_DEFAULT_PORT,
  autostart: true,
  systemPrompt: CUSTODIAN_SYSTEM_PROMPT,
  ollamaBaseUrl: CUSTODIAN_OLLAMA_URL,
  contextMaxFiles: 200,
  contextMaxChars: 6000,
}

function getLocalConfigPath(repoRoot: string) {
  return path.join(repoRoot, ".crowepilot", "custodian.json")
}

async function readJsonFile(filePath: string): Promise<Record<string, unknown>> {
  const content = await fs.readFile(filePath, "utf-8")
  return JSON.parse(content)
}

async function readIfExists(filePath: string): Promise<Record<string, unknown>> {
  try {
    return await readJsonFile(filePath)
  } catch {
    return {}
  }
}

export async function loadCustodianConfig(options?: {
  repoRoot?: string
  scope?: ConfigScope
}): Promise<{ config: CustodianConfig; paths: { global: string; local: string } }> {
  const repoRoot = options?.repoRoot || process.cwd()
  const scope = options?.scope || "merged"

  const globalPath = CUSTODIAN_CONFIG_FILE_GLOBAL
  const localPath = getLocalConfigPath(repoRoot)

  const globalConfig = scope === "local" ? {} : await readIfExists(globalPath)
  const localConfig = scope === "global" ? {} : await readIfExists(localPath)

  const merged = {
    ...DEFAULTS,
    ...globalConfig,
    ...localConfig,
    repoRoot,
  } as CustodianConfig

  return { config: merged, paths: { global: globalPath, local: localPath } }
}

export async function writeCustodianConfig(options: {
  repoRoot?: string
  scope?: Exclude<ConfigScope, "merged">
  config: Record<string, unknown>
}) {
  const repoRoot = options.repoRoot || process.cwd()
  const scope = options.scope || "local"
  const targetPath =
    scope === "global" ? CUSTODIAN_CONFIG_FILE_GLOBAL : getLocalConfigPath(repoRoot)
  const targetDir = path.dirname(targetPath)

  const sanitized = { ...options.config }
  delete (sanitized as Record<string, unknown>).repoRoot

  await fs.mkdir(targetDir, { recursive: true })
  await fs.writeFile(targetPath, JSON.stringify(sanitized, null, 2))

  return targetPath
}

export async function setCustodianConfigValue(options: {
  repoRoot?: string
  scope?: Exclude<ConfigScope, "merged">
  key: string
  value: unknown
}) {
  const repoRoot = options.repoRoot || process.cwd()
  const scope = options.scope || "local"
  const { config } = await loadCustodianConfig({ repoRoot, scope })

  const keys = options.key.split(".")
  let current: Record<string, unknown> = config as unknown as Record<string, unknown>

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (!(k in current) || typeof current[k] !== "object" || current[k] === null) {
      current[k] = {}
    }
    current = current[k] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = options.value

  const targetPath = await writeCustodianConfig({
    repoRoot,
    scope,
    config: config as unknown as Record<string, unknown>,
  })

  return targetPath
}

export function getCustodianConfigPaths(repoRoot?: string) {
  const root = repoRoot || process.cwd()
  return {
    global: CUSTODIAN_CONFIG_FILE_GLOBAL,
    local: getLocalConfigPath(root),
  }
}

export function getCustodianConfigDir() {
  return CUSTODIAN_CONFIG_DIR_GLOBAL
}
