// Quick connection test — fetch table list from Supabase
// Rendered only in dev; remove before production.
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [status, setStatus]   = useState('Connecting…')
  const [tables, setTables]   = useState([])
  const [error,  setError]    = useState(null)

  useEffect(() => {
    async function ping() {
      // Try to select 0 rows from both tables to confirm they exist
      const checks = await Promise.all([
        supabase.from('projects').select('id').limit(1),
        supabase.from('leads').select('id').limit(1),
      ])

      const errors = checks.map((r, i) => r.error ? `${['projects','leads'][i]}: ${r.error.message}` : null).filter(Boolean)

      if (errors.length > 0) {
        setError(errors.join(' | '))
        setStatus('Error')
      } else {
        setTables(['projects ✅', 'leads ✅'])
        setStatus('Connected')
      }
    }
    ping()
  }, [])

  const color = { Connecting: '#f59e0b', Connected: '#10b981', Error: '#ef4444' }[status] ?? '#6b7280'

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      background: '#0f172a', color: '#f8fafc', borderRadius: 10,
      padding: '12px 16px', fontSize: 13, minWidth: 220,
      boxShadow: '0 8px 30px rgba(0,0,0,0.3)', fontFamily: 'monospace',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display:'inline-block' }} />
        <strong>Supabase</strong>
        <span style={{ color }}>{status}</span>
      </div>
      {tables.map(t => <div key={t} style={{ paddingLeft: 16 }}>{t}</div>)}
      {error && <div style={{ color: '#f87171', marginTop: 4 }}>{error}</div>}
    </div>
  )
}
