/**
 * Product analysis using Grok via Puter AI.
 * Uses @heyputer/puter.js npm package - no script loading required.
 */
import { puter } from '@heyputer/puter.js'

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

export async function analyzeProductWithGrok(imageBlob) {
  const file = imageBlob instanceof File
    ? imageBlob
    : new File([imageBlob], 'image.jpg', { type: imageBlob.type || 'image/jpeg' })

  const response = await puter.ai.chat(
    PROMPT,
    file,
    { model: 'x-ai/grok-4-1-fast' }
  )

  const text = response?.message?.content ?? response?.content ?? ''
  if (!text) throw new Error('Empty response from Grok')

  let jsonStr = String(text).trim()
  const codeMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeMatch) jsonStr = codeMatch[1].trim()

  const data = JSON.parse(jsonStr)

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
