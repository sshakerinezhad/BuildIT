import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'

const API_URL = 'http://localhost:8000'

function App() {
  const [mode, setMode] = useState('build') // 'build' | 'reverse'
  const [kits, setKits] = useState([])
  const [selectedKits, setSelectedKits] = useState([])
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
        ? { mode: 'build', kits: selectedKits, goal: 'Suggest a project' }
        : { mode: 'reverse', kits: [], goal }

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
    ? selectedKits.length > 0
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
              🔧 Build Mode
            </button>
            <button
              className={`mode-btn ${mode === 'reverse' ? 'active' : ''}`}
              onClick={() => setMode('reverse')}
            >
              🎯 Reverse Mode
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
                    <div
                      key={kit.id}
                      className={`kit-card ${selectedKits.includes(kit.id) ? 'selected' : ''}`}
                      onClick={() => toggleKit(kit.id)}
                    >
                      <h3>{kit.name}</h3>
                      <p>{kit.parts?.length || 0} parts</p>
                    </div>
                  ))}
                </div>
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
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="results">
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
                          <>
                            <h3>Tips</h3>
                            <ul>{result.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                          </>
                        )}
                      </>
                    )}
                    {activeTab === 'steps' && (
                      <ol>{result.steps?.map((step, i) => <li key={i}>{step}</li>)}</ol>
                    )}
                    {activeTab === 'wiring' && (
                      <ReactMarkdown>{result.wiring || 'No wiring info'}</ReactMarkdown>
                    )}
                    {activeTab === 'parts' && (
                      <>
                        <h3>Parts Needed</h3>
                        <ul>{result.parts_needed?.map((p, i) => <li key={i}>{p}</li>)}</ul>
                        {result.estimated_cost && <p><strong>Estimated Cost:</strong> {result.estimated_cost}</p>}
                        {result.where_to_buy?.length > 0 && (
                          <>
                            <h3>Where to Buy</h3>
                            <ul>{result.where_to_buy.map((w, i) => <li key={i}>{w}</li>)}</ul>
                          </>
                        )}
                      </>
                    )}
                    {activeTab === 'code' && (
                      <pre><code>{result.firmware || 'No code generated'}</code></pre>
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
