/**
 * Image recognition via Imagga API.
 * Get tags from image - then lookup in DB or Gemini.
 * Requires: VITE_IMAGGA_API_KEY, VITE_IMAGGA_API_SECRET in .env
 *
 * Note: Imagga may block direct browser requests (CORS). If you get
 * "Couldn't download image", use a backend proxy to forward the request.
 */
const IMAGGA_TAGS_URL = 'https://api.imagga.com/v2/tags'

export async function getImageTags(imageBlob) {
  const apiKey = (import.meta.env.VITE_IMAGGA_API_KEY || '').trim()
  const apiSecret = (import.meta.env.VITE_IMAGGA_API_SECRET || '').trim()
  if (!apiKey || !apiSecret) {
    throw new Error('VITE_IMAGGA_API_KEY and VITE_IMAGGA_API_SECRET must be set in .env')
  }

  // Ensure we have a proper File (Imagga expects multipart/form-data)
  const file = imageBlob instanceof File
    ? imageBlob
    : new File([imageBlob], 'image.jpg', { type: imageBlob.type || 'image/jpeg' })

  const formData = new FormData()
  formData.append('image', file)

  const auth = btoa(`${apiKey}:${apiSecret}`)
  const res = await fetch(IMAGGA_TAGS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      // Do NOT set Content-Type - fetch adds boundary for FormData
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Imagga API error: ${res.status} ${err}`)
  }

  const data = await res.json()
  const tags = data?.result?.tags ?? []
  return tags
    .filter((t) => (t.confidence ?? 0) > 20)
    .map((t) => (t.tag?.en ?? t.tag?.name ?? String(t.tag)).toLowerCase())
}
