import chalk from "chalk"

export const VERSION = "0.1.0"

export const BANNER = chalk.cyan(`
   ██████╗██████╗  ██████╗ ██╗    ██╗███████╗██████╗ ██╗██╗      ██████╗ ████████╗
  ██╔════╝██╔══██╗██╔═══██╗██║    ██║██╔════╝██╔══██╗██║██║     ██╔═══██╗╚══██╔══╝
  ██║     ██████╔╝██║   ██║██║ █╗ ██║█████╗  ██████╔╝██║██║     ██║   ██║   ██║
  ██║     ██╔══██╗██║   ██║██║███╗██║██╔══╝  ██╔═══╝ ██║██║     ██║   ██║   ██║
  ╚██████╗██║  ██║╚██████╔╝╚███╔███╔╝███████╗██║     ██║███████╗╚██████╔╝   ██║
   ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝ ╚══════╝╚═╝     ╚═╝╚══════╝ ╚═════╝    ╚═╝
`) + chalk.dim(`  v${VERSION} - AI-Powered Coding Assistant`)

export const DEFAULT_MODEL = "anthropic/claude-sonnet-4-20250514"
export const DEFAULT_AGENT = "build"

export const OPENCODE_SERVER_PORT = 4096
export const OPENCODE_SERVER_URL = `http://localhost:${OPENCODE_SERVER_PORT}`

export const OPENCODE_CONFIG_DIR = ".opencode"
export const OPENCODE_CONFIG_FILE = "opencode.json"

export const CROWEPILOT_CONFIG_DIR = ".crowepilot"
export const CROWEPILOT_CONFIG_FILE = "crowepilot.json"
