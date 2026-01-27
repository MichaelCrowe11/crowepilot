import type { CommandModule } from "yargs"
import chalk from "chalk"
import inquirer from "inquirer"
import fs from "fs/promises"
import path from "path"
import {
  loadCustodianConfig,
  setCustodianConfigValue,
  getCustodianConfigPaths,
  writeCustodianConfig,
} from "../custodian/config"
import {
  ensureCustodianRunning,
  isCustodianHealthy,
  runCustodianRemote,
  runCustodianRequest,
  stopCustodianRemote,
} from "../custodian/client"
import { startCustodianServer } from "../custodian/server"
import {
  installLaunchAgent,
  uninstallLaunchAgent,
  startLaunchAgent,
  stopLaunchAgent,
  getLaunchAgentPath,
} from "../custodian/launchd"
import { CUSTODIAN_PID_FILE } from "../custodian/constants"

const ACTIONS = [
  "run",
  "serve",
  "install",
  "uninstall",
  "start",
  "stop",
  "status",
  "config",
  "setup",
] as const

type Action = (typeof ACTIONS)[number]

type ConfigScope = "merged" | "global" | "local"

interface CustodianArgs {
  action: Action
  prompt?: string[]
  model?: string
  toolModel?: string
  port?: number
  repo?: string
  system?: string
  context?: boolean
  daemon?: boolean
  tools?: boolean
  allowShell?: boolean
  allowDelete?: boolean
  allowNetwork?: boolean
  allowAllTools?: boolean
  scope?: ConfigScope
  key?: string
  value?: string
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function parseValue(raw: string) {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

async function writePidFile() {
  await fs.mkdir(path.dirname(CUSTODIAN_PID_FILE), { recursive: true })
  await fs.writeFile(CUSTODIAN_PID_FILE, String(process.pid))
}

async function removePidFile() {
  await fs.rm(CUSTODIAN_PID_FILE, { force: true })
}

export const custodianCommand: CommandModule = {
  command: "custodian <action> [prompt..]",
  describe: "Manage the CrowePilot custodian (Ollama resident architect)",
  builder: (yargs) =>
    yargs
      .positional("action", {
        describe: "Action to perform",
        choices: ACTIONS,
        type: "string",
      })
      .positional("prompt", {
        describe: "Prompt to send to the custodian",
        type: "string",
        array: true,
      })
      .option("model", {
        type: "string",
        description: "Ollama model to use",
      })
      .option("tool-model", {
        type: "string",
        description: "Ollama model to use when tools are enabled",
      })
      .option("port", {
        type: "number",
        description: "Custodian service port",
      })
      .option("repo", {
        type: "string",
        description: "Repository root for context",
      })
      .option("system", {
        type: "string",
        description: "Override system prompt",
      })
      .option("context", {
        type: "boolean",
        description: "Include repo context",
        default: true,
      })
      .option("daemon", {
        type: "boolean",
        description: "Run in daemon mode",
        default: false,
      })
      .option("tools", {
        type: "boolean",
        description: "Enable XML tool runner for the custodian",
        default: false,
      })
      .option("allow-shell", {
        type: "boolean",
        description: "Allow shell tool execution when tool runner is enabled",
        default: false,
      })
      .option("allow-delete", {
        type: "boolean",
        description: "Allow delete_path tool execution when tool runner is enabled",
        default: false,
      })
      .option("allow-network", {
        type: "boolean",
        description: "Allow network tools (http_get) when tool runner is enabled",
        default: false,
      })
      .option("allow-all-tools", {
        type: "boolean",
        description: "Enable all tool permissions (shell, delete, network)",
        default: false,
      })
      .option("scope", {
        type: "string",
        choices: ["merged", "global", "local"],
        default: "merged",
        description: "Config scope",
      })
      .option("key", {
        type: "string",
        description: "Config key (for config action)",
      })
      .option("value", {
        type: "string",
        description: "Config value (for config action)",
      }),
  handler: async (argv) => {
    const args = argv as unknown as CustodianArgs
    const action = args.action
    const repoRoot = args.repo
    const scope = args.scope || "merged"
    const prompt = args.prompt?.join(" ")

    switch (action) {
      case "setup": {
        const { config } = await loadCustodianConfig({ repoRoot, scope })
        const defaultRepo = repoRoot || config.repoRoot || process.cwd()
        const targetScope = scope === "merged" ? "local" : scope

        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "repoRoot",
            message: "Repository root",
            default: defaultRepo,
          },
          {
            type: "input",
            name: "model",
            message: "Ollama model",
            default: config.model,
          },
          {
            type: "input",
            name: "toolModel",
            message: "Tool model (for tool runner)",
            default: config.toolModel,
          },
          {
            type: "number",
            name: "port",
            message: "Custodian port",
            default: config.port,
          },
          {
            type: "confirm",
            name: "autostart",
            message: "Autostart custodian with CrowePilot?",
            default: config.autostart,
          },
          {
            type: "input",
            name: "ollamaBaseUrl",
            message: "Ollama base URL",
            default: config.ollamaBaseUrl,
          },
          {
            type: "input",
            name: "systemPrompt",
            message: "System prompt",
            default: config.systemPrompt,
          },
          {
            type: "number",
            name: "contextMaxFiles",
            message: "Max files for context",
            default: config.contextMaxFiles,
          },
          {
            type: "number",
            name: "contextMaxChars",
            message: "Max chars for context",
            default: config.contextMaxChars,
          },
        ])

        const normalized = {
          model: answers.model,
          toolModel: answers.toolModel,
          port: toNumber(answers.port, config.port),
          autostart: Boolean(answers.autostart),
          ollamaBaseUrl: answers.ollamaBaseUrl,
          systemPrompt: answers.systemPrompt,
          contextMaxFiles: toNumber(answers.contextMaxFiles, config.contextMaxFiles),
          contextMaxChars: toNumber(answers.contextMaxChars, config.contextMaxChars),
        }

        const targetPath = await writeCustodianConfig({
          repoRoot: answers.repoRoot,
          scope: targetScope,
          config: normalized as unknown as Record<string, unknown>,
        })

        console.log(chalk.green("✓"), "Custodian config updated")
        console.log(chalk.dim(targetPath))
        return
      }

      case "run": {
        const { config } = await loadCustodianConfig({ repoRoot, scope })
        const port = args.port ?? config.port
        const model = args.model ?? config.model
        const toolModel = args.toolModel ?? config.toolModel
        const systemPrompt = args.system ?? config.systemPrompt
        const includeContext = args.context ?? true
        const useTools = args.tools ?? false
        const allowAllTools = args.allowAllTools ?? false
        const allowShell = allowAllTools || (args.allowShell ?? false)
        const allowDelete = allowAllTools || (args.allowDelete ?? false)
        const allowNetwork = allowAllTools || (args.allowNetwork ?? false)

        try {
          let response: string

          if (await isCustodianHealthy(port)) {
            response = await runCustodianRemote({
              port,
              prompt,
              repoRoot: repoRoot || config.repoRoot,
              model,
              toolModel,
              systemPrompt,
              includeContext,
              useTools,
              allowShell,
              allowDelete,
              allowNetwork,
            })
          } else {
            response = await runCustodianRequest({
              prompt,
              repoRoot: repoRoot || config.repoRoot,
              model,
              toolModel,
              systemPrompt,
              includeContext,
              useTools,
              allowShell,
              allowDelete,
              allowNetwork,
            })
          }

          console.log(response)
          return
        } catch (error) {
          console.error(chalk.red("Custodian failed:"), (error as Error).message)
          console.error(chalk.dim("Ensure Ollama is running (try: `ollama serve`)."))
          process.exit(1)
        }
        break
      }

      case "serve": {
        const { config } = await loadCustodianConfig({ repoRoot, scope })
        const port = args.port ?? config.port
        const model = args.model ?? config.model
        const toolModel = args.toolModel ?? config.toolModel
        const systemPrompt = args.system ?? config.systemPrompt
        const includeContext = args.context ?? true
        const useTools = args.tools ?? false
        const allowAllTools = args.allowAllTools ?? false
        const allowShell = allowAllTools || (args.allowShell ?? false)
        const allowDelete = allowAllTools || (args.allowDelete ?? false)
        const allowNetwork = allowAllTools || (args.allowNetwork ?? false)

        const { server } = await startCustodianServer({
          repoRoot: repoRoot || config.repoRoot,
          port,
          model,
          toolModel,
          systemPrompt,
          includeContext,
          useTools,
          allowShell,
          allowDelete,
          allowNetwork,
        })

        if (args.daemon) {
          await writePidFile()
        } else {
          console.log(chalk.green("Custodian listening on"), chalk.dim(`http://127.0.0.1:${port}`))
        }

        const shutdown = async () => {
          server.close()
          await removePidFile()
          process.exit(0)
        }

        process.on("SIGINT", shutdown)
        process.on("SIGTERM", shutdown)
        return
      }

      case "install": {
        if (process.platform !== "darwin") {
          console.error(chalk.red("Launchd install is only supported on macOS."))
          process.exit(1)
        }

        const { config } = await loadCustodianConfig({ repoRoot, scope })
        const port = args.port ?? config.port
        const model = args.model ?? config.model
        const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : process.execPath

        const { plistPath, stdoutPath, stderrPath } = await installLaunchAgent({
          nodePath: process.execPath,
          entryPath,
          repoRoot: repoRoot || config.repoRoot,
          model,
          port,
        })

        console.log(chalk.green("✓"), "Launch agent installed")
        console.log(chalk.dim(plistPath))
        console.log(chalk.dim("Logs:"), stdoutPath, stderrPath)
        return
      }

      case "uninstall": {
        if (process.platform !== "darwin") {
          console.error(chalk.red("Launchd uninstall is only supported on macOS."))
          process.exit(1)
        }

        const plistPath = await uninstallLaunchAgent()
        console.log(chalk.green("✓"), "Launch agent removed")
        console.log(chalk.dim(plistPath))
        return
      }

      case "start": {
        if (process.platform === "darwin" && (await fileExists(getLaunchAgentPath()))) {
          await startLaunchAgent()
          console.log(chalk.green("✓"), "Custodian started via launchd")
          return
        }

        const { config } = await loadCustodianConfig({ repoRoot, scope })
        const started = await ensureCustodianRunning({
          repoRoot: repoRoot || config.repoRoot,
          model: args.model ?? config.model,
          port: args.port ?? config.port,
        })

        if (started) {
          console.log(chalk.green("✓"), "Custodian started")
        } else {
          process.exit(1)
        }
        return
      }

      case "stop": {
        if (process.platform === "darwin" && (await fileExists(getLaunchAgentPath()))) {
          await stopLaunchAgent()
          console.log(chalk.green("✓"), "Custodian stopped via launchd")
          return
        }

        const { config } = await loadCustodianConfig({ repoRoot, scope })
        const port = args.port ?? config.port
        await stopCustodianRemote(port)
        await removePidFile()
        console.log(chalk.green("✓"), "Custodian stop requested")
        return
      }

      case "status": {
        const { config } = await loadCustodianConfig({ repoRoot, scope })
        const port = args.port ?? config.port
        const healthy = await isCustodianHealthy(port)
        if (healthy) {
          console.log(chalk.green("✓"), `Custodian healthy on port ${port}`)
        } else {
          console.log(chalk.yellow("Custodian not responding on port"), port)
        }
        return
      }

      case "config": {
        const subAction = args.prompt?.[0] || "list"
        const configKey = args.key || args.prompt?.[1]
        const configValue = args.value || args.prompt?.[2]

        if (subAction === "path") {
          const paths = getCustodianConfigPaths(repoRoot)
          console.log(chalk.cyan("Custodian config paths:"))
          console.log(chalk.dim("Global:"), paths.global)
          console.log(chalk.dim("Local:"), paths.local)
          return
        }

        if (subAction === "list") {
          const { config } = await loadCustodianConfig({ repoRoot, scope })
          console.log(JSON.stringify(config, null, 2))
          return
        }

        if (subAction === "get") {
          if (!configKey) {
            console.error(chalk.red("Config key is required"))
            process.exit(1)
          }

          const { config } = await loadCustodianConfig({ repoRoot, scope })
          const keys = configKey.split(".")
          let value: unknown = config

          for (const k of keys) {
            if (value && typeof value === "object" && k in (value as Record<string, unknown>)) {
              value = (value as Record<string, unknown>)[k]
            } else {
              console.log(chalk.yellow(`Key '${configKey}' not found`))
              return
            }
          }

          console.log(typeof value === "object" ? JSON.stringify(value, null, 2) : value)
          return
        }

        if (subAction === "set") {
          if (!configKey || configValue === undefined) {
            console.error(chalk.red("Config key and value are required"))
            process.exit(1)
          }

          const targetPath = await setCustodianConfigValue({
            repoRoot,
            scope: scope === "merged" ? "local" : scope,
            key: configKey,
            value: parseValue(configValue),
          })

          console.log(chalk.green("✓"), "Updated config")
          console.log(chalk.dim(targetPath))
          return
        }

        if (subAction === "init") {
          const { config } = await loadCustodianConfig({ repoRoot, scope })
          const targetPath = await writeCustodianConfig({
            repoRoot,
            scope: scope === "merged" ? "local" : scope,
            config: config as unknown as Record<string, unknown>,
          })
          console.log(chalk.green("✓"), "Custodian config created")
          console.log(chalk.dim(targetPath))
          return
        }

        console.error(chalk.red(`Unknown config action: ${subAction}`))
        process.exit(1)
        break
      }

      default:
        console.error(chalk.red(`Unknown action: ${action}`))
        process.exit(1)
    }
  },
}
