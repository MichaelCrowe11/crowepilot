import type { CommandModule } from "yargs"
import chalk from "chalk"
import path from "path"
import fs from "fs/promises"
import {
  OPENCODE_CONFIG_DIR,
  OPENCODE_CONFIG_FILE,
  DEFAULT_MODEL,
  DEFAULT_AGENT,
} from "../config/constants"
import {
  CUSTODIAN_DEFAULT_MODEL,
  CUSTODIAN_DEFAULT_PORT,
  CUSTODIAN_OLLAMA_URL,
  CUSTODIAN_SYSTEM_PROMPT,
} from "../custodian/constants"

const DEFAULT_CONFIG = {
  $schema: "https://opencode.ai/config.json",
  model: DEFAULT_MODEL,
  default_agent: DEFAULT_AGENT,
  agent: {
    build: {
      description: "Full development access - can read, write, and execute code",
    },
    plan: {
      description: "Read-only analysis mode - explores and plans without making changes",
    },
  },
  permission: {
    edit: "ask",
    bash: "ask",
  },
}

const DEFAULT_CUSTODIAN_CONFIG = {
  model: CUSTODIAN_DEFAULT_MODEL,
  port: CUSTODIAN_DEFAULT_PORT,
  autostart: true,
  systemPrompt: CUSTODIAN_SYSTEM_PROMPT,
  ollamaBaseUrl: CUSTODIAN_OLLAMA_URL,
  contextMaxFiles: 200,
  contextMaxChars: 6000,
}

export const initCommand: CommandModule = {
  command: "init",
  describe: "Initialize CrowePilot in current directory",
  builder: (yargs) =>
    yargs
      .option("force", {
        alias: "f",
        type: "boolean",
        description: "Overwrite existing configuration",
        default: false,
      })
      .option("minimal", {
        type: "boolean",
        description: "Create minimal configuration",
        default: false,
      }),
  handler: async (argv) => {
    const cwd = process.cwd()
    const configDir = path.join(cwd, OPENCODE_CONFIG_DIR)
    const configFile = path.join(configDir, OPENCODE_CONFIG_FILE)

    console.log(chalk.cyan("\nInitializing CrowePilot...\n"))

    // Check if already initialized
    const configExists = await fs
      .access(configFile)
      .then(() => true)
      .catch(() => false)
    if (configExists && !argv.force) {
      console.log(chalk.yellow("CrowePilot already initialized in this directory."))
      console.log(chalk.dim("Use --force to overwrite existing configuration."))
      return
    }

    // Create .opencode directory structure
    await fs.mkdir(path.join(configDir, "agents"), { recursive: true })
    await fs.mkdir(path.join(configDir, "commands"), { recursive: true })

    // Write config file
    const config = argv.minimal
      ? { $schema: "https://opencode.ai/config.json", model: DEFAULT_MODEL }
      : DEFAULT_CONFIG

    await fs.writeFile(configFile, JSON.stringify(config, null, 2))
    console.log(chalk.green("✓"), "Created", chalk.dim(configFile))

    // Create .crowepilot custodian config if missing
    const custodianDir = path.join(cwd, ".crowepilot")
    const custodianConfigFile = path.join(custodianDir, "custodian.json")
    const custodianExists = await fs
      .access(custodianConfigFile)
      .then(() => true)
      .catch(() => false)
    if (!custodianExists) {
      await fs.mkdir(custodianDir, { recursive: true })
      await fs.writeFile(custodianConfigFile, JSON.stringify(DEFAULT_CUSTODIAN_CONFIG, null, 2))
      console.log(chalk.green("✓"), "Created", chalk.dim(custodianConfigFile))
    }

    // Create example agent
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
`

    await fs.writeFile(path.join(configDir, "agents", "custom.md"), exampleAgent)
    console.log(chalk.green("✓"), "Created example agent", chalk.dim(".opencode/agents/custom.md"))

    // Create example command
    const exampleCommand = `---
description: Run tests and show coverage
agent: build
---

Run the test suite with coverage reporting. Analyze any failures and suggest fixes.
`

    await fs.writeFile(path.join(configDir, "commands", "test.md"), exampleCommand)
    console.log(
      chalk.green("✓"),
      "Created example command",
      chalk.dim(".opencode/commands/test.md")
    )

    // Update .gitignore if it exists
    const gitignorePath = path.join(cwd, ".gitignore")
    const gitignoreExists = await fs
      .access(gitignorePath)
      .then(() => true)
      .catch(() => false)
    if (gitignoreExists) {
      const content = await fs.readFile(gitignorePath, "utf-8")
      if (!content.includes(".opencode")) {
        await fs.writeFile(gitignorePath, content + "\n# OpenCode/CrowePilot\n.opencode/\n")
        console.log(chalk.green("✓"), "Updated", chalk.dim(".gitignore"))
      }
    }

    console.log()
    console.log(chalk.green("CrowePilot initialized successfully!"))
    console.log()
    console.log(chalk.dim("Next steps:"))
    console.log(chalk.dim("  1. Edit .opencode/opencode.json to customize settings"))
    console.log(chalk.dim("  2. Create custom agents in .opencode/agents/"))
    console.log(chalk.dim("  3. Create custom commands in .opencode/commands/"))
    console.log(chalk.dim("  4. Run 'crowepilot' to start coding"))
    console.log()
  },
}
