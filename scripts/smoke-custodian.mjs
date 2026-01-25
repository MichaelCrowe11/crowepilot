import http from "http"
import { promisify } from "util"
import { execFile } from "child_process"
import fs from "fs/promises"
import os from "os"
import path from "path"

const execFileAsync = promisify(execFile)

function startMockOllama() {
  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.writeHead(400)
      res.end("Missing URL")
      return
    }

    if (req.method === "GET" && req.url === "/api/tags") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ models: [{ name: "test-model" }] }))
      return
    }

    if (req.method === "POST" && req.url === "/api/generate") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ response: "ok", done: true }))
      return
    }

    res.writeHead(404)
    res.end("Not found")
  })

  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      if (!address || typeof address === "string") {
        reject(new Error("Failed to start mock server"))
        return
      }
      resolve({ server, port: address.port })
    })
  })
}

async function run() {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "crowepilot-smoke-"))
  const custodianDir = path.join(tmpRoot, ".crowepilot")
  const custodianFile = path.join(custodianDir, "custodian.json")

  const { server, port } = await startMockOllama()

  try {
    await fs.mkdir(custodianDir, { recursive: true })
    await fs.writeFile(
      custodianFile,
      JSON.stringify(
        {
          model: "test-model",
          port: 5123,
          autostart: false,
          systemPrompt: "Test",
          ollamaBaseUrl: `http://127.0.0.1:${port}`,
          contextMaxFiles: 10,
          contextMaxChars: 1000,
        },
        null,
        2
      )
    )

    const { stdout } = await execFileAsync(
      process.execPath,
      [
        path.resolve("dist/index.js"),
        "custodian",
        "run",
        "Smoke test",
        "--repo",
        tmpRoot,
        "--port",
        String(port),
        "--context=false",
        "--model",
        "test-model",
      ],
      { cwd: path.resolve(".") }
    )

    if (!stdout.includes("ok")) {
      throw new Error(`Unexpected output: ${stdout}`)
    }
  } finally {
    server.close()
    await fs.rm(tmpRoot, { recursive: true, force: true })
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
