// src/commands/chat.ts
import chalk2 from "chalk";
import { spawn } from "child_process";

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
  const opencode = spawn("opencode", args, {
    stdio: "inherit",
    env: {
      ...process.env,
      // Pass through any crowepilot-specific env vars
      CROWEPILOT_VERSION: "0.1.0"
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
    const proc = spawn("which", ["opencode"], {
      stdio: "pipe"
    });
    proc.on("exit", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}
async function installOpenCode() {
  console.log(chalk2.cyan("Installing OpenCode..."));
  return new Promise((resolve, reject) => {
    const proc = spawn("bash", ["-c", "curl -fsSL https://opencode.ai/install | bash"], {
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
  startSession,
  chatCommand
};
