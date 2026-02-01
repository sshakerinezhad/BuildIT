import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import KitCard from './components/KitCard'
import CustomPartInput from './components/CustomPartInput'
import StepWizard from './components/StepWizard'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [mode, setMode] = useState('build') // 'build' | 'reverse'
  const [kits, setKits] = useState([])
  const [selectedKits, setSelectedKits] = useState([])
  const [customParts, setCustomParts] = useState([])
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch kits on mount
  useEffect(() => {
    fetch(`${API_URL}/api/kits`)
      .then(res => res.json())
      .then(data => setKits(data))
      .catch(err => console.error('Failed to fetch kits:', err))
  }, [])

  const toggleKit = (kitId) => {
    setSelectedKits(prev =>
      prev.includes(kitId)
        ? prev.filter(id => id !== kitId)
        : [...prev, kitId]
    )
  }

  const handleGenerate = async () => {
    setLoading(true)
    setResult(null)

    try {
      const body = mode === 'build'
        ? {
            mode: 'build',
            kits: selectedKits,
            custom_parts: customParts,
            goal: 'Suggest a project'
          }
        : { mode: 'reverse', kits: [], custom_parts: [], goal }

      const res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (!res.ok) {
        const errMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
        throw new Error(errMsg || 'Generation failed')
      }

      setResult(data)
      setActiveTab('overview')
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const canGenerate = mode === 'build'
    ? selectedKits.length > 0 || customParts.length > 0
    : goal.trim().length > 0

  return (
    <div className="app">
      <header className="header">
        <h1>BuildIT</h1>
        <p className="tagline">AI-Powered Robotics Build Planner</p>
      </header>

      <main className="main">
        <div className="container">
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'build' ? 'active' : ''}`}
              onClick={() => setMode('build')}
            >
              <span className="mode-icon">🔧</span>
              Build Mode
            </button>
            <button
              className={`mode-btn ${mode === 'reverse' ? 'active' : ''}`}
              onClick={() => setMode('reverse')}
            >
              <span className="mode-icon">🎯</span>
              Reverse Mode
            </button>
          </div>

          <p className="mode-desc">
            {mode === 'build'
              ? "Select your kits → Get build ideas and instructions"
              : "Describe what you want → Get parts list and where to buy"}
          </p>

          {/* Input Section */}
          <div className="input-section">
            {mode === 'build' ? (
              <div className="kit-selector">
                <label>Select Your Kits:</label>
                <div className="kit-grid">
                  {kits.map(kit => (
                    <KitCard
                      key={kit.id}
                      kit={kit}
                      selected={selectedKits.includes(kit.id)}
                      onToggle={() => toggleKit(kit.id)}
                    />
                  ))}
                </div>

                <CustomPartInput
                  parts={customParts}
                  onPartsChange={setCustomParts}
                />
              </div>
            ) : (
              <div className="goal-input">
                <label>What do you want to build?</label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., A robot arm that can pick up small objects..."
                  rows={4}
                />
              </div>
            )}

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
            >
              {loading ? (
                <span className="loading-text">
                  <span className="spinner" />
                  Generating...
                </span>
              ) : (
                'Generate Plan'
              )}
            </button>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="results skeleton">
              <div className="skeleton-tabs">
                <div className="skeleton-tab" />
                <div className="skeleton-tab" />
                <div className="skeleton-tab" />
                <div className="skeleton-tab" />
              </div>
              <div className="skeleton-content">
                <div className="skeleton-line wide" />
                <div className="skeleton-line" />
                <div className="skeleton-line medium" />
                <div className="skeleton-line" />
                <div className="skeleton-line wide" />
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && !loading && (
            <div className="results fade-in">
              {result.error ? (
                <div className="error">{result.error}</div>
              ) : (
                <>
                  <div className="tabs">
                    {['overview', 'steps', mode === 'build' ? 'wiring' : 'parts', 'code'].map(tab => (
                      <button
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="tab-content">
                    {activeTab === 'overview' && (
                      <>
                        <ReactMarkdown>{result.overview || 'No overview'}</ReactMarkdown>
                        {result.tips?.length > 0 && (
                          <div className="tips-section">
                            <h3>💡 Tips</h3>
                            <ul>{result.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                          </div>
                        )}
                      </>
                    )}
                    {activeTab === 'steps' && (
                      <StepWizard steps={result.steps || []} />
                    )}
                    {activeTab === 'wiring' && (
                      <ReactMarkdown>{result.wiring || 'No wiring info'}</ReactMarkdown>
                    )}
                    {activeTab === 'parts' && (
                      <>
                        <h3>Parts Needed</h3>
                        <ul className="parts-list">
                          {result.parts_needed?.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                        {result.estimated_cost && (
                          <p className="cost-estimate">
                            <strong>Estimated Cost:</strong> {result.estimated_cost}
                          </p>
                        )}
                        {result.where_to_buy?.length > 0 && (
                          <>
                            <h3>Where to Buy</h3>
                            <ul className="buy-list">
                              {result.where_to_buy.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                          </>
                        )}
                      </>
                    )}
                    {activeTab === 'code' && (
                      <pre className="code-block"><code>{result.firmware || 'No code generated'}</code></pre>
                    )}
                  </div>
                  {result.model_used && (
                    <p className="model-info">Generated by: {result.model_used}</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Powered by Gemini AI</p>
      </footer>
    </div>
  )
}

export default App
