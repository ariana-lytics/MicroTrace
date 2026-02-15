import styles from './App.module.css'

const NAV_ITEMS = [
  { id: 'choice', screen: 'choice', label: 'Home', icon: '🏠' },
  { id: 'scan', screen: 'scan', label: 'Scan', icon: '📸' },
  { id: 'quiz', screen: 'quiz', label: 'Assessment', icon: '📝' },
  { id: 'profile', screen: 'profile', label: 'Progress', icon: '📊' },
  { id: 'info', screen: 'info', label: 'Info', icon: 'ℹ️' },
]

export function NavBar({ currentScreen, onNavigate, progressBadge }) {
  const screenToId = {
    choice: 'choice',
    scan: 'scan',
    quiz: 'quiz',
    assessment_results: 'quiz',
    profile: 'profile',
    info: 'info',
  }
  const activeId = screenToId[currentScreen] || 'choice'

  return (
    <nav className={styles.navBar} aria-label="Main navigation">
      <div className={styles.navBarInner}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id
          const showBadge = item.id === 'profile' && progressBadge > 0
          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              onClick={() => onNavigate(item.screen)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {showBadge && (
                <span className={styles.navBadge} aria-hidden="true">
                  {progressBadge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default NavBar
