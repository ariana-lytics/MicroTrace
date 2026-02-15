import styles from './App.module.css'

const ARTICLES = [
  {
    source: 'Harvard Medical School',
    year: '2024',
    icon: '🏥',
    title: 'Microplastics are Everywhere',
    url: 'https://magazine.hms.harvard.edu/articles/microplastics-everywhere',
    summary: 'Recent research shows microplastics have been found in human blood, lungs, and organs. Learn about the health implications.',
    linkText: 'Read Harvard Study →',
  },
  {
    source: 'National Institutes of Health (NIH)',
    year: '2023',
    icon: '🔬',
    title: 'Health Impacts of Microplastics',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9920460/',
    summary: 'Comprehensive research on how microplastics enter the human body and their potential health effects.',
    linkText: 'Read NIH Research →',
    peerReviewed: true,
  },
]

export function LearnMore() {
  return (
    <div className={styles.learnMore}>
      <h3 className={styles.learnMoreTitle}>📚 Learn More About Microplastics</h3>
      <div className={styles.learnMoreTrust}>
        <h4 className={styles.learnMoreTrustTitle}>Why Trust This?</h4>
        <p className={styles.learnMoreTrustText}>Read the scientific research that explains the health impacts, backed by Harvard, NIH, and similar institutions.</p>
      </div>
      <div className={styles.learnMoreGrid}>
        {ARTICLES.map((article, i) => (
          <div key={i}>
            <article className={styles.learnMoreCard}>
              <div className={styles.learnMoreCardHeader}>
                <p className={styles.learnMoreSource}>
                  <span className={styles.learnMoreIcon}>{article.icon}</span>
                  {article.source} ({article.year})
                </p>
                {article.peerReviewed && (
                  <span className={styles.learnMorePeerBadge}>🔬 Peer-Reviewed</span>
                )}
              </div>
              <h4 className={styles.learnMoreCardTitle}>{article.title}</h4>
              <p className={styles.learnMoreSummary}>{article.summary}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.learnMoreButton}
              >
                {article.linkText}
              </a>
            </article>
            {i < ARTICLES.length - 1 && <div className={styles.learnMoreDivider} aria-hidden="true" />}
          </div>
        ))}
      </div>
      <footer className={styles.learnMoreFootnotes}>
        <p>
          <sup>1</sup>{' '}
          <a href="https://magazine.hms.harvard.edu/articles/microplastics-everywhere" target="_blank" rel="noopener noreferrer">
            Leslie HA, et al. &quot;Discovery and quantification of plastic particle pollution in human blood.&quot; Environment International (2022).
          </a>
        </p>
        <p>
          <sup>2</sup>{' '}
          <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9920460/" target="_blank" rel="noopener noreferrer">
            NIH/PMC. &quot;Microplastics and Human Health.&quot; Comprehensive review of exposure pathways and health impacts.
          </a>
        </p>
      </footer>
    </div>
  )
}

export default LearnMore
