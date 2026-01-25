#!/usr/bin/env node
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import chalk from "chalk"
import { chatCommand } from "./commands/chat"
import { initCommand } from "./commands/init"
import { configCommand } from "./commands/config"
import { custodianCommand } from "./commands/custodian"
import { VERSION, BANNER } from "./config/constants"

const cli = yargs(hideBin(process.argv))
  .scriptName("crowepilot")
  .usage(BANNER + "\n\nUsage: $0 <command> [options]")
  .command(chatCommand)
  .command(initCommand)
  .command(configCommand)
  .command(custodianCommand)
  .command(
    "$0 [prompt..]",
    "Start an AI coding session (default command)",
    (yargs) =>
      yargs.positional("prompt", {
        describe: "Initial prompt to send",
        type: "string",
        array: true,
      }),
    async (argv) => {
      const prompt = argv.prompt?.join(" ")
      const { startSession } = await import("./commands/chat")
      await startSession({
        prompt,
        model: argv.model as string | undefined,
        agent: argv.agent as string | undefined,
        verbose: argv.verbose as boolean | undefined,
      })
    }
  )
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .option("model", {
    alias: "m",
    type: "string",
    description: "Model to use (e.g., anthropic/claude-sonnet-4-20250514)",
  })
  .option("agent", {
    alias: "a",
    type: "string",
    description: "Agent to use (build, plan, or custom)",
  })
  .version(VERSION)
  .help()
  .alias("h", "help")
  .epilog(chalk.dim("CroweLogic AI Coding Assistant - https://crowelogic.com"))
  .strict()
  .fail((msg, err, yargs) => {
    if (err) {
      console.error(chalk.red("Error:"), err.message)
      process.exit(1)
    }
    console.error(chalk.red("Error:"), msg)
    console.error()
    yargs.showHelp()
    process.exit(1)
  })

cli.parse()
