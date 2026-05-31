import { useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { runProspectingEngine } from '@/services/aiOrchestrator'

/* ─── Default Nebulist product profile ─── */
const DEFAULT_PROFILE = {
  name:        'Bubble Bike',
  description: 'A mobile cargo bike transformed into an enchanting bubble installation that roams and fills any venue with thousands of iridescent bubbles. 100% biodegradable, non-toxic bubble solution — safe for children and animals. Operated by a professional artist who refuels every 2 hours. Suitable for outdoor (min. 3×3 m) and indoor events (min. 5 m ceiling). Available across the Netherlands and Europe.',
  rentalPrice: '1750',
  baseCost:    '350',
}

const STORAGE_KEY = 'nebulakit_product_profile'

const INDUSTRIES = [
  { value: 'Nightclubs & Bars',    icon: '🍸', sub: 'Club nights, bars, immersive lounges' },
  { value: 'Music Festivals',      icon: '🎪', sub: 'Outdoor festivals, stages, crowd experiences' },
  { value: 'Corporate Events',     icon: '🏢', sub: 'Brand activations, product launches, conferences' },
  { value: 'Museums & Public Art', icon: '🖼️', sub: 'Art installations, public spaces, galleries' },
]

const NL_CITIES = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere']

/* ─── Shared input style ─── */
const iBase = {
  width: '100%', padding: '9px 12px',
  background: '#FAFAF8', border: '1.5px solid #E8E6E1',
  borderRadius: 9, fontSize: 13, color: '#111214',
  fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
}

/* ─── Dropzone ─── */
function Dropzone({ file, onChange }) {
  const ref = useRef(null)
  const [drag, setDrag] = useState(false)
  const drop = useCallback(e => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.type.startsWith('image/')) onChange(f)
  }, [onChange])
  return (
    <div onClick={() => ref.current?.click()} onDrop={drop}
      onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
      style={{ border: `2px dashed ${drag ? '#4F46E5' : '#D4D0C8'}`, borderRadius: 10,
        padding: '20px', textAlign: 'center', cursor: 'pointer',
        background: drag ? '#EEF2FF' : '#FAFAF8', transition: 'all 200ms' }}>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onChange(e.target.files[0])} />
      {file ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <img src={URL.createObjectURL(file)} alt="" style={{ height: 72, width: '100%', objectFit: 'cover', borderRadius: 6 }} />
          <button type="button" onClick={e => { e.stopPropagation(); onChange(null) }}
            style={{ fontSize: 11, color: '#BE123C', background: 'none', border: 'none', cursor: 'pointer' }}>
            Remove
          </button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#4A4740' }}>Click or drop photo</p>
          <p style={{ fontSize: 11, color: '#9C998F', marginTop: 2 }}>PNG, JPG · max 10 MB</p>
        </>
      )}
    </div>
  )
}

/* ─── Toast ─── */
function Toast({ toast }) {
  if (!toast) return null
  const ok = toast.type === 'success'
  return (
    <div className="animate-fade-up" style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '12px 16px', borderRadius: 12, marginBottom: 20,
      background: ok ? '#F0FDF4' : '#FFF1F2',
      border: `1.5px solid ${ok ? '#BBF7D0' : '#FECDD3'}`,
      color: ok ? '#166534' : '#9F1239', fontSize: 13, fontWeight: 500, lineHeight: 1.5,
    }}>
      <span style={{ flexShrink: 0 }}>{ok ? '✓' : '⚠'}</span>
      {toast.message}
    </div>
  )
}

/* ─── Main ─── */
export default function DashboardView() {
  /* Product profile — persisted to localStorage */
  const [profile, setProfile] = useState(() => {
    try { return { ...DEFAULT_PROFILE, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } }
    catch { return DEFAULT_PROFILE }
  })
  const [profileOpen, setProfileOpen] = useState(false)
  const [photo,       setPhoto]       = useState(null)

  /* Search state */
  const [industry, setIndustry] = useState('')
  const [region,   setRegion]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState(null)

  const msg = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 7000) }

  /* Auto-save profile to localStorage on change */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  const setP = key => e => setProfile(p => ({ ...p, [key]: e.target.value }))

  const rental = parseFloat(profile.rentalPrice) || 0
  const cost   = parseFloat(profile.baseCost)    || 0
  const profit = rental - cost

  const handleSubmit = async e => {
    e.preventDefault()
    if (!industry) return msg('error', 'Select an industry category first.')
    if (!region.trim()) return msg('error', 'Enter a target city or region.')
    if (!profile.name || !profile.rentalPrice) return msg('error', 'Complete your Product Profile first (click "Edit" above).')
    setLoading(true)
    try {
      const { data: proj, error: e1 } = await supabase
        .from('projects')
        .insert({ name: profile.name, description: profile.description, base_cost: +profile.baseCost, rental_price: +profile.rentalPrice, target_industry: industry, target_region: region.trim() })
        .select().single()
      if (e1) throw new Error(e1.message)
      if (photo) {
        const ext = photo.name.split('.').pop()
        await supabase.storage.from('project-photos').upload(`${proj.id}/cover.${ext}`, photo)
      }
      const result = await runProspectingEngine({
        projectId: proj.id, targetIndustry: industry, targetRegion: region.trim(),
        productSpec: { name: profile.name, description: profile.description, rentalPrice: +profile.rentalPrice, baseCost: +profile.baseCost },
      })
      const note = result.usedFallback ? ' · AI fallback used (update Gemini key for live scoring)' : ' · Scored by Gemini AI'
      msg('success', `${result.leadsCreated} prospects found for "${industry}" in ${region.trim()}!${note}`)
      setIndustry(''); setRegion('')
    } catch (err) {
      msg('error', err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--color-canvas)' }}>

      {/* ── Topbar ── */}
      <div style={{ background: 'white', borderBottom: '1.5px solid #E8E6E1', padding: '20px 32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111214', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Find New Clients
          </h1>
          <p style={{ fontSize: 13, color: '#9C998F', marginTop: 4, lineHeight: 1.5 }}>
            Nebulist spreidt zich online uit — kies een sector en stad, de AI vindt venues en schrijft de offerte voor jou
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 99, padding: '5px 12px', flexShrink: 0 }}>
          <span className="pulse-dot" style={{ width: 7, height: 7, background: '#22C55E', borderRadius: '50%', display: 'inline-block' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#166534', letterSpacing: '0.07em', textTransform: 'uppercase' }}>GDPR · Public data only</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ padding: '28px 32px', maxWidth: 1000 }}>

          <Toast toast={toast} />

          {/* ── Product Profile (collapsed by default) ── */}
          <div style={{ background: 'white', border: '1.5px solid #E8E6E1', borderRadius: 14, marginBottom: 20, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <button type="button" onClick={() => setProfileOpen(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F4F3F0', border: '1.5px solid #E8E6E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  🫧
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111214', lineHeight: 1.2 }}>
                    {profile.name || 'Product Profile'}
                  </p>
                  <p style={{ fontSize: 11, color: '#9C998F', marginTop: 1 }}>
                    Rental €{profile.rentalPrice || '—'} · Cost €{profile.baseCost || '—'}
                    {rental > 0 && <span style={{ color: profit >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600 }}> · Margin €{profit.toLocaleString('nl-NL')}/event</span>}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#4F46E5', background: '#EEF2FF', border: '1.5px solid #C7D2FE', borderRadius: 6, padding: '3px 8px' }}>
                  {profileOpen ? 'Close' : 'Edit product'}
                </span>
                <svg fill="none" viewBox="0 0 24 24" stroke="#9C998F" strokeWidth={2} style={{ width: 14, height: 14, transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded profile editor */}
            {profileOpen && (
              <div className="animate-fade-up" style={{ borderTop: '1.5px solid #F0EDE8', padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9C998F', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>Product Name</p>
                    <input style={iBase} value={profile.name} onChange={setP('name')} placeholder="e.g. Giant Foam Machine" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#9C998F', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>Rental Price</p>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9C998F', pointerEvents: 'none', fontFamily: 'var(--font-mono)' }}>€</span>
                        <input type="number" min="0" style={{ ...iBase, paddingLeft: 24 }} value={profile.rentalPrice} onChange={setP('rentalPrice')} placeholder="0" />
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#9C998F', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>Base Cost</p>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9C998F', pointerEvents: 'none', fontFamily: 'var(--font-mono)' }}>€</span>
                        <input type="number" min="0" style={{ ...iBase, paddingLeft: 24 }} value={profile.baseCost} onChange={setP('baseCost')} placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9C998F', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>Product Description</p>
                  <p style={{ fontSize: 11, color: '#B8B4AA', marginBottom: 5 }}>Used by AI to write personalised pitch emails — describe the experience, atmosphere, and scale</p>
                  <textarea rows={3} style={{ ...iBase, resize: 'none', lineHeight: 1.6 }}
                    value={profile.description} onChange={setP('description')}
                    placeholder="Describe the visual impact, scale, atmosphere of the installation..." />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9C998F', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>Product Photo</p>
                  <Dropzone file={photo} onChange={setPhoto} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setProfileOpen(false)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#0F1117', color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                    Save & Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Main search UI ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>

            {/* Industry selector */}
            <div style={{ background: 'white', border: '1.5px solid #E8E6E1', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '14px 18px 12px', borderBottom: '1.5px solid #F0EDE8', background: '#FDFCFA' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111214' }}>Where should we look?</p>
                <p style={{ fontSize: 11, color: '#9C998F', marginTop: 2 }}>Select the type of venue or event to target</p>
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {INDUSTRIES.map(ind => {
                  const active = industry === ind.value
                  return (
                    <label key={ind.value} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      borderRadius: 10, cursor: 'pointer',
                      background: active ? '#EEF2FF' : '#FAFAF8',
                      border: `1.5px solid ${active ? '#C7D2FE' : '#E8E6E1'}`,
                      transition: 'all 150ms',
                    }}>
                      <input type="radio" name="industry" value={ind.value} checked={active} onChange={() => setIndustry(ind.value)}
                        style={{ accentColor: '#4F46E5', width: 15, height: 15, flexShrink: 0 }} />
                      <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{ind.icon}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#3730A3' : '#111214', lineHeight: 1.2 }}>{ind.value}</p>
                        <p style={{ fontSize: 11, color: active ? '#6366F1' : '#9C998F', marginTop: 1 }}>{ind.sub}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Right — City + CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* City picker */}
              <div style={{ background: 'white', border: '1.5px solid #E8E6E1', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '14px 18px 12px', borderBottom: '1.5px solid #F0EDE8', background: '#FDFCFA' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111214' }}>Target City</p>
                  <p style={{ fontSize: 11, color: '#9C998F', marginTop: 2 }}>Focus the search on a Dutch city</p>
                </div>
                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Quick city buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {NL_CITIES.map(c => (
                      <button key={c} type="button" onClick={() => setRegion(c)}
                        style={{
                          padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                          fontFamily: 'inherit', cursor: 'pointer', transition: 'all 150ms',
                          background: region === c ? '#EEF2FF' : 'white',
                          border: `1.5px solid ${region === c ? '#C7D2FE' : '#E8E6E1'}`,
                          color: region === c ? '#3730A3' : '#4A4740',
                        }}>
                        {c}
                      </button>
                    ))}
                  </div>
                  {/* Manual input */}
                  <input style={{ ...iBase, marginTop: 4 }} placeholder="Or type any city / region..."
                    value={region} onChange={e => setRegion(e.target.value)} />
                </div>
              </div>

              {/* CTA */}
              <div style={{ background: 'linear-gradient(135deg, #0F1117 0%, #1A1D27 100%)', borderRadius: 14, padding: '18px', border: '1.5px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Summary */}
                <div style={{ marginBottom: 14, position: 'relative' }}>
                  {industry && region ? (
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px' }}>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Search Summary</p>
                      <p style={{ fontSize: 13, color: 'white', fontWeight: 600, lineHeight: 1.4 }}>
                        {industry} venues in <span style={{ color: '#F59E0B' }}>{region}</span>
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>AI will find, score & write pitch emails</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'rgba(217,119,6,0.15)', border: '1.5px solid rgba(217,119,6,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 20 20" fill="#F59E0B" style={{ width: 13, height: 13 }}>
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>Select industry &amp; city above</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>to activate the search engine</p>
                      </div>
                    </div>
                  )}
                </div>

                <button id="run-engine-btn" type="submit" disabled={loading || !industry || !region}
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: (!industry || !region || loading)
                      ? 'rgba(255,255,255,0.1)'
                      : 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
                    border: 'none', borderRadius: 10,
                    cursor: (!industry || !region || loading) ? 'not-allowed' : 'pointer',
                    color: (!industry || !region || loading) ? 'rgba(255,255,255,0.3)' : '#1A0F00',
                    fontWeight: 800, fontSize: 13, fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: (!industry || !region || loading) ? 'none' : '0 0 0 1px rgba(255,255,255,0.1), 0 4px 16px rgba(217,119,6,0.35)',
                    transition: 'all 200ms', position: 'relative',
                  }}>
                  {loading ? (
                    <>
                      <svg className="animate-spin-slow" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path style={{ opacity: 0.9 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching venues…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      Find Clients Now
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
