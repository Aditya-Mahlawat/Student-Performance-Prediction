"use client"
import { useState } from 'react'

const API = 'http://localhost:8003'

const defaultStudent = {
  age: 20, gender: 'F', major: 'STEM',
  study_hours_per_week: 15.0, attendance_rate: 0.9,
  previous_gpa: 3.2, assignments_completed: 30.0,
  parent_education: 'Bachelors', income_level: 'Medium',
  extracurriculars: true, has_tutor: false,
}

const sampleStudents = [
  { label: '🏆 Top Student', age: 20, gender: 'F', major: 'STEM', study_hours_per_week: 35, attendance_rate: 0.98, previous_gpa: 3.9, assignments_completed: 48, parent_education: 'PhD', income_level: 'High', extracurriculars: true, has_tutor: true },
  { label: '📚 Average', age: 21, gender: 'M', major: 'Business', study_hours_per_week: 15, attendance_rate: 0.82, previous_gpa: 2.8, assignments_completed: 30, parent_education: 'Bachelors', income_level: 'Medium', extracurriculars: false, has_tutor: false },
  { label: '⚠️ At Risk', age: 22, gender: 'M', major: 'Arts', study_hours_per_week: 3, attendance_rate: 0.45, previous_gpa: 1.5, assignments_completed: 8, parent_education: 'HighSchool', income_level: 'Low', extracurriculars: false, has_tutor: false },
]

function GradeBadge({ band }: { band: string }) {
  const colors: any = { A: '#10b981', B: '#6366f1', C: '#f59e0b', F: '#ef4444' }
  const c = colors[band] || '#64748b'
  return (
    <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: c }}>
      {band}
    </div>
  )
}

function ProgressBar({ value, max, color }: any) {
  return (
    <div style={{ background: '#22263a', borderRadius: 999, height: 8, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color, height: '100%', borderRadius: 999, transition: 'width 0.5s ease' }} />
    </div>
  )
}

export default function StudentApp() {
  const [form, setForm] = useState<any>(defaultStudent)
  const [result, setResult] = useState<any>(null)
  const [roster, setRoster] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [studentName, setStudentName] = useState('')

  function handle(k: string, v: any) { setForm((p: any) => ({ ...p, [k]: v })) }
  function loadSample(s: any) { const { label, ...rest } = s; setForm(rest); setResult(null) }

  async function predict() {
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API}/predict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      setResult(d)
      setRoster(prev => [{
        name: studentName || `Student ${prev.length + 1}`,
        major: form.major, gpa: form.previous_gpa, ...d, ts: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)])
    } catch { setError('Cannot reach backend. Start FastAPI on port 8000.') }
    setLoading(false)
  }

  async function scoreAll() {
    setError('')
    for (const s of sampleStudents) {
      const { label, ...rest } = s
      try {
        const r = await fetch(`${API}/predict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rest) })
        const d = await r.json()
        setRoster(prev => [{ name: label, major: rest.major, gpa: rest.previous_gpa, ...d, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 10))
      } catch { setError('Backend error.'); break }
      await new Promise(r => setTimeout(r, 300))
    }
  }

  const bandColors: any = { A: '#10b981', B: '#6366f1', C: '#f59e0b', F: '#ef4444' }
  const rc = result ? (result.at_risk ? '#ef4444' : '#10b981') : '#6366f1'

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1d27, #22263a)', borderBottom: '1px solid #2e3247', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg, #10b981, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduInsight AI</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Student Performance Prediction & Risk Tracking</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {sampleStudents.map(s => (
            <button key={s.label} onClick={() => loadSample(s)} style={{ background: '#22263a', border: '1px solid #2e3247', borderRadius: 8, padding: '8px 14px', color: '#e2e8f0', fontSize: 13, cursor: 'pointer' }}>
              {s.label}
            </button>
          ))}
          <button onClick={scoreAll} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Score All Samples →
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 40px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
        {/* LEFT: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Student Name */}
          <div style={{ background: '#1a1d27', border: '1px solid #2e3247', borderRadius: 12, padding: 20 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Student Name (optional label)</label>
            <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Jane Smith"
              style={{ width: '100%', background: '#22263a', border: '1px solid #2e3247', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
          </div>

          {/* Demographics */}
          <div style={{ background: '#1a1d27', border: '1px solid #2e3247', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 18, textTransform: 'uppercase', letterSpacing: 1 }}>👤 Demographics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Age</label>
                <input type="number" value={form.age} onChange={e => handle('age', Number(e.target.value))}
                  style={{ width: '100%', background: '#22263a', border: '1px solid #2e3247', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
              </div>
              {[
                { k: 'gender', l: 'Gender', opts: ['F', 'M', 'Other'] },
                { k: 'major', l: 'Major', opts: ['STEM', 'Arts', 'Business', 'Humanities'] },
                { k: 'parent_education', l: 'Parent Education', opts: ['HighSchool', 'Bachelors', 'Masters', 'PhD'] },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>{f.l}</label>
                  <select value={form[f.k]} onChange={e => handle(f.k, e.target.value)}
                    style={{ width: '100%', background: '#22263a', border: '1px solid #2e3247', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}>
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Income Level</label>
                <select value={form.income_level} onChange={e => handle('income_level', e.target.value)}
                  style={{ width: '100%', background: '#22263a', border: '1px solid #2e3247', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}>
                  {['Low', 'Medium', 'High'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'flex-end' }}>
                {[['extracurriculars', 'Extracurriculars'], ['has_tutor', 'Has Tutor']].map(([k, l]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e2e8f0', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form[k]} onChange={e => handle(k, e.target.checked)} style={{ width: 16, height: 16, accentColor: '#10b981' }} /> {l}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Academic */}
          <div style={{ background: '#1a1d27', border: '1px solid #2e3247', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#6366f1', marginBottom: 18, textTransform: 'uppercase', letterSpacing: 1 }}>📊 Academic Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {[
                { k: 'previous_gpa', l: 'Previous GPA (0–4.0)', step: '0.1', min: 0, max: 4 },
                { k: 'study_hours_per_week', l: 'Study Hrs / Week', step: '1', min: 0, max: 60 },
                { k: 'assignments_completed', l: 'Assignments Done', step: '1', min: 0, max: 50 },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>{f.l}</label>
                  <input type="number" step={f.step} min={f.min} max={f.max} value={form[f.k]} onChange={e => handle(f.k, Number(e.target.value))}
                    style={{ width: '100%', background: '#22263a', border: '1px solid #2e3247', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Attendance Rate (0–1)</label>
                <input type="number" step="0.01" min={0} max={1} value={form.attendance_rate} onChange={e => handle('attendance_rate', Number(e.target.value))}
                  style={{ width: '100%', background: '#22263a', border: '1px solid #2e3247', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
              </div>
            </div>

            {/* Visual sliders summary */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'GPA', v: form.previous_gpa, max: 4, c: '#6366f1' },
                { l: 'Attendance', v: form.attendance_rate * 40, max: 40, c: '#10b981' },
                { l: 'Study Hours', v: form.study_hours_per_week, max: 40, c: '#f59e0b' },
              ].map(b => (
                <div key={b.l} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#64748b', width: 80, flexShrink: 0 }}>{b.l}</span>
                  <ProgressBar value={b.v} max={b.max} color={b.c} />
                  <span style={{ fontSize: 12, color: '#e2e8f0', width: 40, textAlign: 'right', flexShrink: 0 }}>{b.l === 'Attendance' ? `${Math.round(form.attendance_rate * 100)}%` : b.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={predict} disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? '⏳ Predicting...' : '🎓 Predict Performance'}
            </button>
            <button onClick={() => { setForm(defaultStudent); setResult(null); setStudentName('') }} style={{ flex: 1, background: '#22263a', color: '#64748b', border: '1px solid #2e3247', borderRadius: 10, padding: '14px', cursor: 'pointer' }}>
              ↺ Reset
            </button>
          </div>
          {error && <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: 8, padding: 12, color: '#ef4444', fontSize: 14 }}>⚠️ {error}</div>}
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Result */}
          <div style={{ background: '#1a1d27', border: `1px solid ${rc}66`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Prediction Result</div>
            {result ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <GradeBadge band={result.grade_band} />
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: bandColors[result.grade_band] }}>{Math.round(result.pass_prob * 100)}%</div>
                <div style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>Pass Probability</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <span style={{ background: rc + '22', color: rc, border: `1px solid ${rc}66`, borderRadius: 8, padding: '6px 16px', fontSize: 14, fontWeight: 700 }}>
                    {result.at_risk ? '⚠️ At Risk' : '✅ On Track'}
                  </span>
                </div>
                <div style={{ marginTop: 16, background: '#22263a', borderRadius: 8, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { l: 'Grade Band', v: result.grade_band, c: bandColors[result.grade_band] },
                    { l: 'Pass Prob', v: `${Math.round(result.pass_prob * 100)}%`, c: '#e2e8f0' },
                  ].map(s => (
                    <div key={s.l}>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{s.l}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: s.c }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 14 }}>
                Predict a student to see results
              </div>
            )}
          </div>

          {/* Class Roster */}
          <div style={{ background: '#1a1d27', border: '1px solid #2e3247', borderRadius: 12, padding: 20, flex: 1 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Class Roster</div>
            {roster.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No students scored yet</div>
            ) : roster.map((s, i) => {
              const c = bandColors[s.grade_band] || '#64748b'
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#22263a', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{s.major} • GPA {s.gpa}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {s.at_risk && <span style={{ fontSize: 11, color: '#ef4444' }}>⚠️</span>}
                    <div style={{ background: c + '22', color: c, border: `1px solid ${c}44`, borderRadius: 6, padding: '4px 12px', fontWeight: 700, fontSize: 14 }}>{s.grade_band}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
