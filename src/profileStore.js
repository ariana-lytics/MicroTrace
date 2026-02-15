const STORAGE_KEY = 'microtrace_profile'

const DEFAULT_PROFILE = {
  userName: 'Ariana',
  monthlyData: [
    { day: 1, particles: 85000 },
    { day: 3, particles: 82000 },
    { day: 5, particles: 78000 },
    { day: 7, particles: 71000 },
    { day: 10, particles: 65000 },
    { day: 14, particles: 58000 },
    { day: 18, particles: 52000 },
    { day: 22, particles: 47000 },
    { day: 26, particles: 43000 },
    { day: 30, particles: 42000 },
  ],
  badges: [
    { id: 'first-scan', name: 'First Scan', unlocked: true, icon: '🌱', tier: 'beginner' },
    { id: 'water-warrior', name: 'Water Warrior', unlocked: true, icon: '💧', tier: 'beginner' },
    { id: 'plastic-avoider', name: 'Plastic Avoider', unlocked: true, icon: '♻️', tier: 'beginner' },
    { id: 'week-streak', name: 'Week Streak', unlocked: true, icon: '🏆', tier: 'intermediate' },
    { id: 'ocean-saver', name: 'Ocean Saver', unlocked: false, progress: 45000, goal: 100000, icon: '🌊', tier: 'intermediate' },
    { id: 'clean-eater', name: 'Clean Eater', unlocked: false, progress: 8, goal: 14, icon: '🥗', tier: 'intermediate' },
    { id: 'plastic-master', name: 'Microplastic Master', unlocked: false, progress: 12, goal: 30, icon: '⭐', tier: 'advanced' },
    { id: 'planet-protector', name: 'Planet Protector', unlocked: false, progress: 23, goal: 50, icon: '🌍', tier: 'advanced' },
    { id: 'zero-waste', name: 'Zero Waste Hero', unlocked: false, icon: '👑', tier: 'advanced' },
  ],
  stats: {
    reductionPercent: 51,
    particlesPrevented: 1200000,
    carbonReduced: 23,
    currentStreak: 15,
  },
  recentScans: [],
}

export function getProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_PROFILE, ...parsed, badges: parsed.badges ?? DEFAULT_PROFILE.badges }
    }
  } catch (_) {}
  return { ...DEFAULT_PROFILE }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch (_) {}
}

export function addScanToProfile(product) {
  const profile = getProfile()
  const scan = {
    product: product.productType || product.material || 'Product',
    score: product.riskScore ?? 0,
    date: 'Just now',
    particles: product.microplastics ?? 0,
  }
  profile.recentScans = [scan, ...(profile.recentScans || []).slice(0, 19)]
  saveProfile(profile)
  return profile
}

export function removeScanFromProfile(index) {
  const profile = getProfile()
  if (profile.recentScans && profile.recentScans[index]) {
    profile.recentScans = profile.recentScans.filter((_, i) => i !== index)
    saveProfile(profile)
  }
  return getProfile()
}

export { DEFAULT_PROFILE }
