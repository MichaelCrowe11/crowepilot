import os from "os"
import path from "path"

export const CUSTODIAN_DEFAULT_MODEL = "Mcrowe1210/DeepParallel"
export const CUSTODIAN_TOOL_MODEL = "gpt-oss:latest"
export const CUSTODIAN_DEFAULT_PORT = 5123
export const CUSTODIAN_OLLAMA_URL = "http://127.0.0.1:11434"

export const CUSTODIAN_LABEL = "com.crowelogic.crowepilot.custodian"

export const CUSTODIAN_CONFIG_DIR_GLOBAL = path.join(os.homedir(), ".config", "crowepilot")
export const CUSTODIAN_CONFIG_FILE_GLOBAL = path.join(CUSTODIAN_CONFIG_DIR_GLOBAL, "custodian.json")
export const CUSTODIAN_PID_FILE = path.join(CUSTODIAN_CONFIG_DIR_GLOBAL, "custodian.pid")

export const CUSTODIAN_LOG_DIR = path.join(os.homedir(), "Library", "Logs", "crowepilot")

export const CUSTODIAN_SYSTEM_PROMPT =
  "You are the CrowePilot Custodian and Architect. " +
  "Your job is to safeguard code quality, guide architecture, and propose optimizations. " +
  "Be decisive, practical, and concise. " +
  "When unsure, ask the smallest number of clarifying questions."
