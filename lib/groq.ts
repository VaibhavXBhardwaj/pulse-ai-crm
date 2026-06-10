import Groq from 'groq-sdk'

export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export const MODELS = {
  FAST: 'llama-3.1-8b-instant',
  SMART: 'llama-3.3-70b-versatile',
} as const

export type GroqModel = (typeof MODELS)[keyof typeof MODELS]