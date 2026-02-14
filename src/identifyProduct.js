/**
 * Lightweight image recognition: identify product type + material only.
 * Use for DB lookup before falling back to full AI analysis.
 */
const IDENTIFY_PROMPT = `What product is shown in this image? Identify the product type and packaging/material.

Return ONLY valid JSON with these exact fields (no markdown, no code block):
{"productType": "string", "material": "string"}

Examples: {"productType": "Plastic water bottle", "material": "PET plastic"}
Examples: {"productType": "Tea bag box", "material": "Plastic-sealed bags"}`

export async function identifyWithGemini(imageBlob) {
  const key = (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
  if (!key) throw new Error('VITE_GEMINI_API_KEY is not set')

  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(key)
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']

  const reader = new FileReader()
  const base64 = await new Promise((resolve, reject) => {
    reader.onload = () => {
      const dataUrl = reader.result
      resolve(dataUrl.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(imageBlob)
  })

  const parts = [
    { inlineData: { mimeType: imageBlob.type || 'image/jpeg', data: base64 } },
    IDENTIFY_PROMPT,
  ]
  let result
  for (const modelId of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId })
      result = await model.generateContent(parts)
      break
    } catch (e) {
      if (e?.message?.includes('429') && models.indexOf(modelId) < models.length - 1) continue
      throw e
    }
  }
  if (!result) throw new Error('All Gemini models failed')
  const text = result.response?.text?.() || ''
  if (!text) throw new Error('Empty response from Gemini')

  let jsonStr = text.trim()
  const m = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (m) jsonStr = m[1].trim()
  return JSON.parse(jsonStr)
}

export async function identifyWithGrok(imageBlob) {
  const { puter } = await import('@heyputer/puter.js')
  const file = imageBlob instanceof File
    ? imageBlob
    : new File([imageBlob], 'image.jpg', { type: imageBlob.type || 'image/jpeg' })

  const response = await puter.ai.chat(
    IDENTIFY_PROMPT,
    file,
    { model: 'x-ai/grok-4-1-fast' }
  )
  const text = response?.message?.content ?? response?.content ?? ''
  if (!text) throw new Error('Empty response from Grok')

  let jsonStr = String(text).trim()
  const m = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (m) jsonStr = m[1].trim()
  return JSON.parse(jsonStr)
}

/**
 * Identify product (try Grok first, fallback to Gemini).
 */
export async function identifyProduct(imageBlob) {
  try {
    return await identifyWithGrok(imageBlob)
  } catch {
    return await identifyWithGemini(imageBlob)
  }
}
