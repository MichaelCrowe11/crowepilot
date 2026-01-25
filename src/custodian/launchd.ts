import fs from "fs/promises"
import os from "os"
import path from "path"
import { spawn } from "child_process"
import {
  CUSTODIAN_LABEL,
  CUSTODIAN_LOG_DIR,
  CUSTODIAN_PID_FILE,
} from "./constants"

function getPlistPath() {
  return path.join(os.homedir(), "Library", "LaunchAgents", `${CUSTODIAN_LABEL}.plist`)
}

function buildPlist(args: {
  nodePath: string
  entryPath: string
  repoRoot?: string
  model?: string
  port: number
}) {
  const programArgs = [
    args.nodePath,
    args.entryPath,
    "custodian",
    "serve",
    "--daemon",
    "--port",
    String(args.port),
  ]

  if (args.repoRoot) {
    programArgs.push("--repo", args.repoRoot)
  }

  if (args.model) {
    programArgs.push("--model", args.model)
  }

  const stdoutPath = path.join(CUSTODIAN_LOG_DIR, "custodian.out.log")
  const stderrPath = path.join(CUSTODIAN_LOG_DIR, "custodian.err.log")

  return {
    plist: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>${CUSTODIAN_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
      ${programArgs.map((arg) => `<string>${arg}</string>`).join("\n      ")}
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${stdoutPath}</string>
    <key>StandardErrorPath</key>
    <string>${stderrPath}</string>
  </dict>
</plist>
`,
    plistPath: getPlistPath(),
    stdoutPath,
    stderrPath,
  }
}

async function runLaunchctl(args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const proc = spawn("launchctl", args, { stdio: "inherit" })
    proc.on("exit", (code) => (code === 0 ? resolve() : reject(new Error("launchctl failed"))))
    proc.on("error", (err) => reject(err))
  })
}

export async function installLaunchAgent(options: {
  nodePath: string
  entryPath: string
  repoRoot?: string
  model?: string
  port: number
}) {
  const { plist, plistPath, stdoutPath, stderrPath } = buildPlist(options)

  await fs.mkdir(path.dirname(plistPath), { recursive: true })
  await fs.mkdir(path.dirname(stdoutPath), { recursive: true })

  await fs.writeFile(plistPath, plist)

  try {
    await runLaunchctl(["unload", plistPath])
  } catch {
    // ignore
  }

  await runLaunchctl(["load", "-w", plistPath])

  return { plistPath, stdoutPath, stderrPath }
}

export async function uninstallLaunchAgent() {
  const plistPath = getPlistPath()
  try {
    await runLaunchctl(["unload", plistPath])
  } catch {
    // ignore
  }
  await fs.rm(plistPath, { force: true })
  await fs.rm(CUSTODIAN_PID_FILE, { force: true })
  return plistPath
}

export async function startLaunchAgent() {
  await runLaunchctl(["start", CUSTODIAN_LABEL])
}

export async function stopLaunchAgent() {
  await runLaunchctl(["stop", CUSTODIAN_LABEL])
}

export function getLaunchAgentPath() {
  return getPlistPath()
}
