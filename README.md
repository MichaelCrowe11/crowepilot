# CrowePilot

AI-powered coding assistant and CLI for CroweLogic, now with an embedded Ollama custodian/architect.

## Quick start

```bash
npm install
npm run build
./bin/crowepilot.js chat "Start a new session"
```

## Custodian (Ollama resident architect)

The custodian is a local service that can review architecture, propose optimizations, and act as a guardrail.

### One-off run

```bash
./bin/crowepilot.js custodian run "Audit this repo and propose optimizations"
```

### Start a foreground service

```bash
./bin/crowepilot.js custodian serve
```

### Install always-on service (macOS launchd)

```bash
./bin/crowepilot.js custodian install
./bin/crowepilot.js custodian status
```

Logs live at:

- `~/Library/Logs/crowepilot/custodian.out.log`
- `~/Library/Logs/crowepilot/custodian.err.log`

### Stop or uninstall

```bash
./bin/crowepilot.js custodian stop
./bin/crowepilot.js custodian uninstall
```

### Config

Local config: `.crowepilot/custodian.json`

```bash
./bin/crowepilot.js custodian config list
./bin/crowepilot.js custodian config set model "Mcrowe1210/DeepParallel"
./bin/crowepilot.js custodian config set port 5123
```

### Requirements

- Ollama running locally (`ollama serve`)
- Default model: `Mcrowe1210/DeepParallel`

Disable autostart for the custodian:

```bash
CROWEPILOT_CUSTODIAN_AUTOSTART=0 ./bin/crowepilot.js chat
```

## Development

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:smoke
```

## Release

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

This updates `package.json`/`package-lock.json`, prepends `CHANGELOG.md`, commits, and tags the release.
