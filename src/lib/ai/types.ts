export interface AIServiceInput {
  title: string
  content?: string
  url?: string
  type: string
  description?: string
}

export interface AISuggestions {
  summary: string
  suggestedTags: string[]
  suggestedCollection?: string
}

export interface AISuggestionResult {
  suggestions: AISuggestions | null
  error?: string
}

export interface AIService {
  /**
   * Generates structured memory suggestions (summary, tags, collection).
   * Returns detailed result with suggestions or diagnostic error message.
   */
  generateMemorySuggestions(input: AIServiceInput): Promise<AISuggestionResult>
}
