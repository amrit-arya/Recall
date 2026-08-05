import type { AIService, AIServiceInput, AISuggestionResult } from './types'

export class GeminiAIProvider implements AIService {
  async generateMemorySuggestions(input: AIServiceInput): Promise<AISuggestionResult> {
    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) {
      return {
        suggestions: null,
        error: 'GEMINI_API_KEY is not set. Please add GEMINI_API_KEY=<key> to your .env.local file.',
      }
    }

    // 1. Truncate input text to sensible limits
    const sanitizedTitle = (input.title || '').slice(0, 200)
    const sanitizedContent = (input.content || '').slice(0, 4000)
    const sanitizedDescription = (input.description || '').slice(0, 500)
    const sanitizedUrl = (input.url || '').slice(0, 500)

    const prompt = `Analyze the following memory item and return ONLY a valid JSON object matching this exact structure:
{
  "summary": "Concise 1 to 2 sentence summary of the item",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "suggestedCollection": "Category Name"
}

Do not include markdown codeblock formatting or extra text outside the JSON object.

Item Type: ${input.type}
Title: ${sanitizedTitle}
URL: ${sanitizedUrl}
Description: ${sanitizedDescription}
Content: ${sanitizedContent}`

    // Preferred models in order
    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-8b']
    let lastError = ''

    for (const modelName of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        }

        // Support bearer tokens for GCP credentials
        if (apiKey.startsWith('AQ') || apiKey.startsWith('ya29.')) {
          headers['Authorization'] = `Bearer ${apiKey}`
        }

        // 15-second request timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorBodyText = await response.text()
          lastError = `Gemini API [${modelName}] HTTP ${response.status}: ${errorBodyText}`
          console.warn(lastError)

          // Rate limit / Quota exceeded (429) -> Stop loop and return clean error message
          if (response.status === 429) {
            return {
              suggestions: null,
              error: 'Gemini API rate limit or quota exceeded (HTTP 429). Please wait a moment before trying again.',
            }
          }

          // Unauthorized or Bad Request (400 / 401 / 403) -> Authentication failure
          if (response.status === 400 || response.status === 401 || response.status === 403) {
            return {
              suggestions: null,
              error: `Gemini API authentication failed (HTTP ${response.status}). The provided GEMINI_API_KEY is invalid or unauthorized.`,
            }
          }

          // If 404 (Model not found), try next model in loop
          if (response.status === 404) {
            continue
          }

          return {
            suggestions: null,
            error: `Gemini API request failed (HTTP ${response.status}). Please try again later.`,
          }
        }

        const rawData = await response.json()
        let candidateText = rawData?.candidates?.[0]?.content?.parts?.[0]?.text

        if (!candidateText) {
          lastError = `Gemini API [${modelName}] returned empty candidate text`
          console.warn(lastError)
          continue
        }

        // Clean markdown backticks if present
        candidateText = candidateText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

        const parsed = JSON.parse(candidateText)

        if (typeof parsed.summary !== 'string' || !Array.isArray(parsed.suggestedTags)) {
          lastError = `Gemini API [${modelName}] response failed schema validation`
          console.warn(lastError)
          continue
        }

        const summary = parsed.summary.trim()
        const suggestedTags = parsed.suggestedTags
          .filter((t: unknown): t is string => typeof t === 'string' && t.trim().length > 0)
          .map((t: string) => t.trim().toLowerCase().replace(/^#/, ''))
          .slice(0, 6)

        const suggestedCollection =
          typeof parsed.suggestedCollection === 'string' && parsed.suggestedCollection.trim()
            ? parsed.suggestedCollection.trim()
            : undefined

        return {
          suggestions: {
            summary,
            suggestedTags,
            suggestedCollection,
          },
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          lastError = `Gemini API request timed out after 15 seconds`
        } else {
          lastError = err instanceof Error ? err.message : String(err)
        }
        console.warn(`Model ${modelName} error:`, lastError)
      }
    }

    return {
      suggestions: null,
      error: lastError || 'AI service request failed. Please check your GEMINI_API_KEY or network connection.',
    }
  }
}
