import { useState, useEffect, useRef } from 'react'
import { useAllLeads } from '@/hooks/useAllLeads'

const COLUMNS = ['Leads Found', 'Pitch Sent', 'Replied']
const NEXT    = { 'Leads Found': 'Pitch Sent', 'Pitch Sent': 'Replied', 'Replied': null }

/* per-column accent colours */
const COL_META = {
  'Leads Found': {
    dot:    '#4F46E5',
    badge:  { bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE' },
    header: { bg: '#F0F4FF', border: '#DDE3FF' },
    empty:  '#EEF2FF',
  },
  'Pitch Sent': {
    dot:    '#D97706',
    badge:  { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
    header: { bg: '#FFFDF0', border: '#FEF3C7' },
    empty:  '#FFFDF0',
  },
  'Replied': {
    dot:    '#059669',
    badge:  { bg: '#F0FDF4', color: '#065F46', border: '#A7F3D0' },
    header: { bg: '#F0FDF6', border: '#BBF7D0' },
    empty:  '#F0FDF4',
  },
}

const SCORE_STYLE = {
  Hot:  { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3', dot: '#FB7185' },
  Warm: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', dot: '#FBBF24' },
  Cold: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', dot: '#60A5FA' },
}

/* ── Copy button ── */
function CopyBtn({ text, label = 'Copy' }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000) }}
      style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
        borderRadius: 7, border: `1.5px solid ${ok ? '#BBF7D0' : '#E8E6E1'}`,
        background: ok ? '#F0FDF4' : 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600,
        color: ok ? '#166534' : '#4A4740', fontFamily: 'inherit', transition: 'all 150ms',
      }}
    >
      {ok ? '✓ Copied' : label}
    </button>
  )
}

/* ── AI Objection Handler ── */
function ObjectionHandler({ lead }) {
  const [val, setVal] = useState('')
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const go = async () => {
    if (!val.trim()) return
    setBusy(true); setOut(''); setErr(null)
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `You are a sharp B2B sales strategist for Stichting Nebulist (Dutch kinetic art installations). Prospect: ${lead.company_name} (${lead.lead_score} priority). Client objection: "${val.trim()}". Respond with a direct, confident tactical counter in 3-4 sentences. Focus on reframing the objection and advancing toward a rental agreement. English only.` }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 400 } }) }
      )
      if (!r.ok) throw new Error(`Gemini ${r.status}`)
      const d = await r.json()
      setOut(d?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response.')
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <div style={{ paddingTop: 16, borderTop: '1.5px solid #F0EDE8' }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B8B4AA', marginBottom: 10 }}>
        AI Objection Handler
      </p>
      <textarea
        rows={2}
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Paste the client's objection or reply here…"
        style={{
          width: '100%', padding: '10px 12px', fontSize: 13, borderRadius: 10,
          border: '1.5px solid #E8E6E1', background: '#FAFAF8', resize: 'none',
          fontFamily: 'inherit', color: '#111214', outline: 'none', lineHeight: 1.5,
        }}
      />
      <button
        onClick={go}
        disabled={busy || !val.trim()}
        style={{
          marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 9, border: 'none', cursor: busy || !val.trim() ? 'not-allowed' : 'pointer',
          background: busy || !val.trim() ? '#E8E6E1' : 'linear-gradient(135deg, #0F1117, #1A1D27)',
          color: busy || !val.trim() ? '#9C998F' : 'white',
          fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
          letterSpacing: '-0.01em', transition: 'all 150ms',
        }}
      >
        {busy ? (
          <>
            <svg className="animate-spin-slow" style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.3 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Thinking…
          </>
        ) : '⚡ Get AI Advice'}
      </button>

      {err && <p style={{ marginTop: 10, fontSize: 12, color: '#BE123C', background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 8, padding: '8px 12px' }}>{err}</p>}

      {out && (
        <div className="animate-fade-up" style={{ marginTop: 12, background: '#F8FAFF', border: '1.5px solid #C7D2FE', borderRadius: 12, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4F46E5' }}>AI Tactical Advice</p>
            <CopyBtn text={out} />
          </div>
          <p style={{ fontSize: 13, color: '#1E1B4B', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{out}</p>
        </div>
      )}
    </div>
  )
}

/* ── Lead Modal ── */
function LeadModal({ lead, onClose, onMove, onDelete }) {
  const [tab, setTab] = useState('en')
  const ref = useRef(null)
  const next = NEXT[lead.status]
  const score = SCORE_STYLE[lead.lead_score] ?? SCORE_STYLE.Cold
  const email = tab === 'en' ? lead.pitch_email_en : lead.pitch_email_nl

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div
      ref={ref}
      onClick={e => { if (e.target === ref.current) onClose() }}
      className="animate-fade-in"
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'rgba(15,17,23,0.75)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          background: 'white', borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          width: '100%', maxWidth: 640,
          maxHeight: '90vh', overflowY: 'auto',
          border: '1.5px solid #E8E6E1',
        }}
      >
        {/* Modal header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'white', borderBottom: '1.5px solid #F0EDE8',
          borderRadius: '20px 20px 0 0',
          padding: '16px 20px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111214', letterSpacing: '-0.02em' }}>{lead.company_name}</h2>
              {/* Score badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 9px', borderRadius: 99,
                background: score.bg, border: `1.5px solid ${score.border}`,
                fontSize: 11, fontWeight: 700, color: score.color,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: score.dot, display: 'inline-block' }} />
                {lead.lead_score}
              </span>
              {/* Status */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 9px', borderRadius: 99,
                background: COL_META[lead.status]?.badge.bg,
                border: `1.5px solid ${COL_META[lead.status]?.badge.border}`,
                fontSize: 11, fontWeight: 600, color: COL_META[lead.status]?.badge.color,
              }}>
                {lead.status}
              </span>
            </div>
            {lead.website && (
              <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#4F46E5', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                onMouseLeave={e => e.target.style.textDecoration = 'none'}
              >
                ↗ {lead.website}
              </a>
            )}
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, border: '1.5px solid #E8E6E1',
            background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#9C998F', flexShrink: 0, fontFamily: 'inherit', fontSize: 14,
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Score reason */}
          {lead.score_reason && (
            <div style={{ background: '#FAFAF8', border: '1.5px solid #E8E6E1', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B8B4AA', marginBottom: 6 }}>AI Score Reasoning</p>
              <p style={{ fontSize: 13, color: '#4A4740', lineHeight: 1.65 }}>{lead.score_reason}</p>
            </div>
          )}

          {/* Email tabs */}
          <div>
            <div style={{ display: 'flex', gap: 4, background: '#F4F3F0', padding: 4, borderRadius: 10, width: 'fit-content', marginBottom: 12 }}>
              {[{ id: 'en', label: '🇬🇧 English' }, { id: 'nl', label: '🇳🇱 Nederlands' }].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: tab === t.id ? 'white' : 'transparent',
                  boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                  color: tab === t.id ? '#111214' : '#9C998F',
                  fontFamily: 'inherit', transition: 'all 150ms',
                }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                <CopyBtn text={email ?? ''} label="Copy email" />
              </div>
              <pre style={{
                background: '#FAFAF8', border: '1.5px solid #E8E6E1', borderRadius: 12,
                padding: '40px 16px 16px', fontSize: 12, color: '#4A4740',
                whiteSpace: 'pre-wrap', lineHeight: 1.7, fontFamily: 'var(--font-mono)',
                minHeight: 100, overflow: 'auto',
              }}>
                {email || <span style={{ color: '#B8B4AA', fontStyle: 'italic' }}>No draft available.</span>}
              </pre>
            </div>
          </div>

          {/* Move status */}
          {next && (
            <button onClick={() => { onMove(lead.id, next); onClose() }} style={{
              width: '100%', padding: '10px 16px',
              border: '1.5px solid #D4D0C8', borderRadius: 10,
              background: 'white', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: '#4A4740', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 150ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F3F0' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Move to "{next}"
            </button>
          )}

          {/* Delete lead */}
          <DeleteConfirmButton
            label="Delete this lead"
            onConfirm={() => { onDelete(lead.id); onClose() }}
            fullWidth
          />

          <ObjectionHandler lead={lead} />
        </div>
      </div>
    </div>
  )
}

/* ── Inline delete confirm button ── */
function DeleteConfirmButton({ onConfirm, label = 'Delete', fullWidth = false }) {
  const [confirming, setConfirming] = useState(false)
  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', width: fullWidth ? '100%' : 'auto' }}>
        <span style={{ fontSize: 11, color: '#BE123C', fontWeight: 600, flex: fullWidth ? 1 : 'auto' }}>Sure?</span>
        <button
          onClick={onConfirm}
          style={{
            padding: fullWidth ? '8px 0' : '5px 10px',
            flex: fullWidth ? 1 : 'auto',
            borderRadius: 7, border: 'none', cursor: 'pointer',
            background: '#BE123C', color: 'white',
            fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
          }}
        >Yes, delete</button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            padding: fullWidth ? '8px 0' : '5px 10px',
            flex: fullWidth ? 1 : 'auto',
            borderRadius: 7, border: '1.5px solid #E8E6E1', cursor: 'pointer',
            background: 'white', color: '#4A4740',
            fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
          }}
        >Cancel</button>
      </div>
    )
  }
  return (
    <button
      onClick={() => setConfirming(true)}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: fullWidth ? '9px 16px' : '5px 8px',
        width: fullWidth ? '100%' : 'auto',
        borderRadius: fullWidth ? 10 : 7,
        border: `1.5px solid ${fullWidth ? '#FECDD3' : '#F0EDE8'}`,
        background: fullWidth ? '#FFF1F2' : 'white',
        color: fullWidth ? '#BE123C' : '#D1C9C0',
        cursor: 'pointer', fontFamily: 'inherit',
        fontSize: fullWidth ? 13 : 12, fontWeight: fullWidth ? 600 : 400,
        transition: 'all 150ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#FECDD3'; e.currentTarget.style.color = '#BE123C'; e.currentTarget.style.background = '#FFF1F2' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = fullWidth ? '#FECDD3' : '#F0EDE8'; e.currentTarget.style.color = fullWidth ? '#BE123C' : '#D1C9C0'; e.currentTarget.style.background = fullWidth ? '#FFF1F2' : 'white' }}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13, flexShrink: 0 }}>
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {fullWidth && label}
    </button>
  )
}

/* ── Lead Card ── */
function LeadCard({ lead, onOpen, onMove, onDelete }) {
  const next = NEXT[lead.status]
  const score = SCORE_STYLE[lead.lead_score] ?? SCORE_STYLE.Cold
  const col = COL_META[lead.status]

  return (
    <div
      className="animate-fade-up"
      style={{
        background: 'white',
        border: '1.5px solid #E8E6E1',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 200ms, transform 200ms',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}
    >
      {/* Score color strip */}
      <div style={{ height: 3, background: score.dot }} />

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Company + score */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111214', lineHeight: 1.3 }}>{lead.company_name}</p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
            padding: '2px 7px', borderRadius: 99,
            background: score.bg, border: `1.5px solid ${score.border}`,
            fontSize: 10, fontWeight: 700, color: score.color,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: score.dot, display: 'inline-block' }} />
            {lead.lead_score}
          </span>
        </div>

        {/* Description */}
        {lead.description && (
          <p style={{ fontSize: 11, color: '#9C998F', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {lead.description}
          </p>
        )}

        {/* Website */}
        {lead.website && (
          <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ fontSize: 11, color: '#4F46E5', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
            ↗ {lead.website}
          </a>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, paddingTop: 8, borderTop: '1.5px solid #F0EDE8' }}>
          <button
            onClick={() => onOpen(lead)}
            style={{
              flex: 1, padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#0F1117', color: 'white', fontSize: 12, fontWeight: 700,
              fontFamily: 'inherit', transition: 'background 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1A1D27'}
            onMouseLeave={e => e.currentTarget.style.background = '#0F1117'}
          >
            Review & Pitch
          </button>
          {next && (
            <button
              onClick={() => onMove(lead.id, next)}
              style={{
                padding: '7px 10px', borderRadius: 8, border: '1.5px solid #E8E6E1',
                background: 'white', color: '#4A4740', fontSize: 11, fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                whiteSpace: 'nowrap', transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F3F0'; e.currentTarget.style.borderColor = '#D4D0C8' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E8E6E1' }}
            >
              →
            </button>
          )}
          {/* Trash icon — inline confirm */}
          <DeleteConfirmButton onConfirm={() => onDelete(lead.id)} />
        </div>
      </div>
    </div>
  )
}

/* ── Kanban Column ── */
function Column({ title, leads, onOpen, onMove, onDelete }) {
  const meta = COL_META[title]
  return (
    <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Column header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', borderRadius: 10,
        background: meta.header.bg,
        border: `1.5px solid ${meta.header.border}`,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.dot, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: '#111214', textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1 }}>{title}</span>
        <span style={{
          padding: '1px 7px', borderRadius: 99, fontSize: 11, fontWeight: 700,
          background: meta.badge.bg, border: `1.5px solid ${meta.badge.border}`, color: meta.badge.color,
        }}>{leads.length}</span>
        {/* Clear column button */}
        {leads.length > 0 && (
          <ClearColumnButton leads={leads} onDelete={onDelete} />
        )}
      </div>

      {/* Cards or empty */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {leads.length === 0 ? (
          <div style={{
            flex: 1, minHeight: 140, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 12, border: '2px dashed #E8E6E1',
            background: meta.empty, opacity: 0.6,
          }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#D4D0C8" strokeWidth={1.5} style={{ width: 28, height: 28 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p style={{ fontSize: 11, color: '#B8B4AA', fontWeight: 500 }}>No leads yet</p>
          </div>
        ) : (
          leads.map(l => <LeadCard key={l.id} lead={l} onOpen={onOpen} onMove={onMove} onDelete={onDelete} />)
        )}
      </div>
    </div>
  )
}

/* ── Clear column confirm button ── */
function ClearColumnButton({ leads, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={() => { leads.forEach(l => onDelete(l.id)); setConfirming(false) }}
          style={{ padding: '2px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#BE123C', color: 'white', fontSize: 10, fontWeight: 700, fontFamily: 'inherit' }}
        >Clear</button>
        <button
          onClick={() => setConfirming(false)}
          style={{ padding: '2px 8px', borderRadius: 6, border: '1.5px solid #D4D0C8', cursor: 'pointer', background: 'white', color: '#4A4740', fontSize: 10, fontWeight: 600, fontFamily: 'inherit' }}
        >No</button>
      </div>
    )
  }
  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Clear all ${leads.length} leads`}
      style={{
        padding: '2px 7px', borderRadius: 6, border: '1.5px solid #F0EDE8',
        background: 'white', color: '#C4B8AE', cursor: 'pointer',
        fontSize: 10, fontWeight: 600, fontFamily: 'inherit', transition: 'all 150ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#FECDD3'; e.currentTarget.style.color = '#BE123C'; e.currentTarget.style.background = '#FFF1F2' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0EDE8'; e.currentTarget.style.color = '#C4B8AE'; e.currentTarget.style.background = 'white' }}
    >
      Clear
    </button>
  )
}

/* ── Main ── */
export default function LeadsView() {
  const { leads, loading, error, updateStatus, deleteLead, refetch } = useAllLeads()
  const [modal, setModal] = useState(null)
  const grouped = COLUMNS.reduce((a, c) => ({ ...a, [c]: leads.filter(l => l.status === c) }), {})

  return (
    <>
      <div style={{ minHeight: '100%', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>

        {/* ── Topbar ── */}
        <div style={{
          background: 'white', borderBottom: '1.5px solid #E8E6E1',
          padding: '20px 32px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111214', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Prospect Pipeline
            </h1>
            <p style={{ fontSize: 13, color: '#9C998F', marginTop: 4 }}>
              {loading && !leads.length
                ? 'Loading prospects…'
                : `${leads.length} prospect${leads.length !== 1 ? 's' : ''} across all stages`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Stage summary pills */}
            {leads.length > 0 && COLUMNS.map(c => {
              const m = COL_META[c]
              return (
                <span key={c} style={{
                  display: 'none',
                  ...(typeof window !== 'undefined' && window.innerWidth > 1100 ? { display: 'inline-flex' } : {}),
                  alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 99,
                  background: m.badge.bg, border: `1.5px solid ${m.badge.border}`,
                  fontSize: 11, fontWeight: 600, color: m.badge.color,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.dot }} />
                  {grouped[c]?.length} {c}
                </span>
              )
            })}
            <button
              onClick={refetch}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 9,
                border: '1.5px solid #E8E6E1', background: 'white',
                fontSize: 12, fontWeight: 600, color: '#4A4740', fontFamily: 'inherit', cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F4F3F0'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <svg style={{ width: 13, height: 13, animation: loading ? 'spin 1s linear infinite' : 'none' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div style={{ margin: '16px 32px 0', padding: '10px 14px', background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 10, fontSize: 13, color: '#BE123C' }}>
            {error}
          </div>
        )}

        {/* ── Kanban board ── */}
        <div className="stagger" style={{ flex: 1, display: 'flex', gap: 16, padding: '24px 32px', overflowX: 'auto' }}>
          {COLUMNS.map(c => (
            <Column key={c} title={c} leads={grouped[c] ?? []} onOpen={setModal} onMove={updateStatus} onDelete={deleteLead} />
          ))}
        </div>

      </div>

      {modal && (
        <LeadModal
          lead={modal}
          onClose={() => setModal(null)}
          onMove={(id, status) => { updateStatus(id, status); setModal(p => p?.id === id ? { ...p, status } : p) }}
          onDelete={(id) => { deleteLead(id); setModal(null) }}
        />
      )}
    </>
  )
}
