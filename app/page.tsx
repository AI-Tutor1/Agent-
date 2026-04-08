'use client'

import { useState, useEffect } from 'react'

const AGENT_TOKEN = process.env.NEXT_PUBLIC_AGENT_TOKEN || ''

type HealthData = {
  status: string
  db: string
  sheets_api: string
  anthropic_api: string
  lms_api: string
  shadow_mode: boolean
  version: string
}

type LogEntry = { time: string; message: string; type: 'info' | 'success' | 'error' }

export default function Dashboard() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [demoId, setDemoId] = useState('')
  const [teacherName, setTeacherName] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [token, setToken] = useState('')

  function log(message: string, type: LogEntry['type'] = 'info') {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), message, type }, ...prev.slice(0, 49)])
  }

  async function fetchHealth() {
    try {
      const res = await fetch('/api/health')
      const data = await res.json()
      setHealth(data)
    } catch {
      setHealth(null)
    }
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  async function runProcessDemo() {
    if (!demoId.trim()) return
    setLoading('process')
    setResult(null)
    log(`Processing demo: ${demoId}`)
    try {
      const res = await fetch('/api/wajeeha/process-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-agent-token': token },
        body: JSON.stringify({ demo_id: demoId.trim() }),
      })
      const data = await res.json()
      setResult(data)
      if (data.success) {
        log(`Demo processed successfully — ${data.conversion_status || ''}`, 'success')
      } else {
        log(`Pipeline error: ${data.error || 'unknown'}`, 'error')
      }
    } catch (e) {
      log(`Request failed: ${String(e)}`, 'error')
    }
    setLoading(null)
  }

  async function runBatchPending() {
    setLoading('batch')
    setResult(null)
    log('Processing batch of pending demos...')
    try {
      const res = await fetch('/api/wajeeha/batch-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-agent-token': token },
        body: JSON.stringify({ limit: 10 }),
      })
      const data = await res.json()
      setResult(data)
      log(`Batch complete — ${data.processed || 0} processed, ${data.failed || 0} failed`, data.failed > 0 ? 'error' : 'success')
    } catch (e) {
      log(`Batch failed: ${String(e)}`, 'error')
    }
    setLoading(null)
  }

  async function runSyncSheets() {
    setLoading('sync')
    setResult(null)
    log('Syncing Google Sheets...')
    try {
      const res = await fetch('/api/wajeeha/sync-sheets', {
        method: 'POST',
        headers: { 'x-agent-token': token },
      })
      const data = await res.json()
      setResult(data)
      log(`Sheets synced — ${data.total_synced || 0} rows`, 'success')
    } catch (e) {
      log(`Sync failed: ${String(e)}`, 'error')
    }
    setLoading(null)
  }

  async function runTeacherReport() {
    if (!teacherName.trim()) return
    setLoading('report')
    setResult(null)
    log(`Fetching report for: ${teacherName}`)
    try {
      const res = await fetch(`/api/wajeeha/teacher-report?teacher_name=${encodeURIComponent(teacherName.trim())}`, {
        headers: { 'x-agent-token': token },
      })
      const data = await res.json()
      setResult(data)
      log(`Report ready for ${teacherName}`, 'success')
    } catch (e) {
      log(`Report failed: ${String(e)}`, 'error')
    }
    setLoading(null)
  }

  const dot = (status: string): string =>
    (status === 'connected' || status === 'ok') ? '🟢' : status === undefined ? '⚪' : '🔴'

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: '#666', textTransform: 'uppercase', marginBottom: 6 }}>Tuitional AI OS</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>Wajeeha Demo Agent</h1>
        <div style={{ color: '#888', marginTop: 4, fontSize: 14 }}>Demo-to-Conversion Analysis Pipeline · Agent One</div>
      </div>

      {/* Health */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {health ? (
              <>
                <span style={{ fontSize: 13 }}>{dot(health.db)} Database</span>
                <span style={{ fontSize: 13 }}>{dot(health.sheets_api)} Sheets API</span>
                <span style={{ fontSize: 13 }}>{dot(health.anthropic_api)} Anthropic</span>
                <span style={{ fontSize: 13 }}>{dot(health.lms_api)} LMS</span>
                <span style={{ fontSize: 13, color: health.shadow_mode ? '#f59e0b' : '#10b981' }}>
                  {health.shadow_mode ? '🔶 Shadow Mode ON' : '🟢 Live Mode'}
                </span>
              </>
            ) : (
              <span style={{ color: '#666', fontSize: 13 }}>Checking health...</span>
            )}
          </div>
          <button onClick={fetchHealth} style={btnStyle('ghost')}>Refresh</button>
        </div>
      </div>

      {/* Token input */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>AGENT_INTERNAL_TOKEN</label>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Paste your AGENT_INTERNAL_TOKEN from .env"
          style={inputStyle}
        />
      </div>

      {/* Actions grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Process Demo */}
        <div style={cardStyle}>
          <div style={cardTitle}>Process Single Demo</div>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>Run all 11 pipeline steps for a demo ID</div>
          <input
            value={demoId}
            onChange={e => setDemoId(e.target.value)}
            placeholder="e.g. 20260101_moazzam_ahmed"
            style={{ ...inputStyle, marginBottom: 10 }}
            onKeyDown={e => e.key === 'Enter' && runProcessDemo()}
          />
          <button onClick={runProcessDemo} disabled={!!loading || !demoId.trim()} style={btnStyle('primary', !!loading)}>
            {loading === 'process' ? 'Processing...' : 'Run Pipeline'}
          </button>
        </div>

        {/* Batch Pending */}
        <div style={cardStyle}>
          <div style={cardTitle}>Batch Process Pending</div>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>Process up to 10 oldest pending demos</div>
          <button onClick={runBatchPending} disabled={!!loading} style={{ ...btnStyle('primary', !!loading), width: '100%' }}>
            {loading === 'batch' ? 'Processing...' : 'Run Batch'}
          </button>
        </div>

        {/* Sync Sheets */}
        <div style={cardStyle}>
          <div style={cardTitle}>Sync Google Sheets</div>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>Pull latest data from all 4 source sheets into the database</div>
          <button onClick={runSyncSheets} disabled={!!loading} style={{ ...btnStyle('secondary', !!loading), width: '100%' }}>
            {loading === 'sync' ? 'Syncing...' : 'Sync Sheets'}
          </button>
        </div>

        {/* Teacher Report */}
        <div style={cardStyle}>
          <div style={cardTitle}>Teacher Report</div>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>AI-generated performance narrative for a teacher</div>
          <input
            value={teacherName}
            onChange={e => setTeacherName(e.target.value)}
            placeholder="e.g. Moazzam Ali"
            style={{ ...inputStyle, marginBottom: 10 }}
            onKeyDown={e => e.key === 'Enter' && runTeacherReport()}
          />
          <button onClick={runTeacherReport} disabled={!!loading || !teacherName.trim()} style={btnStyle('secondary', !!loading)}>
            {loading === 'report' ? 'Generating...' : 'Get Report'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>RESULT</span>
            <button onClick={() => setResult(null)} style={btnStyle('ghost')}>Clear</button>
          </div>
          <pre style={{ margin: 0, fontSize: 12, color: '#d4d4d4', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 400, overflowY: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 10, fontWeight: 600 }}>ACTIVITY LOG</div>
          {logs.map((l, i) => (
            <div key={i} style={{ fontSize: 12, fontFamily: 'monospace', padding: '2px 0', color: l.type === 'success' ? '#4ade80' : l.type === 'error' ? '#f87171' : '#888' }}>
              <span style={{ color: '#444', marginRight: 10 }}>{l.time}</span>{l.message}
            </div>
          ))}
        </div>
      )}

      {/* API reference */}
      <div style={{ marginTop: 24, padding: '12px 16px', background: '#111', borderRadius: 8, fontSize: 12, color: '#555' }}>
        <strong style={{ color: '#444' }}>API endpoints:</strong>{' '}
        <code style={{ color: '#666' }}>POST /api/wajeeha/process-demo</code> ·{' '}
        <code style={{ color: '#666' }}>POST /api/wajeeha/batch-pending</code> ·{' '}
        <code style={{ color: '#666' }}>POST /api/wajeeha/sync-sheets</code> ·{' '}
        <code style={{ color: '#666' }}>GET /api/wajeeha/teacher-report?teacher_name=X</code> ·{' '}
        <code style={{ color: '#666' }}>GET /api/health</code>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: 10,
  padding: 20,
}

const cardTitle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 15,
  marginBottom: 6,
  color: '#fff',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#111',
  border: '1px solid #333',
  borderRadius: 6,
  color: '#e5e5e5',
  fontSize: 13,
  padding: '8px 12px',
  boxSizing: 'border-box',
  outline: 'none',
}

function btnStyle(variant: 'primary' | 'secondary' | 'ghost', disabled = false): React.CSSProperties {
  const base: React.CSSProperties = {
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    padding: '8px 16px',
    opacity: disabled ? 0.5 : 1,
    transition: 'opacity 0.15s',
  }
  if (variant === 'primary') return { ...base, background: '#6366f1', color: '#fff' }
  if (variant === 'secondary') return { ...base, background: '#2a2a2a', color: '#d4d4d4', border: '1px solid #3a3a3a' }
  return { ...base, background: 'transparent', color: '#666', border: '1px solid #2a2a2a' }
}
