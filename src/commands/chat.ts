import type { CommandModule } from "yargs"
import chalk from "chalk"
import { spawn } from "child_process"
import { DEFAULT_MODEL, DEFAULT_AGENT, BANNER, VERSION } from "../config/constants"
import { ensureCustodianRunning } from "../custodian/client"
import { loadCustodianConfig } from "../custodian/config"

interface ChatOptions {
  prompt?: string
  model?: string
  agent?: string
  verbose?: boolean
}

export async function startSession(options: ChatOptions = {}) {
  const { prompt, model, agent, verbose } = options

  // Check if opencode is installed
  const opencodeInstalled = await checkOpenCodeInstalled()

  if (!opencodeInstalled) {
    console.log(chalk.yellow("\nOpenCode not found. Installing..."))
    await installOpenCode()
  }

  console.log(BANNER)
  console.log()
  console.log(chalk.dim("Starting AI coding session..."))
  console.log(chalk.dim(`Model: ${model || DEFAULT_MODEL}`))
  console.log(chalk.dim(`Agent: ${agent || DEFAULT_AGENT}`))
  console.log()

  const custodianEnv = process.env.CROWEPILOT_CUSTODIAN_AUTOSTART
  const allowCustodianAutostart = !(custodianEnv === "0" || custodianEnv === "false")
  let custodianConfig: Awaited<ReturnType<typeof loadCustodianConfig>> | null = null

  if (allowCustodianAutostart) {
    try {
      custodianConfig = await loadCustodianConfig({ repoRoot: process.cwd() })
      if (custodianConfig.config.autostart) {
        await ensureCustodianRunning({
          repoRoot: custodianConfig.config.repoRoot,
          model: custodianConfig.config.model,
          port: custodianConfig.config.port,
          quiet: !verbose,
        })
      }
    } catch (error) {
      if (verbose) {
        console.warn(chalk.yellow("Custodian autostart skipped:"), (error as Error).message)
      }
    }
  }

  // Build opencode command args
  const args: string[] = []

  if (model) {
    args.push("--model", model)
  }

  if (agent) {
    args.push("--agent", agent)
  }

  if (prompt) {
    args.push("--prompt", prompt)
  }

  if (verbose) {
    args.push("--verbose")
  }

  // Spawn opencode process
  const opencode = spawn("opencode", args, {
    stdio: "inherit",
    env: {
      ...process.env,
      // Pass through any crowepilot-specific env vars
      CROWEPILOT_VERSION: VERSION,
      CROWEPILOT_CUSTODIAN_URL: custodianConfig
        ? `http://127.0.0.1:${custodianConfig.config.port}`
        : process.env.CROWEPILOT_CUSTODIAN_URL,
      CROWEPILOT_CUSTODIAN_MODEL: custodianConfig?.config.model || process.env.CROWEPILOT_CUSTODIAN_MODEL,
    },
  })

  opencode.on("error", (err) => {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(chalk.red("\nError: OpenCode binary not found."))
      console.error(chalk.dim("Run: curl -fsSL https://opencode.ai/install | bash"))
      process.exit(1)
    }
    console.error(chalk.red("\nError:"), err.message)
    process.exit(1)
  })

  opencode.on("exit", (code) => {
    process.exit(code ?? 0)
  })
}

async function checkOpenCodeInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("which", ["opencode"], {
      stdio: "pipe",
    })
    proc.on("exit", (code) => resolve(code === 0))
    proc.on("error", () => resolve(false))
  })
}

async function installOpenCode(): Promise<void> {
  console.log(chalk.cyan("Installing OpenCode..."))

  return new Promise((resolve, reject) => {
    const proc = spawn("bash", ["-c", "curl -fsSL https://opencode.ai/install | bash"], {
      stdio: "inherit",
    })

    proc.on("exit", (code) => {
      if (code !== 0) {
        console.error(chalk.red("Failed to install OpenCode"))
        process.exit(1)
      }
      console.log(chalk.green("OpenCode installed successfully!"))
      resolve()
    })

    proc.on("error", (err) => {
      console.error(chalk.red("Failed to install OpenCode:"), err.message)
      process.exit(1)
    })
  })
}

export const chatCommand: CommandModule = {
  command: "chat [prompt..]",
  describe: "Start an interactive AI coding session",
  builder: (yargs) =>
    yargs
      .positional("prompt", {
        describe: "Initial prompt to send to the AI",
        type: "string",
        array: true,
      })
      .option("model", {
        alias: "m",
        type: "string",
        description: "Model to use",
        default: DEFAULT_MODEL,
      })
      .option("agent", {
        alias: "a",
        type: "string",
        description: "Agent mode (build, plan)",
        default: DEFAULT_AGENT,
      }),
  handler: async (argv) => {
    const prompt = (argv.prompt as string[] | undefined)?.join(" ")
    await startSession({
      prompt,
      model: argv.model as string,
      agent: argv.agent as string,
      verbose: argv.verbose as boolean,
    })
  },
}
