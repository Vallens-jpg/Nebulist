import { useState } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import LoginView    from '@/views/auth/LoginView'
import Sidebar      from '@/components/layout/Sidebar'
import DashboardView from '@/views/dashboard/DashboardView'
import LeadsView    from '@/views/leads/LeadsView'
import TeamView     from '@/views/admin/TeamView'

/* ── Inner app — only rendered when authenticated ── */
function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { isAdmin }               = useAuth()

  // Guard: non-admin cannot visit 'team'
  const safeTab = (tab) => {
    if (tab === 'team' && !isAdmin) return
    setActiveTab(tab)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', flexShrink: 0, height: '100vh' }}>
        <Sidebar activeTab={activeTab} onTabChange={safeTab} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'leads'     && <LeadsView />}
        {activeTab === 'team'      && isAdmin && <TeamView />}
      </div>
    </div>
  )
}

/* ── Root — handles auth gate ── */
function AppInner() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#080B12',
      }}>
        <div style={{ textAlign: 'center' }}>
          <svg style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}
            fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
            <path style={{ opacity: 0.75 }} fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginView />

  return <AuthenticatedApp />
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
