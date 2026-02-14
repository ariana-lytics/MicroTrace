// Particle contributions per answer (annual estimate)
export const SCORING = {
  bottledWater: { daily: 30000, weekly: 10000, rarely: 0, never: 0 },
  microwave: { often: 15000, sometimes: 8000, never: 0 },
  syntheticClothes: { many: 20000, some: 8000, few: 2000, none: 0 },
  seafood: { weekly: 12000, monthly: 4000, rarely: 1000, never: 0 },
  plasticCuttingBoard: { yes: 5000, no: 0 },
  childrenUnder5: { yes: 10000, no: 0 },
  plasticCupsDaily: { yes: 8000, no: 0 },
  teaBags: { daily: 15000, weekly: 5000, rarely: 1000, never: 0 },
}

export function calculateScore(answers) {
  let total = 0
  if (answers.bottledWater) total += SCORING.bottledWater[answers.bottledWater] ?? 0
  if (answers.microwave) total += SCORING.microwave[answers.microwave] ?? 0
  if (answers.syntheticClothes) total += SCORING.syntheticClothes[answers.syntheticClothes] ?? 0
  if (answers.seafood) total += SCORING.seafood[answers.seafood] ?? 0
  if (answers.plasticCuttingBoard) total += SCORING.plasticCuttingBoard[answers.plasticCuttingBoard] ?? 0
  if (answers.childrenUnder5) total += SCORING.childrenUnder5[answers.childrenUnder5] ?? 0
  if (answers.plasticCupsDaily) total += SCORING.plasticCupsDaily[answers.plasticCupsDaily] ?? 0
  if (answers.teaBags) total += SCORING.teaBags[answers.teaBags] ?? 0
  return total
}

// Approximate percentile: higher score = higher percentile (more exposure)
const PERCENTILE_BUCKETS = [
  [0, 10000, 10], [10000, 25000, 25], [25000, 45000, 40], [45000, 70000, 55],
  [70000, 100000, 70], [100000, 140000, 82], [140000, 200000, 92], [200000, 1e9, 98],
]
export function getPercentile(score) {
  for (const [low, high, p] of PERCENTILE_BUCKETS) {
    if (score >= low && score < high) return p
  }
  return 98
}

export function getRecommendations(answers) {
  const recs = []
  if (answers.bottledWater === 'daily' || answers.bottledWater === 'weekly') {
    recs.push({
      title: 'Switch to glass or steel water bottle',
      impact: '-45% exposure',
      extra: '-12kg CO2/year',
    })
  }
  if (answers.microwave === 'often' || answers.microwave === 'sometimes') {
    recs.push({
      title: 'Never microwave in plastic',
      impact: '-25% exposure',
      extra: 'Use glass or ceramic instead',
    })
  }
  if (answers.syntheticClothes === 'many' || answers.syntheticClothes === 'some') {
    recs.push({
      title: 'Wash synthetics less often or use a microfiber filter',
      impact: '-20% exposure',
      extra: 'Or choose natural fibers when you can',
    })
  }
  if (answers.seafood === 'weekly') {
    recs.push({
      title: 'Choose smaller fish and limit high-risk seafood',
      impact: '-15% exposure',
      extra: 'Microplastics concentrate in seafood',
    })
  }
  if (answers.plasticCuttingBoard === 'yes') {
    recs.push({
      title: 'Use wooden or bamboo cutting board',
      impact: '-5% exposure',
      extra: 'Fewer microplastics in your food',
    })
  }
  if (answers.childrenUnder5 === 'yes') {
    recs.push({
      title: 'Reduce plastic in kids’ food and drink',
      impact: 'Lower risk for little ones',
      extra: 'Glass bottles, silicone-free where possible',
    })
  }
  if (answers.plasticCupsDaily === 'yes') {
    recs.push({
      title: 'Switch to reusable glass or metal cups',
      impact: '-10% exposure',
      extra: '-3kg CO2/year',
    })
  }
  if (answers.teaBags === 'daily' || answers.teaBags === 'weekly') {
    recs.push({
      title: 'Use loose leaf tea',
      impact: '-15% exposure',
      extra: '-3kg CO2/year',
    })
  }
  return recs.slice(0, 3)
}
