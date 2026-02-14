/**
 * Product database for lookup after image recognition.
 * Add products here to avoid full AI analysis.
 */
export const PRODUCT_DATABASE = [
  {
    productType: 'Plastic water bottle',
    material: 'Single-use PET plastic',
    riskScore: 9,
    riskLevel: 'High',
    microplastics: 74000,
    carbonFootprint: 82,
    carbonBreakdown: { production: 60, transport: 12, disposal: 10 },
    healthConcerns: [
      'Releases particles when heated or agitated',
      'Chemical leaching (BPA, phthalates)',
      'Single-use = high waste',
    ],
    alternatives: [
      { name: 'Reusable Steel Bottle', microReduction: 95, carbonReduction: 90, price: '$15-30', lasts: '10+ years' },
      { name: 'Glass bottle', microReduction: 98, carbonReduction: 85, price: '$10-25', lasts: '5+ years' },
    ],
    keywords: ['water bottle', 'plastic bottle', 'pet bottle', 'single-use bottle', 'soda bottle'],
  },
  {
    productType: 'Tea bag box',
    material: 'Plastic-sealed tea bags',
    riskScore: 8,
    riskLevel: 'High',
    microplastics: 15000,
    carbonFootprint: 45,
    carbonBreakdown: { production: 30, transport: 8, disposal: 7 },
    healthConcerns: [
      'Tea bags release microplastics when steeped in hot water',
      'Plastic mesh in many tea bags',
      'Daily use compounds exposure',
    ],
    alternatives: [
      { name: 'Loose leaf tea', microReduction: 95, carbonReduction: 70, price: '$5-15', lasts: 'N/A' },
      { name: 'Stainless steel tea infuser', microReduction: 98, carbonReduction: 80, price: '$8-20', lasts: '10+ years' },
    ],
    keywords: ['tea bag', 'tea bags', 'tea box', 'teabag'],
  },
  {
    productType: 'Fleece jacket',
    material: 'Synthetic polyester fleece',
    riskScore: 8,
    riskLevel: 'High',
    microplastics: 20000,
    carbonFootprint: 120,
    carbonBreakdown: { production: 85, transport: 25, disposal: 10 },
    healthConcerns: [
      'Sheds microfibers in wash',
      'Skin contact and inhalation',
      'Enters waterways',
    ],
    alternatives: [
      { name: 'Organic cotton or wool jacket', microReduction: 90, carbonReduction: 60, price: '$40-100', lasts: '5+ years' },
      { name: 'Recycled polyester with Guppyfriend wash bag', microReduction: 80, carbonReduction: 40, price: '$15-30', lasts: '2+ years' },
    ],
    keywords: ['fleece', 'fleece jacket', 'polyester jacket', 'synthetic jacket'],
  },
  {
    productType: 'Plastic takeout container',
    material: 'Single-use plastic (PS/PP)',
    riskScore: 7,
    riskLevel: 'Medium',
    microplastics: 15000,
    carbonFootprint: 55,
    carbonBreakdown: { production: 38, transport: 10, disposal: 7 },
    healthConcerns: [
      'Leaches when in contact with hot food',
      'Not microwave-safe for reuse',
      'Single-use waste',
    ],
    alternatives: [
      { name: 'Bring your own container', microReduction: 95, carbonReduction: 90, price: '$5-20', lasts: '2+ years' },
      { name: 'Glass meal prep containers', microReduction: 98, carbonReduction: 85, price: '$15-40', lasts: '5+ years' },
    ],
    keywords: ['takeout', 'take-out', 'food container', 'plastic container', 'to-go container', 'clamshell'],
  },
  {
    productType: 'Reusable steel bottle',
    material: 'Stainless steel',
    riskScore: 2,
    riskLevel: 'Low',
    microplastics: 500,
    carbonFootprint: 25,
    carbonBreakdown: { production: 18, transport: 4, disposal: 3 },
    healthConcerns: [
      'Minimal microplastic release',
      'Safe for hot and cold drinks',
    ],
    alternatives: [],
    keywords: ['steel bottle', 'metal bottle', 'reusable bottle', 'stainless steel'],
  },
  {
    productType: 'Plastic chip bag',
    material: 'Multi-layer plastic film',
    riskScore: 8,
    riskLevel: 'High',
    microplastics: 12000,
    carbonFootprint: 38,
    carbonBreakdown: { production: 25, transport: 7, disposal: 6 },
    healthConcerns: [
      'Non-recyclable multi-layer plastic',
      'Direct food contact',
      'Single-use packaging',
    ],
    alternatives: [
      { name: 'Chips in paper/compostable bag', microReduction: 90, carbonReduction: 70, price: 'Similar', lasts: 'N/A' },
      { name: 'Bulk bins with own container', microReduction: 95, carbonReduction: 80, price: 'Varies', lasts: 'N/A' },
    ],
    keywords: ['chip bag', 'chips', 'snack bag', 'crisps', 'potato chips'],
  },
  {
    productType: 'Plastic food wrap',
    material: 'PVC/plastic film',
    riskScore: 7,
    riskLevel: 'Medium',
    microplastics: 8000,
    carbonFootprint: 22,
    carbonBreakdown: { production: 15, transport: 4, disposal: 3 },
    healthConcerns: [
      'Leaches when touching food',
      'Not recyclable',
      'Single-use',
    ],
    alternatives: [
      { name: 'Beeswax wraps', microReduction: 99, carbonReduction: 85, price: '$15-25', lasts: '1 year' },
      { name: 'Silicone lids', microReduction: 95, carbonReduction: 70, price: '$10-30', lasts: '5+ years' },
    ],
    keywords: ['plastic wrap', 'cling film', 'saran wrap', 'food wrap'],
  },
]

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

export function lookupProduct(identified) {
  const type = normalize(identified?.productType || '')
  const mat = normalize(identified?.material || '')
  const combined = `${type} ${mat}`

  for (const product of PRODUCT_DATABASE) {
    const keywords = product.keywords || [product.productType, product.material]
    for (const kw of keywords) {
      const n = normalize(kw)
      if (type.includes(n) || mat.includes(n) || combined.includes(n)) {
        const { keywords: _, ...rest } = product
        return rest
      }
    }
  }
  return null
}

/** Lookup by Imagga tags array. */
export function lookupByTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return null
  const tagStr = tags.join(' ').toLowerCase()

  for (const product of PRODUCT_DATABASE) {
    const keywords = product.keywords || [product.productType, product.material]
    for (const kw of keywords) {
      const n = normalize(kw)
      const words = n.split(/\s+/)
      const match = words.every((w) => w.length < 2 || tagStr.includes(w))
      if (match && n.length > 2) {
        const { keywords: _, ...rest } = product
        return rest
      }
    }
  }
  return null
}
