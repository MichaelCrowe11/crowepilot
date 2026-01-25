import { execSync } from "child_process"

try {
  execSync("git rev-parse --git-dir", { stdio: "ignore" })
} catch {
  console.error("Not a git repository.")
  process.exit(1)
}

execSync("git config core.hooksPath .githooks", { stdio: "inherit" })
console.log("Git hooks installed.")
