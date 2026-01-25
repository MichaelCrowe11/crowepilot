import fs from "fs/promises"
import type { Dirent } from "fs"
import path from "path"

const DEFAULT_IGNORES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".cache",
  ".crowepilot",
  ".opencode",
])

interface ContextOptions {
  maxFiles: number
  maxChars: number
}

async function pathExists(filePath: string) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function listFiles(root: string, options: ContextOptions) {
  const results: string[] = []
  const queue: string[] = [root]

  while (queue.length > 0 && results.length < options.maxFiles) {
    const current = queue.shift()
    if (!current) continue

    let entries: Dirent[]
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    } catch {
      continue
    }

    for (const entry of entries) {
      if (results.length >= options.maxFiles) break

      if (DEFAULT_IGNORES.has(entry.name)) continue

      const fullPath = path.join(current, entry.name)
      const relativePath = path.relative(root, fullPath)

      if (entry.isDirectory()) {
        queue.push(fullPath)
        continue
      }

      if (entry.isFile()) {
        results.push(relativePath)
      }
    }
  }

  return results.sort()
}

function truncate(text: string, maxChars: number) {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + "\n..."
}

async function readIfExists(filePath: string, maxChars: number) {
  if (!(await pathExists(filePath))) return null
  const content = await fs.readFile(filePath, "utf-8")
  return truncate(content, maxChars)
}

function summarizePackageJson(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const summary = {
      name: parsed.name,
      version: parsed.version,
      scripts: parsed.scripts ? Object.keys(parsed.scripts as Record<string, string>) : undefined,
      dependencies: parsed.dependencies
        ? Object.keys(parsed.dependencies as Record<string, string>)
        : undefined,
      devDependencies: parsed.devDependencies
        ? Object.keys(parsed.devDependencies as Record<string, string>)
        : undefined,
    }
    return JSON.stringify(summary, null, 2)
  } catch {
    return raw
  }
}

export async function buildRepoContext(repoRoot: string, options: ContextOptions) {
  const safeOptions = {
    maxFiles: Math.max(10, options.maxFiles),
    maxChars: Math.max(1000, options.maxChars),
  }

  const files = await listFiles(repoRoot, safeOptions)

  const packageJsonPath = path.join(repoRoot, "package.json")
  const packageJsonRaw = await readIfExists(packageJsonPath, safeOptions.maxChars)
  const packageJson = packageJsonRaw ? summarizePackageJson(packageJsonRaw) : null

  const readmePath = path.join(repoRoot, "README.md")
  const readme = await readIfExists(readmePath, safeOptions.maxChars)

  const sections: string[] = []
  sections.push(`Repository: ${path.basename(repoRoot)}`)

  if (packageJson) {
    sections.push("\npackage.json summary:\n" + packageJson)
  }

  if (readme) {
    sections.push("\nREADME.md excerpt:\n" + readme)
  }

  if (files.length > 0) {
    sections.push("\nFile list:\n" + files.join("\n"))
  }

  return truncate(sections.join("\n"), safeOptions.maxChars)
}
