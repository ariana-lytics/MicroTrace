/**
 * Gemini text-only lookup: analyze product from tags (no image).
 * Cheaper than vision - only text prompt.
 */
import { GoogleGenerativeAI } from '@google/generative-ai'

const PROMPT = `Based on these image recognition tags describing a product: {TAGS}

Provide a microplastic and carbon analysis. Return ONLY valid JSON with these exact fields (no markdown):
{
  "productType": "string",
  "material": "string",
  "riskScore": number 1-10,
  "riskLevel": "Low"|"Medium"|"High",
  "microplastics": number,
  "carbonFootprint": number (g CO2e),
  "carbonBreakdown": { "production": number, "transport": number, "disposal": number },
  "healthConcerns": ["string"],
  "alternatives": [{ "name": "string", "microReduction": number, "carbonReduction": number, "price": "string", "lasts": "string" }]
}`

export async function lookupWithGemini(tags) {
  const key = (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
  if (!key) throw new Error('VITE_GEMINI_API_KEY is not set')

  const tagsStr = Array.isArray(tags) ? tags.join(', ') : String(tags)
  const prompt = PROMPT.replace('{TAGS}', tagsStr)

  const genAI = new GoogleGenerativeAI(key)
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
  let result
  for (const modelId of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId })
      result = await model.generateContent(prompt)
      break
    } catch (e) {
      if (e?.message?.includes('429') && models.indexOf(modelId) < models.length - 1) continue
      throw e
    }
  }
  const text = result.response?.text?.() || ''
  if (!text) throw new Error('Empty response from Gemini')

  let jsonStr = text.trim()
  const m = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (m) jsonStr = m[1].trim()

  const data = JSON.parse(jsonStr)
  if (!data.healthConcerns || !Array.isArray(data.healthConcerns)) data.healthConcerns = []
  if (!data.alternatives || !Array.isArray(data.alternatives)) data.alternatives = []

  return data
}
