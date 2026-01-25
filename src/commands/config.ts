import type { CommandModule } from "yargs"
import chalk from "chalk"
import path from "path"
import os from "os"
import fs from "fs/promises"
import { spawn } from "child_process"
import { OPENCODE_CONFIG_DIR, OPENCODE_CONFIG_FILE } from "../config/constants"

const GLOBAL_CONFIG_DIR = path.join(os.homedir(), ".config", "opencode")
const GLOBAL_CONFIG_FILE = path.join(GLOBAL_CONFIG_DIR, "opencode.json")

async function fileExists(filePath: string): Promise<boolean> {
  return fs
    .access(filePath)
    .then(() => true)
    .catch(() => false)
}

async function readJsonFile(filePath: string): Promise<Record<string, unknown>> {
  const content = await fs.readFile(filePath, "utf-8")
  return JSON.parse(content)
}

export const configCommand: CommandModule = {
  command: "config <action> [key] [value]",
  describe: "Manage CrowePilot configuration",
  builder: (yargs) =>
    yargs
      .positional("action", {
        describe: "Action to perform",
        choices: ["get", "set", "list", "path", "edit"] as const,
        type: "string",
      })
      .positional("key", {
        describe: "Configuration key",
        type: "string",
      })
      .positional("value", {
        describe: "Configuration value",
        type: "string",
      })
      .option("global", {
        alias: "g",
        type: "boolean",
        description: "Use global configuration",
        default: false,
      }),
  handler: async (argv) => {
    const {
      action,
      key,
      value,
      global: useGlobal,
    } = argv as unknown as {
      action: string
      key?: string
      value?: string
      global: boolean
    }

    const configPath = useGlobal
      ? GLOBAL_CONFIG_FILE
      : path.join(process.cwd(), OPENCODE_CONFIG_DIR, OPENCODE_CONFIG_FILE)

    switch (action) {
      case "path": {
        console.log(chalk.cyan("Configuration paths:"))
        console.log()
        console.log(chalk.dim("Global:"), GLOBAL_CONFIG_FILE)
        console.log(
          chalk.dim("Local: "),
          path.join(process.cwd(), OPENCODE_CONFIG_DIR, OPENCODE_CONFIG_FILE)
        )
        break
      }

      case "list": {
        const exists = await fileExists(configPath)
        if (!exists) {
          console.log(chalk.yellow(`No configuration file found at ${configPath}`))
          console.log(chalk.dim("Run 'crowepilot init' to create one."))
          return
        }

        const config = await readJsonFile(configPath)
        console.log(chalk.cyan(`Configuration (${useGlobal ? "global" : "local"}):`))
        console.log()
        console.log(JSON.stringify(config, null, 2))
        break
      }

      case "get": {
        if (!key) {
          console.error(chalk.red("Error: key is required for 'get' action"))
          process.exit(1)
        }

        const exists = await fileExists(configPath)
        if (!exists) {
          console.log(chalk.yellow(`No configuration file found at ${configPath}`))
          return
        }

        const config = await readJsonFile(configPath)
        const keys = key.split(".")
        let result: unknown = config

        for (const k of keys) {
          if (result && typeof result === "object" && k in result) {
            result = (result as Record<string, unknown>)[k]
          } else {
            console.log(chalk.yellow(`Key '${key}' not found`))
            return
          }
        }

        if (typeof result === "object") {
          console.log(JSON.stringify(result, null, 2))
        } else {
          console.log(result)
        }
        break
      }

      case "set": {
        if (!key) {
          console.error(chalk.red("Error: key is required for 'set' action"))
          process.exit(1)
        }
        if (value === undefined) {
          console.error(chalk.red("Error: value is required for 'set' action"))
          process.exit(1)
        }

        // Ensure config directory exists
        const configDir = path.dirname(configPath)
        await fs.mkdir(configDir, { recursive: true })

        // Load or create config
        let config: Record<string, unknown> = {}
        const exists = await fileExists(configPath)
        if (exists) {
          config = await readJsonFile(configPath)
        }

        // Set the value (supports dot notation)
        const keys = key.split(".")
        let current: Record<string, unknown> = config

        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i]
          if (!(k in current) || typeof current[k] !== "object") {
            current[k] = {}
          }
          current = current[k] as Record<string, unknown>
        }

        // Try to parse value as JSON, otherwise use as string
        let parsedValue: unknown
        try {
          parsedValue = JSON.parse(value)
        } catch {
          parsedValue = value
        }

        current[keys[keys.length - 1]] = parsedValue

        // Write config
        await fs.writeFile(configPath, JSON.stringify(config, null, 2))
        console.log(chalk.green("✓"), `Set ${key} = ${value}`)
        break
      }

      case "edit": {
        const editor = process.env.EDITOR || "vim"
        const exists = await fileExists(configPath)

        if (!exists) {
          console.log(chalk.yellow(`No configuration file found at ${configPath}`))
          console.log(chalk.dim("Run 'crowepilot init' to create one."))
          return
        }

        const proc = spawn(editor, [configPath], {
          stdio: "inherit",
        })

        await new Promise<void>((resolve) => {
          proc.on("exit", () => resolve())
        })
        break
      }

      default:
        console.error(chalk.red(`Unknown action: ${action}`))
        process.exit(1)
    }
  },
}
