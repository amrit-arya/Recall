'use server'

import { getCurrentUser } from '@/lib/supabase/auth'
import { aiService, type AIServiceInput, type AISuggestions } from '@/lib/ai'

export interface ActionResponse<T = undefined> {
  success?: boolean
  data?: T
  error?: string
}

export async function generateMemoryAISuggestionsAction(
  input: AIServiceInput
): Promise<ActionResponse<AISuggestions>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'You must be signed in to generate AI suggestions.' }
    }

    if (!input || !input.title?.trim()) {
      return { error: 'A title is required to generate AI suggestions.' }
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        error:
          'GEMINI_API_KEY is not configured in .env.local. Please add GEMINI_API_KEY and restart your dev server.',
      }
    }

    const result = await aiService.generateMemorySuggestions(input)

    if (result.error || !result.suggestions) {
      return {
        error: result.error || 'AI service request failed. Please check your GEMINI_API_KEY validity or try again.',
      }
    }

    return {
      success: true,
      data: result.suggestions,
    }
  } catch (err) {
    console.error('generateMemoryAISuggestionsAction exception:', err)
    return {
      error: 'An unexpected error occurred while generating suggestions. Please enter details manually.',
    }
  }
}
