/**
 * Validates that the Gemini API is working.
 * Run: node --env-file=.env scripts/test-gemini-api.js
 * Or:  VITE_GEMINI_API_KEY=your_key node scripts/test-gemini-api.js
 */
import { GoogleGenerativeAI } from '@google/generative-ai'

const key = (process.env.VITE_GEMINI_API_KEY || '').trim()
if (!key) {
  console.error('❌ VITE_GEMINI_API_KEY is not set.')
  console.error('   Run with: node --env-file=.env scripts/test-gemini-api.js')
  process.exit(1)
}

// Raw fetch to get exact HTTP status and error body
async function rawApiTest() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Say hi' }] }],
    }),
  })
  const body = await res.text()
  return { status: res.status, statusText: res.statusText, body }
}

const MODELS_TO_TRY = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-pro']

async function testModel(modelId) {
  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({ model: modelId })
  const result = await model.generateContent('Reply with exactly: API is working')
  const text = result.response?.text?.()
  return text
}

async function main() {
  console.log('Testing Gemini API...\n')
  console.log('1. Raw HTTP request (shows exact error):')
  try {
    const raw = await rawApiTest()
    console.log(`   Status: ${raw.status} ${raw.statusText}`)
    const parsed = raw.body ? JSON.parse(raw.body) : {}
    if (parsed.error) {
      console.log(`   Error: ${parsed.error.message || JSON.stringify(parsed.error)}`)
    } else if (raw.status === 200) {
      console.log('   ✅ Raw request succeeded! API key and network are OK.')
    }
    console.log('')
  } catch (e) {
    console.log(`   Network/fetch error: ${e.message}`)
    console.log('   (Could be firewall, no internet, or CORS in browser context)\n')
  }

  console.log('2. Testing models via SDK:')
  for (const modelId of MODELS_TO_TRY) {
    try {
      const response = await testModel(modelId)
      console.log(`✅ ${modelId}: OK`)
      console.log(`   Response: "${(response || '').trim().slice(0, 80)}"`)
      console.log('\nAPI is working. Use this model in gemini.js:', modelId)
      process.exit(0)
    } catch (err) {
      console.log(`❌ ${modelId}:`)
      console.log(`   ${err?.message || err}`)
    }
  }

  console.error('\nAll models failed.')
  console.error('- Get a NEW API key: https://aistudio.google.com/apikey')
  console.error('- Enable "Generative Language API" if using a Google Cloud key')
  process.exit(1)
}

main()
