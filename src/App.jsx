import { useState, useRef, useEffect } from 'react'
import { getImageTags } from './imagga'
import { lookupByTags } from './productDatabase'
import { lookupWithGemini } from './geminiLookup'
import { identifyWithGemini } from './identifyProduct'
import { DEMO_PRODUCTS } from './demoProducts'
import { calculateScore, getPercentile, getRecommendations } from './quizScoring'
import { addScanToProfile, getProfile } from './profileStore'
import MicroTraceProfile from './MicroTraceProfile'
import { LearnMore } from './LearnMore'
import { NavBar } from './NavBar'
import styles from './App.module.css'

const SCREENS = {
  WELCOME: 'welcome',
  CHOICE: 'choice',
  QUIZ: 'quiz',
  ASSESSMENT_RESULTS: 'assessment_results',
  SCAN: 'scan',
  SCAN_LOADING: 'scan_loading',
  SCAN_RESULT: 'scan_result',
  SCAN_DEMO_PICK: 'scan_demo_pick',
  PROFILE: 'profile',
  INFO: 'info',
}

const QUIZ_QUESTIONS = [
  { id: 'bottledWater', text: 'How often do you drink bottled water?', options: ['Daily', 'Weekly', 'Rarely', 'Never'] },
  { id: 'microwave', text: 'Do you microwave food in plastic?', options: ['Often', 'Sometimes', 'Never'] },
  { id: 'syntheticClothes', text: 'How many synthetic clothing items do you own?', options: ['Many', 'Some', 'Few', 'None'] },
  { id: 'seafood', text: 'Do you eat seafood?', options: ['Weekly', 'Monthly', 'Rarely', 'Never'] },
  { id: 'plasticCuttingBoard', text: 'Do you use plastic cutting boards?', options: ['Yes', 'No'] },
  { id: 'childrenUnder5', text: 'Children under 5 in household?', options: ['Yes', 'No'] },
  { id: 'plasticCupsDaily', text: 'Do you drink from plastic cups/bottles daily?', options: ['Yes', 'No'] },
  { id: 'teaBags', text: 'Do you use tea bags?', options: ['Daily', 'Weekly', 'Rarely', 'Never'] },
]

function WelcomeScreen({ onNext }) {
  return (
    <section className={`${styles.screen} ${styles.welcomeScreen}`} aria-label="Welcome">
      <div className={styles.welcomeContent}>
        <h1 className={styles.welcomeHeadline}>Would you eat plastic?</h1>
        <p className={styles.welcomeSubline}>Well you are. And drinking it too.</p>
        <p className={styles.welcomeSubheadline}>An accessible tool for reducing plastic waste</p>
        <img
          src="/mouth-plastic.png"
          alt="Mouth with plastic waste"
          className={styles.welcomeImage}
        />
        <button className={styles.ctaButton} onClick={onNext} type="button">
          Stop plastic waste with MicroTrace
        </button>
      </div>
    </section>
  )
}

function ChoiceScreen({ onScan, onAssessment, onProfile, onBack }) {
  return (
    <section className={styles.screen} aria-label="MicroTrace">
      <div className={styles.choiceContent}>
        <img
          src="/microtrace-logo.png"
          alt="MicroTrace logo"
          className={styles.choiceLogo}
        />
        <h2 className={styles.choiceBrand}>MicroTrace</h2>
        <p className={styles.choiceTagline}>Your Personal Microplastic Tracker</p>
        <div className={styles.choiceButtons}>
          <button className={styles.choiceBtnPrimary} onClick={onScan} type="button">
            <span className={styles.choiceBtnIcon}>📸</span>
            <span className={styles.choiceBtnText}>
              <strong>Scan a Product</strong>
              <span className={styles.choiceBtnPreview}>Analyze products instantly</span>
            </span>
          </button>
          <button className={styles.choiceBtnSecondary} onClick={onAssessment} type="button">
            <span className={styles.choiceBtnIcon}>📝</span>
            <span className={styles.choiceBtnText}>
              <strong>Take Quick Assessment</strong>
              <span className={styles.choiceBtnPreview}>5-minute lifestyle quiz</span>
            </span>
          </button>
          <button className={styles.choiceBtnSecondary} onClick={onProfile} type="button">
            <span className={styles.choiceBtnIcon}>📊</span>
            <span className={styles.choiceBtnText}>
              <strong>My Progress</strong>
              <span className={styles.choiceBtnPreview}>See your impact over time</span>
            </span>
          </button>
          <button className={styles.choiceBackBtn} onClick={onBack} type="button">
            ← Back to home
          </button>
        </div>
      </div>
    </section>
  )
}

function QuizScreen({ onComplete, onSkip }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const q = QUIZ_QUESTIONS[current]

  const choose = (option) => {
    const key = q.id
    const val = option.toLowerCase()
    setAnswers((a) => ({ ...a, [key]: val }))
    if (current < QUIZ_QUESTIONS.length - 1) setCurrent((c) => c + 1)
    else onComplete({ ...answers, [key]: val })
  }

  return (
    <section className={styles.screen} aria-label="Quick assessment">
      <div className={styles.quizContent}>
        <div className={styles.progressWrap}>
          <div className={styles.progressBar} style={{ width: `${((current + 1) / 8) * 100}%` }} />
          <p className={styles.progressText}>Question {current + 1} of 8</p>
        </div>
        <h2 key={current} className={styles.quizQuestion}>{q.text}</h2>
        <div key={`opts-${current}`} className={styles.quizOptions}>
          {q.options.map((opt) => (
            <button
              key={opt}
              className={styles.quizOption}
              onClick={() => choose(opt)}
              type="button"
            >
              {opt}
            </button>
          ))}
        </div>
        <button className={styles.skipQuiz} onClick={() => onSkip()} type="button">
          Skip Quiz
        </button>
      </div>
    </section>
  )
}

function AssessmentResultsScreen({ answers, onBack }) {
  const score = calculateScore(answers)
  const percentile = getPercentile(score)
  const recommendations = getRecommendations(answers)

  return (
    <section className={styles.screen} aria-label="Assessment results">
      <div className={styles.resultsContent}>
        <h2 className={styles.resultsHeadline}>Your annual exposure</h2>
        <p className={styles.exposureNumber}>~{score.toLocaleString()} microplastic particles/year</p>
        <div className={styles.bodyDiagram}>
          <div className={styles.bodyPart} data-area="blood">Bloodstream</div>
          <div className={styles.bodyPart} data-area="lungs">Lungs</div>
          <div className={styles.bodyPart} data-area="organs">Organs</div>
        </div>
        <p className={styles.citationLine}>Found in 77% of human blood<sup className={styles.citationSup}>1</sup></p>
        <p className={styles.percentile}>
          You&apos;re in the top {100 - percentile}% of exposure
        </p>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Your Top 3 Changes</h3>
          <ul className={styles.recList}>
            {recommendations.length ? recommendations.map((r, i) => (
              <li key={i}>
                <strong>{r.title}</strong>: {r.impact} {r.extra && `· ${r.extra}`}
              </li>
            )) : (
              <li>You&apos;re already making low-plastic choices. Keep it up!</li>
            )}
          </ul>
        </div>
        <LearnMore />
        <button className={styles.secondaryButton} onClick={onBack} type="button">
          Back to home
        </button>
      </div>
    </section>
  )
}

function ScanScreen({ onPhotoReady, onBack }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState(null)
  const [uploadProminent, setUploadProminent] = useState(false)

  useEffect(() => {
    let stream = null
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setError(null)
        setUploadProminent(false)
      } catch (e) {
        setError('Camera access denied or unavailable.')
        setUploadProminent(true)
      }
    }
    start()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
  }

  const capture = () => {
    if (!videoRef.current) return
    const v = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d').drawImage(v, 0, 0)
    canvas.toBlob(
      (blob) => {
        stopCamera()
        if (blob) onPhotoReady(blob)
      },
      'image/jpeg',
      0.9
    )
  }

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) onPhotoReady(file)
    e.target.value = ''
  }

  return (
    <section className={styles.screen} aria-label="Scan product">
      <button className={styles.backButton} onClick={onBack} type="button" aria-label="Back">
        ← Back
      </button>
      <div className={styles.scanContent}>
        {error && (
          <p className={styles.cameraError}>{error}</p>
        )}
        <div className={styles.cameraWrap}>
          <video
            ref={videoRef}
            className={styles.cameraVideo}
            autoPlay
            playsInline
            muted
            style={{ display: error ? 'none' : 'block' }}
          />
          {error && (
            <div className={styles.cameraPlaceholder}>
              <span>No camera</span>
            </div>
          )}
        </div>
        <div className={styles.scanActions}>
          {!error && (
            <button className={styles.captureButton} onClick={capture} type="button">
              Capture
            </button>
          )}
          <label className={styles.uploadButton + (uploadProminent ? ' ' + styles.uploadProminent : '')}>
            Upload Photo
            <input type="file" accept="image/*" onChange={onFile} />
          </label>
        </div>
      </div>
    </section>
  )
}

function ScanLoadingScreen({ onDemoFallback }) {
  return (
    <section className={styles.screen} aria-label="Analyzing">
      <div className={styles.loadingContent}>
        <div className={styles.spinner} aria-hidden />
        <p className={styles.loadingText}>Analyzing with Gemini AI...</p>
        <p className={styles.loadingHint}>Identifying plastics and packaging</p>
      </div>
    </section>
  )
}

function DemoPickScreen({ onSelect, onBack, error }) {
  return (
    <section className={styles.screen} aria-label="Demo products">
      <button className={styles.backButton} onClick={onBack} type="button">← Back</button>
      <div className={styles.demoContent}>
        {error && <p className={styles.cameraError}>{error} Choose a demo product below.</p>}
        <h2 className={styles.demoTitle}>Try a demo product</h2>
        <p className={styles.demoSub}>Select one to see sample analysis</p>
        <ul className={styles.demoList}>
          {DEMO_PRODUCTS.map((p, i) => (
            <li key={i}>
              <button
                className={styles.demoCard}
                onClick={() => onSelect(p)}
                type="button"
              >
                <span className={styles.demoName}>{p.productType}</span>
                <span className={styles.demoScore}>Score: {p.riskScore} · {p.riskLevel} risk</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ProductResultScreen({ product, onBack, onTrackToProfile, trackSaved }) {
  const [whyOpen, setWhyOpen] = useState(false)
  const p = product || {}
  const score = p.riskScore ?? 0
  const level = (p.riskLevel || '').toLowerCase()
  const riskColor = level === 'low' ? 'green' : level === 'high' ? 'red' : 'yellow'
  const carbon = p.carbonFootprint ?? 0
  const miles = (carbon > 0 ? (carbon / 82) * 0.3 : 0).toFixed(1)
  const breakdown = p.carbonBreakdown || { production: 0, transport: 0, disposal: 0 }

  return (
    <section className={styles.screen} aria-label="Product result">
      <button className={styles.backButton} onClick={onBack} type="button">← Back</button>
      <div className={styles.productResultContent}>
        {(p.productType || p.material) && (
          <p className={styles.productIdentified}>
            Identified: <strong>{[p.productType, p.material].filter(Boolean).join(' · ')}</strong>
          </p>
        )}
        <div className={styles.scoreSection}>
          <div className={styles.trafficLight} data-level={riskColor}>
            {level === 'low' && '🟢'}
            {level === 'medium' && '🟡'}
            {level === 'high' && '🔴'}
          </div>
          <p className={styles.riskScoreText}>{score}/10 Risk Score</p>
          <p className={styles.riskSummary}>
            {level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : 'High'} microplastic exposure risk
          </p>
        </div>

        <div className={styles.card}>
          <h3>Microplastic exposure</h3>
          <p className={styles.bigNumber}>~{(p.microplastics ?? 0).toLocaleString()} particles per use</p>
          <div className={styles.bodyDiagram}>
            <span>bloodstream → lungs → organs<sup className={styles.citationSup}>1,2</sup></span>
          </div>
          <span className={styles.badge} data-level={riskColor}>{p.riskLevel || '—'} concern</span>
        </div>

        <div className={styles.card}>
          <h3>Carbon footprint</h3>
          <p className={styles.bigNumber}>{carbon}g CO2e</p>
          <p className={styles.comparison}>Equal to driving {miles} miles</p>
          <div className={styles.lifecycle}>
            <span>Production: {breakdown.production}g</span>
            <span>Transport: {breakdown.transport}g</span>
            <span>Disposal: {breakdown.disposal}g</span>
          </div>
        </div>

        <div className={styles.card}>
          <button
            className={styles.expandHeader}
            onClick={() => setWhyOpen(!whyOpen)}
            type="button"
            aria-expanded={whyOpen}
          >
            Why this score
            <span className={styles.expandIcon}>{whyOpen ? '−' : '+'}</span>
          </button>
          {whyOpen && (
            <div className={styles.whyBody}>
              <p><strong>Packaging type:</strong> {p.material || p.productType}</p>
              <ul>
                {(p.healthConcerns || []).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3>Better alternatives</h3>
          <div className={styles.alternatives}>
            {(p.alternatives || []).slice(0, 3).map((alt, i) => (
              <div key={i} className={styles.altCard}>
                <strong>{alt.name}</strong>
                <p>↓{alt.microReduction}% microplastics · ↓{alt.carbonReduction}% carbon</p>
                <p className={styles.altMeta}>Price: {alt.price} · Lasts: {alt.lasts}</p>
              </div>
            ))}
          </div>
        </div>

        {onTrackToProfile && (
          <>
            {trackSaved && (
              <p className={`${styles.trackSavedMsg} ${styles.trackSavedMsgAnim}`}>✅ Saved! Daily exposure updated</p>
            )}
            <button
              className={styles.trackProfileBtn}
              onClick={() => onTrackToProfile(product)}
              type="button"
              disabled={trackSaved}
            >
              {trackSaved ? 'Saved!' : 'Add to MicroTrace Profile'}
            </button>
          </>
        )}
        <LearnMore />
        <button className={styles.secondaryButton} onClick={onBack} type="button">Done</button>
      </div>
    </section>
  )
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.WELCOME)
  const [quizAnswers, setQuizAnswers] = useState(null)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [trackSaved, setTrackSaved] = useState(false)

  const goWelcome = () => {
    setScreen(SCREENS.WELCOME)
    setQuizAnswers(null)
    setScanResult(null)
    setScanError(null)
  }

  const goChoice = () => setScreen(SCREENS.CHOICE)
  const goQuiz = () => setScreen(SCREENS.QUIZ)
  const goAssessmentResults = (answers) => {
    setQuizAnswers(answers)
    setScreen(SCREENS.ASSESSMENT_RESULTS)
  }
  const goScan = () => setScreen(SCREENS.SCAN)
  const goScanLoading = () => setScreen(SCREENS.SCAN_LOADING)
  const goScanResult = (product) => {
    setScanResult(product)
    setScreen(SCREENS.SCAN_RESULT)
  }
  const goDemoPick = () => setScreen(SCREENS.SCAN_DEMO_PICK)
  const goProfile = () => setScreen(SCREENS.PROFILE)

  const handleTrackToProfile = (product) => {
    addScanToProfile(product)
    setTrackSaved(true)
    setTimeout(() => setTrackSaved(false), 3000)
  }

  const handlePhotoReady = async (blob) => {
    goScanLoading()
    setScanError(null)
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
    try {
      // Step 1: Image recognition → tags (Imagga, or Gemini vision if Imagga fails)
      let tags
      try {
        tags = await getImageTags(blob)
      } catch (imaggaErr) {
        if (apiKey) {
          console.warn('[Plastic Score] Imagga failed, using Gemini vision:', imaggaErr?.message)
          const identified = await identifyWithGemini(blob)
          tags = [identified.productType, identified.material]
            .filter(Boolean)
            .flatMap((s) => String(s).toLowerCase().split(/\s+/))
        } else {
          throw imaggaErr
        }
      }

      // Step 2: Look up in database by tags
      const dbResult = lookupByTags(tags)
      if (dbResult) {
        goScanResult(dbResult)
        return
      }

      // Step 3: Not in DB → Gemini text lookup from tags (no image, cheaper)
      const result = await lookupWithGemini(tags)
      goScanResult(result)
    } catch (err) {
      const msg = err?.message || err?.cause?.message || err?.toString?.() || 'Analysis failed'
      console.error('[Plastic Score] API error:', err)
      setScanError(msg)
      await new Promise((r) => setTimeout(r, 1500))
      goDemoPick()
    }
  }

  if (screen === SCREENS.WELCOME) {
    return <WelcomeScreen onNext={goChoice} />
  }
  const goInfo = () => setScreen(SCREENS.INFO)
  const showNav = [SCREENS.CHOICE, SCREENS.SCAN, SCREENS.QUIZ, SCREENS.ASSESSMENT_RESULTS, SCREENS.PROFILE, SCREENS.INFO].includes(screen)
  const profile = getProfile()
  const progressBadge = profile?.badges?.filter((b) => b.unlocked).length ?? 0

  const handleNav = (target) => {
    if (target === 'choice') goChoice()
    else if (target === 'scan') goScan()
    else if (target === 'quiz') goQuiz()
    else if (target === 'profile') goProfile()
    else if (target === 'info') goInfo()
  }

  const appContent = (
    <>
      {screen === SCREENS.WELCOME && <WelcomeScreen onNext={goChoice} />}
      {screen === SCREENS.CHOICE && (
        <ChoiceScreen
          onScan={goScan}
          onAssessment={goQuiz}
          onProfile={goProfile}
          onBack={goWelcome}
        />
      )}
      {screen === SCREENS.QUIZ && (
        <QuizScreen onComplete={goAssessmentResults} onSkip={() => goAssessmentResults({})} />
      )}
      {screen === SCREENS.ASSESSMENT_RESULTS && (
        <AssessmentResultsScreen answers={quizAnswers || {}} onBack={goChoice} />
      )}
      {screen === SCREENS.SCAN && (
        <ScanScreen onPhotoReady={handlePhotoReady} onBack={goChoice} />
      )}
      {screen === SCREENS.SCAN_LOADING && <ScanLoadingScreen onDemoFallback={goDemoPick} />}
      {screen === SCREENS.SCAN_DEMO_PICK && (
        <DemoPickScreen onSelect={(p) => goScanResult(p)} onBack={goChoice} error={scanError} />
      )}
      {screen === SCREENS.SCAN_RESULT && (
        <ProductResultScreen
          product={scanResult}
          onBack={goChoice}
          onTrackToProfile={handleTrackToProfile}
          trackSaved={trackSaved}
        />
      )}
      {screen === SCREENS.PROFILE && <MicroTraceProfile onBack={goChoice} />}
      {screen === SCREENS.INFO && (
        <section className={styles.screen} aria-label="Info">
          <div className={styles.infoContent}>
            <h2 className={styles.infoTitle}>About MicroTrace</h2>
            <p className={styles.infoBody}>
              MicroTrace helps you track microplastic exposure and reduce plastic waste. 
            </p>
            <LearnMore />
          </div>
        </section>
      )}
    </>
  )

  if (screen === SCREENS.WELCOME) {
    return <WelcomeScreen onNext={goChoice} />
  }
  if (showNav) {
    return (
      <div className={styles.appWithNav}>
        <NavBar currentScreen={screen} onNavigate={handleNav} progressBadge={progressBadge} />
        <main className={styles.mainContent}>{appContent}</main>
      </div>
    )
  }
  return appContent
}
