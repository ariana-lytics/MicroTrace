import { useState, useEffect } from 'react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { getProfile, removeScanFromProfile } from './profileStore'
import { LearnMore } from './LearnMore'
import styles from './App.module.css'

function MicroTraceProfile({ onBack }) {
  const [profile, setProfile] = useState(getProfile)

  useEffect(() => {
    setProfile(getProfile())
  }, [])

  const handleRemoveScan = (index) => {
    setProfile(removeScanFromProfile(index))
  }

  const chartData = profile.monthlyData || []
  const maxParticles = Math.max(...chartData.map((d) => d.particles), 100000)

  return (
    <section className={styles.screen} aria-label="MicroTrace Profile">
      <button className={styles.backButton} onClick={onBack} type="button">← Back</button>
      <div className={styles.profileContent}>
        <h2 className={styles.profileTitle}>MicroTrace Profile</h2>
        <p className={styles.profileSub}>Welcome back, {profile.userName}!</p>

        {/* Streak */}
        <div className={styles.streakBanner}>
          🔥 {profile.stats?.currentStreak ?? 0} days of reduced exposure!
        </div>

        {/* Monthly Chart */}
        <div className={styles.profileCard}>
          <h3 className={styles.profileCardTitle}>Monthly tracking</h3>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="particleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c0392b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#27ae60" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, maxParticles]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v?.toLocaleString()} particles`, 'Exposure']} />
                <Area
                  type="monotone"
                  dataKey="particles"
                  stroke="var(--safe-2)"
                  strokeWidth={2}
                  fill="url(#particleGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impact Cards */}
        <div className={styles.impactGrid}>
          <div className={styles.impactCard}>
            <span className={styles.impactPercent}>{profile.stats?.reductionPercent ?? 51}%</span>
            <p className={styles.impactLabel}>Reduction this month</p>
            <p className={styles.impactDetail}>
              {(profile.stats?.particlesPrevented ?? 1200000).toLocaleString()} particles prevented
            </p>
          </div>
          <div className={styles.impactCard}>
            <span className={styles.impactValue}>{profile.stats?.carbonReduced ?? 23}kg</span>
            <p className={styles.impactLabel}>CO2e reduced</p>
            <p className={styles.impactDetail}>≈ 82 miles not driven 🌍</p>
          </div>
          <div className={styles.impactCard}>
            <span className={styles.impactValue}>Top 5%</span>
            <p className={styles.impactLabel}>Community impact</p>
            <p className={styles.impactDetail}>47 tons plastic prevented if everyone followed!</p>
          </div>
        </div>

        {/* Badges */}
        <div className={styles.profileCard}>
          <h3 className={styles.profileCardTitle}>Achievements</h3>
          <div className={styles.badgeGrid}>
            {(profile.badges || []).map((b) => (
              <div
                key={b.id}
                className={`${styles.badgeItem} ${b.unlocked ? styles.badgeUnlocked : styles.badgeLocked}`}
                title={b.name}
              >
                <span className={styles.badgeIcon}>{b.icon}</span>
                <span className={styles.badgeName}>{b.name}</span>
                {!b.unlocked && b.progress !== undefined && b.goal && (
                  <div className={styles.badgeProgress}>
                    <div
                      className={styles.badgeProgressBar}
                      style={{ width: `${Math.min(100, (b.progress / b.goal) * 100)}%` }}
                    />
                    <span className={styles.badgeProgressText}>
                      {typeof b.progress === 'number' && b.goal > 100
                        ? `${(b.progress / 1000).toFixed(0)}k/${(b.goal / 1000).toFixed(0)}k`
                        : `${b.progress}/${b.goal}`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scan History */}
        <div className={styles.profileCard}>
          <h3 className={styles.profileCardTitle}>Recent scans</h3>
          <ul className={styles.scanHistoryList}>
            {(profile.recentScans || []).map((s, i) => (
              <li key={i} className={styles.scanHistoryItem}>
                <div className={styles.scanHistoryInfo}>
                  <strong>{s.product}</strong>
                  <span>Score: {s.score}/10 · {s.date}</span>
                </div>
                <button
                  className={styles.scanRemoveBtn}
                  onClick={() => handleRemoveScan(i)}
                  type="button"
                  aria-label="Remove"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <LearnMore />
      </div>
    </section>
  )
}

export default MicroTraceProfile
