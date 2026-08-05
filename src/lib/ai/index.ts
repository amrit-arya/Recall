import type { AIService } from './types'
import { GeminiAIProvider } from './gemini-provider'

/**
 * Replaceable AI Service Factory
 * To swap Gemini for another provider (e.g. OpenAI, Anthropic, Ollama),
 * simply replace GeminiAIProvider with another AIService implementation here.
 */
export const aiService: AIService = new GeminiAIProvider()

export * from './types'
