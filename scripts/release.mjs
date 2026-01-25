import fs from "fs"
import { execSync } from "child_process"

function usage() {
  console.log("Usage: npm run release:patch|release:minor|release:major")
  console.log("Or: node scripts/release.mjs <patch|minor|major|x.y.z>")
}

function bumpVersion(current, bump) {
  const match = current.match(/^(\d+)\.(\d+)\.(\d+)(.*)?$/)
  if (!match) throw new Error(`Invalid current version: ${current}`)
  let [major, minor, patch] = match.slice(1, 4).map(Number)

  if (bump === "patch") patch += 1
  else if (bump === "minor") {
    minor += 1
    patch = 0
  } else if (bump === "major") {
    major += 1
    minor = 0
    patch = 0
  } else if (/^\d+\.\d+\.\d+/.test(bump)) {
    return bump
  } else {
    throw new Error(`Unknown bump: ${bump}`)
  }

  return `${major}.${minor}.${patch}`
}

function updateChangelog(version) {
  const date = new Date().toISOString().slice(0, 10)
  const entry = `\n## [${version}] - ${date}\n- TBD\n`

  const path = "CHANGELOG.md"
  let content =
    "# Changelog\n\nAll notable changes to this project will be documented in this file.\n"

  if (fs.existsSync(path)) {
    content = fs.readFileSync(path, "utf-8")
  }

  if (!content.includes(`# Changelog`)) {
    content = `# Changelog\n\n${content}`
  }

  const insertAt = content.indexOf("\n## ")
  if (insertAt === -1) {
    fs.writeFileSync(path, content + entry)
  } else {
    const updated = content.slice(0, insertAt) + entry + content.slice(insertAt)
    fs.writeFileSync(path, updated)
  }
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit" })
}

const bump = process.argv[2]
if (!bump) {
  usage()
  process.exit(1)
}

const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"))
const nextVersion = bumpVersion(pkg.version, bump)

run(`npm version ${nextVersion} --no-git-tag-version`)
updateChangelog(nextVersion)

run("git add package.json package-lock.json CHANGELOG.md")
run(`git commit -m "chore(release): v${nextVersion}"`)
run(`git tag v${nextVersion}`)

console.log(`Release ready: v${nextVersion}`)
