# CrowePilot

A command line wrapper around opencode that adds a local service, called the custodian, which sends your repository and a prompt to a model running in Ollama and runs file and git tools the model asks for.

## Status

`working`. Typecheck, lint, format check, build, and the smoke test all pass on 2026-09-10, and one custodian run against a local Ollama model returned a reply. What does not work: the npm package `crowepilot` is not published (the registry returns 404), so `npm install crowepilot` fails. Install from a clone. Last code change 2026-01-26; Dependabot updates were merged through 2026-03-26.

## Install and first run

Requires Node 18 or newer. The custodian requires Ollama running on `http://127.0.0.1:11434` with at least one model pulled. The `chat` command requires the `opencode` binary on your PATH (see Limits).

```bash
git clone https://github.com/MichaelCrowe11/crowepilot
cd crowepilot
npm ci
npm run build
./bin/crowepilot.js --version
```

Output on 2026-09-10 (macOS arm64, Node 26.5.0):

```
ESM Build start
ESM dist/index.js          32.01 KB
ESM dist/chat-RHSGGDWT.js  111.00 B
ESM dist/chunk-5MU3WOIF.js 40.50 KB
ESM Build success in 19ms
DTS Build start
DTS Build success in 613ms
DTS dist/index.d.ts 20.00 B
```

```
0.1.0
```

A one-off custodian run, with repo context off and a model that exists in the local Ollama:

```bash
./bin/crowepilot.js custodian run --context=false --model "Mcrowe1210/gemma-4-mycelium-e4b:latest" "Reply with the single word ok and nothing else."
```

```
ok
```

The checks the CI workflow runs:

```bash
npm run typecheck && npm run lint && npm run format:check && npm run test:smoke
```

All four passed today. `test:smoke` starts a mock Ollama HTTP server, runs `custodian run` against it, and checks the reply (`scripts/smoke-custodian.mjs`).

Steps I did not run today: `chat` (needs opencode), `custodian serve`, `custodian install` (launchd), `custodian setup`, `init`, `config`, and any run with `--tools`.

## What runs today

- `crowepilot --version`, `--help`, `custodian --help`. Code: `src/index.ts`, `src/commands/custodian.ts`.
- `custodian run [prompt]`: builds a text summary of the repo (`src/custodian/context.ts`, default cap 200 files and 6000 characters), then POSTs to Ollama `/api/generate` (`src/custodian/ollama.ts`). Verified with a live Ollama today.
- `custodian run --tools`: switches to Ollama `/api/chat` and a loop of up to 8 steps in which the model replies with `<tool name="...">{json}</tool>` tags and the CLI executes them (`src/custodian/tool-runner.ts`). Tools: list_dir, tree, read_file, write_file, append_file, replace_text, mkdir, copy_file, move_file, stat, hash_file, search and search_text (both call `rg`), git_status, git_diff, git_log, git_show, git_branches. `shell`, `delete_path`, and `http_get` are off unless you pass `--allow-shell`, `--allow-delete`, `--allow-network`, or `--allow-all-tools`. Paths are kept under the repo root by `resolveSafePath`. Not run today.
- `custodian serve`: an HTTP server with `GET /health`, `POST /run`, `POST /shutdown` (`src/custodian/server.ts`). Exercised only by the smoke test today.
- `custodian install|uninstall|stop|status`: writes and loads a launchd plist under `~/Library/LaunchAgents` (`src/custodian/launchd.ts`). macOS only. Not run today.
- `chat [prompt]`: spawns `opencode` with `--model`, `--agent`, `--prompt` and, if the custodian config has `autostart: true`, starts the custodian first (`src/commands/chat.ts`). Not run today.
- `init`: writes `.opencode/opencode.json`, `.crowepilot/custodian.json`, an example agent and an example command (`src/commands/init.ts`). Not run today.
- CI (`.github/workflows/ci.yml`) runs the four checks plus build on Node 18 and 20. Release workflow (`release.yml`) creates a GitHub release on a `v*` tag.

## Roadmap

None recorded in the repo.

## Limits

- Not published on npm. The old README badges pointed at a package that does not exist.
- `chat` downloads and runs the opencode install script with `curl | bash` without asking if `opencode` is not on your PATH (`src/commands/chat.ts`, `installOpenCode`). Install opencode yourself first if you do not want that.
- Defaults that must exist in your Ollama or the run fails: custodian model `Mcrowe1210/DeepParallel` and tool model `gpt-oss:latest` (`src/custodian/constants.ts`). Neither was present on the test machine; I passed `--model` instead.
- Default chat model string passed to opencode is `anthropic/claude-sonnet-4-20250514` (`src/config/constants.ts`). Whether that id is accepted depends on your opencode and provider setup.
- With `--tools --allow-shell` the CLI executes whatever shell command the model writes, in your repo root. Read the tool runner before enabling it.
- The tool loop depends on the model following an XML tag format. If it does not, the run throws after 2 retries.
- One smoke test with a mock server. No unit tests. No tests for the tool runner or the launchd code.
- `package.json` lists the repository as `github.com/crowelogic/crowepilot`, which does not exist. The code lives at `github.com/MichaelCrowe11/crowepilot`.
- Crowe Logic does not own the model weights this tool calls. It calls whatever model you have pulled into Ollama, or whatever opencode is configured to use.

## License and contact

MIT (`LICENSE`, Copyright 2026 CroweLogic).

Contact: michael@crowelogic.com
