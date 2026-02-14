import { GoogleGenerativeAI } from '@google/generative-ai'

const PROMPT = `Analyze this product image. Identify:
1. Product type and packaging material
2. Microplastic exposure risk (Low/Medium/High) with particle estimate (number)
3. Carbon footprint in g CO2e with lifecycle breakdown (production, transport, disposal in g)
4. Specific health concerns related to microplastics (array of short strings)
5. 2-3 better alternatives with specific product names and improvements (array of objects: name, microReduction %, carbonReduction %, price, lasts)

Return ONLY valid JSON with these exact fields (no markdown, no code block):
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

export async function analyzeProductWithGemini(imageBlob) {
  const key = (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
  if (!key) throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file and restart the dev server.')

  const genAI = new GoogleGenerativeAI(key)
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']

  const reader = new FileReader()
  const base64 = await new Promise((resolve, reject) => {
    reader.onload = () => {
      const dataUrl = reader.result
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(imageBlob)
  })

  const parts = [
    { inlineData: { mimeType: imageBlob.type || 'image/jpeg', data: base64 } },
    PROMPT,
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

  const response = result.response
  const text = response.text()
  if (!text) throw new Error('Empty response from Gemini')

  // Strip markdown code block if present
  let jsonStr = text.trim()
  const codeMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeMatch) jsonStr = codeMatch[1].trim()

  const data = JSON.parse(jsonStr)

  // Ensure arrays and normalize carbon to grams if API returned kg
  if (!data.healthConcerns || !Array.isArray(data.healthConcerns)) data.healthConcerns = []
  if (!data.alternatives || !Array.isArray(data.alternatives)) data.alternatives = []
  if (typeof data.carbonFootprint === 'number' && data.carbonFootprint < 10) {
    const cf = data.carbonFootprint
    data.carbonFootprint = Math.round(cf * 1000)
    if (data.carbonBreakdown && typeof data.carbonBreakdown === 'object') {
      data.carbonBreakdown = {
        production: Math.round((data.carbonBreakdown.production ?? cf * 0.6) * 1000),
        transport: Math.round((data.carbonBreakdown.transport ?? cf * 0.2) * 1000),
        disposal: Math.round((data.carbonBreakdown.disposal ?? cf * 0.2) * 1000),
      }
    }
  }

  return data
}
