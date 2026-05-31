import { useAuth } from '@/contexts/AuthContext'
import { signOut }  from '@/lib/auth'

const NAV = [
  {
    id: 'dashboard',
    label: 'Prospecting',
    sub: 'Find & score leads',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2 10a8 8 0 1114.32 4.906l3.387 3.387a.75.75 0 01-1.061 1.06l-3.387-3.386A8 8 0 012 10z" />
      </svg>
    ),
  },
  {
    id: 'leads',
    label: 'Pipeline',
    sub: 'Manage prospects',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path fillRule="evenodd" d="M6 4.75A.75.75 0 016.75 4h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 4.75zM6 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 10zm0 5.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM1.99 4.75a1 1 0 011-1H3a1 1 0 110 2h-.01a1 1 0 01-1-1zm1 5.25a1 1 0 100 2H3a1 1 0 100-2h-.01zm0 5.25a1 1 0 100 2H3a1 1 0 100-2h-.01z" clipRule="evenodd" />
      </svg>
    ),
  },
]

const ADMIN_NAV = {
  id: 'team',
  label: 'Team',
  sub: 'Manage access',
  icon: (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}>
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
}

/* ── Bubble logo mark ── */
function NebulistLogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="nb-s" x1="0" y1="34" x2="34" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <circle cx="17" cy="17" r="17" fill="url(#nb-s)" />
      <circle cx="14"   cy="19"   r="5.5" fill="white" fillOpacity="0.95" />
      <circle cx="20.5" cy="18"   r="4.2" fill="white" fillOpacity="0.95" />
      <circle cx="17"   cy="13.5" r="3.5" fill="white" fillOpacity="0.95" />
      <circle cx="15.8" cy="12.4" r="1"   fill="white" fillOpacity="0.5" />
    </svg>
  )
}

/* ── NavButton ── */
function NavButton({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 10px', borderRadius: 8, width: '100%',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
        color: active ? '#FFFFFF' : 'rgba(255,255,255,0.42)',
        transition: 'all 150ms ease', position: 'relative', fontFamily: 'inherit',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
        e.currentTarget.style.color = '#FFFFFF'
      }}
      onMouseLeave={e => {
        if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.42)' }
      }}
    >
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2.5,
          borderRadius: 99, background: 'linear-gradient(180deg, #7C3AED, #06B6D4)',
        }} />
      )}
      <span style={{ color: active ? '#22D3EE' : 'rgba(255,255,255,0.28)', lineHeight: 0 }}>
        {item.icon}
      </span>
      <div>
        <p style={{ fontSize: 13, fontWeight: active ? 600 : 400, lineHeight: 1.2 }}>{item.label}</p>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>{item.sub}</p>
      </div>
    </button>
  )
}

export default function Sidebar({ activeTab, onTabChange }) {
  const { profile, isAdmin } = useAuth()
  const navItems = isAdmin ? [...NAV, ADMIN_NAV] : NAV

  return (
    <aside style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--color-sidebar)', width: '220px', flexShrink: 0,
    }}>

      {/* ── Brand ── */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NebulistLogoMark size={34} />
          <div>
            <p style={{
              fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.15,
              background: 'linear-gradient(90deg, #A78BFA 0%, #22D3EE 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>NEBULIST</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
              NebulaKit · v1.0
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px 10px' }}>
          Main
        </p>
        {navItems.map(item => (
          <NavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => onTabChange(item.id)} />
        ))}
      </nav>

      {/* ── Footer — logged in user + logout ── */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {/* Avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: 'white',
          }}>
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.full_name ?? 'Team Member'}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize' }}>
              {profile?.role ?? 'member'}
            </p>
          </div>

          {/* Logout button */}
          <button
            onClick={signOut}
            title="Sign out"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              color: 'rgba(255,255,255,0.25)', borderRadius: 6, transition: 'all 150ms',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FCA5A5'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'none' }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}>
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.08a.75.75 0 10-1.004-1.11l-2.5 2.567a.75.75 0 000 1.086l2.5 2.567a.75.75 0 101.004-1.11l-1.048-1.08h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
