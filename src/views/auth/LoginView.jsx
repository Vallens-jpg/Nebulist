import { useState } from 'react'
import { signIn } from '@/lib/auth'

/* ── Nebulist brand gradient (matches website) ── */
const GRAD = 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)'

function NebulistLogoMark({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <defs>
        <linearGradient id="lg-login" x1="0" y1="34" x2="34" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <circle cx="17" cy="17" r="17" fill="url(#lg-login)" />
      <circle cx="14"  cy="19"   r="5.5" fill="white" fillOpacity="0.95" />
      <circle cx="20.5" cy="18"  r="4.2" fill="white" fillOpacity="0.95" />
      <circle cx="17"  cy="13.5" r="3.5" fill="white" fillOpacity="0.95" />
      <circle cx="15.8" cy="12.4" r="1"  fill="white" fillOpacity="0.5" />
    </svg>
  )
}

export default function LoginView() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPw,   setShowPw]   = useState(false)

  const iBase = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: 10, fontSize: 14, color: 'white',
    background: 'rgba(255,255,255,0.07)', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 150ms',
    boxSizing: 'border-box',
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      // AuthContext will pick up the new session automatically
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Incorrect email or password. Contact your admin if you need access.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080B12',
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.25) 0%, transparent 70%)',
    }}>

      {/* Subtle animated blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', top: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', bottom: '-5%', right: '-5%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 400, padding: '0 20px' }}>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '40px 36px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>

          {/* Logo + heading */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <NebulistLogoMark size={52} />
            </div>
            <h1 style={{
              fontSize: 22, fontWeight: 800, letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: 4,
              background: GRAD, WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              NEBULIST
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              NebulaKit · Team Access
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 20,
              fontSize: 13, color: '#FCA5A5', lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={iBase}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...iBase, paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: 'rgba(255,255,255,0.3)', fontSize: 12,
                }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6, width: '100%', padding: '12px',
                borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(255,255,255,0.08)' : GRAD,
                color: loading ? 'rgba(255,255,255,0.3)' : 'white',
                fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                transition: 'all 200ms', letterSpacing: '0.02em',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Forgot password note */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.22)', lineHeight: 1.5 }}>
            Forgot your password? Contact your team admin<br />to request a reset.
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>
          © 2026 Stichting Nebulist · Ethereal Bubble Experiences
        </p>
      </div>
    </div>
  )
}
