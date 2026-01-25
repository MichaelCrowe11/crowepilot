import http from "http"
import { buildRepoContext } from "./context"
import { loadCustodianConfig } from "./config"
import { generateWithOllama } from "./ollama"

interface ServerOptions {
  repoRoot?: string
  model?: string
  port?: number
  systemPrompt?: string
  includeContext?: boolean
}

interface RunPayload {
  prompt?: string
  repoRoot?: string
  model?: string
  systemPrompt?: string
  includeContext?: boolean
}

async function readJsonBody(req: http.IncomingMessage) {
  const chunks: Uint8Array[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  if (chunks.length === 0) return {}
  const raw = Buffer.concat(chunks).toString("utf-8")
  if (!raw) return {}
  return JSON.parse(raw)
}

export async function startCustodianServer(options: ServerOptions = {}) {
  const { config } = await loadCustodianConfig({ repoRoot: options.repoRoot })
  const port = options.port ?? config.port

  const server = http.createServer(async (req, res) => {
    try {
      if (!req.url) {
        res.writeHead(400)
        res.end("Missing URL")
        return
      }

      if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            status: "ok",
            model: options.model ?? config.model,
            repoRoot: options.repoRoot ?? config.repoRoot,
            port,
            uptime: process.uptime(),
          })
        )
        return
      }

      if (req.method === "POST" && req.url === "/run") {
        const payload = (await readJsonBody(req)) as RunPayload
        const repoRoot = payload.repoRoot || options.repoRoot || config.repoRoot
        const model = payload.model || options.model || config.model
        const systemPrompt = payload.systemPrompt || options.systemPrompt || config.systemPrompt
        const includeContext = payload.includeContext ?? options.includeContext ?? true

        const context = includeContext
          ? await buildRepoContext(repoRoot, {
              maxFiles: config.contextMaxFiles,
              maxChars: config.contextMaxChars,
            })
          : ""

        const prompt = payload.prompt?.trim() || "Provide an architectural review and optimization plan."
        const composedPrompt = context
          ? `Context:\n${context}\n\nRequest:\n${prompt}`
          : prompt

        const response = await generateWithOllama({
          baseUrl: config.ollamaBaseUrl,
          model,
          prompt: composedPrompt,
          system: systemPrompt,
        })

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ response }))
        return
      }

      if (req.method === "POST" && req.url === "/shutdown") {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ status: "shutting_down" }))
        server.close(() => process.exit(0))
        return
      }

      res.writeHead(404)
      res.end("Not found")
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: (error as Error).message }))
    }
  })

  await new Promise<void>((resolve) => {
    server.listen(port, () => resolve())
  })

  return { server, port }
}
