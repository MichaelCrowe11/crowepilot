interface GenerateOptions {
  baseUrl: string
  model: string
  prompt: string
  system?: string
  temperature?: number
}

export async function isOllamaAvailable(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/tags`)
    return res.ok
  } catch {
    return false
  }
}

export async function generateWithOllama(options: GenerateOptions) {
  const res = await fetch(`${options.baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: options.model,
      prompt: options.prompt,
      system: options.system,
      stream: false,
      options: options.temperature !== undefined ? { temperature: options.temperature } : undefined,
    }),
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `Ollama error (${res.status})`)
  }

  const data = (await res.json()) as { response?: string }
  return (data.response || "").trim()
}
