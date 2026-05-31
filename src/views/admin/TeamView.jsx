import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getTeamMembers, setMemberActive, adminResetPassword } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const GRAD = 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)'

/* ── Role badge ── */
function RoleBadge({ role }) {
  const isAdmin = role === 'admin'
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 99,
      background: isAdmin ? 'rgba(124,58,237,0.12)' : 'rgba(6,182,212,0.1)',
      color: isAdmin ? '#A78BFA' : '#22D3EE',
      border: `1px solid ${isAdmin ? 'rgba(124,58,237,0.25)' : 'rgba(6,182,212,0.2)'}`,
    }}>
      {role}
    </span>
  )
}

/* ── Status dot ── */
function StatusDot({ active }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
      background: active ? '#22C55E' : '#6B7280',
      boxShadow: active ? '0 0 0 2px rgba(34,197,94,0.2)' : 'none',
    }} />
  )
}

export default function TeamView() {
  const { profile: myProfile } = useAuth()
  const [members,    setMembers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [toast,      setToast]      = useState(null)
  const [showInvite, setShowInvite] = useState(false)
  const [form,       setForm]       = useState({ email: '', full_name: '', role: 'member' })
  const [inviting,   setInviting]   = useState(false)
  const [actionId,   setActionId]   = useState(null)

  const msg = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 6000) }

  async function load() {
    setLoading(true)
    try {
      const data = await getTeamMembers()
      setMembers(data)
    } catch (e) { msg('error', e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleToggleActive(member) {
    setActionId(member.id)
    try {
      await setMemberActive(member.id, !member.is_active)
      msg('success', `${member.full_name} ${member.is_active ? 'deactivated' : 'reactivated'}.`)
      await load()
    } catch (e) { msg('error', e.message) }
    finally { setActionId(null) }
  }

  async function handleResetPassword(member) {
    setActionId(member.id + '-reset')
    try {
      await adminResetPassword(member.email || '')
      msg('success', `Password reset email sent to ${member.full_name}.`)
    } catch (e) { msg('error', e.message) }
    finally { setActionId(null) }
  }

  async function handleInvite(e) {
    e.preventDefault()
    if (!form.email || !form.full_name) return msg('error', 'Fill in all fields.')
    setInviting(true)
    try {
      // Create the auth user + profile directly via Supabase admin signUp
      const { data: authData, error: authErr } = await supabase.auth.admin?.createUser({
        email: form.email,
        email_confirm: true,
        user_metadata: { full_name: form.full_name },
      }) ?? {}

      if (authErr) throw new Error(authErr.message)

      // If admin API not available client-side, use magic link OTP
      if (!authData) {
        const { error } = await supabase.auth.signInWithOtp({
          email: form.email,
          options: { shouldCreateUser: true, data: { full_name: form.full_name } },
        })
        if (error) throw new Error(error.message)
        msg('success', `Invitation email sent to ${form.email}. They can set their password via the link.`)
      } else {
        // Insert profile
        await supabase.from('user_profiles').insert({
          id: authData.user.id,
          full_name: form.full_name,
          role: form.role,
          is_active: true,
        })
        msg('success', `${form.full_name} added to the team.`)
      }

      setForm({ email: '', full_name: '', role: 'member' })
      setShowInvite(false)
      await load()
    } catch (e) {
      msg('error', e.message)
    } finally {
      setInviting(false)
    }
  }

  const card = {
    background: 'white', border: '1.5px solid #E8E6E1',
    borderRadius: 14, overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--color-canvas)' }}>

      {/* Topbar */}
      <div style={{ background: 'white', borderBottom: '1.5px solid #E8E6E1', padding: '20px 32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111214', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Team
          </h1>
          <p style={{ fontSize: 13, color: '#9C998F', marginTop: 4 }}>
            Manage who has access to NebulaKit
          </p>
        </div>
        <button onClick={() => setShowInvite(v => !v)} style={{
          padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: GRAD, color: 'white', fontWeight: 700, fontSize: 13,
          fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>+</span> Invite Member
        </button>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 800 }}>

        {/* Toast */}
        {toast && (
          <div style={{
            padding: '11px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 500,
            background: toast.type === 'success' ? '#F0FDF4' : '#FFF1F2',
            border: `1.5px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECDD3'}`,
            color: toast.type === 'success' ? '#166534' : '#9F1239',
          }}>
            {toast.type === 'success' ? '✓ ' : '⚠ '}{toast.message}
          </div>
        )}

        {/* Invite form */}
        {showInvite && (
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1.5px solid #F0EDE8', background: '#FDFCFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111214' }}>Invite New Member</p>
              <button onClick={() => setShowInvite(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9C998F', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleInvite} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9C998F', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>Full Name</p>
                  <input style={{ width: '100%', padding: '9px 12px', background: '#FAFAF8', border: '1.5px solid #E8E6E1', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="e.g. Christiaan Schuinder" />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9C998F', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>Email</p>
                  <input type="email" style={{ width: '100%', padding: '9px 12px', background: '#FAFAF8', border: '1.5px solid #E8E6E1', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@gmail.com" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9C998F', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>Role</p>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    style={{ padding: '9px 12px', background: '#FAFAF8', border: '1.5px solid #E8E6E1', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" disabled={inviting} style={{
                  padding: '9px 20px', borderRadius: 9, border: 'none', cursor: inviting ? 'not-allowed' : 'pointer',
                  background: inviting ? '#E8E6E1' : GRAD, color: inviting ? '#9C998F' : 'white',
                  fontWeight: 700, fontSize: 13, fontFamily: 'inherit', alignSelf: 'flex-end',
                }}>
                  {inviting ? 'Sending…' : 'Send Invitation'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#B8B4AA' }}>
                💌 An email invitation will be sent. The member sets their own password via the link.
              </p>
            </form>
          </div>
        )}

        {/* Member list */}
        <div style={card}>
          <div style={{ padding: '14px 18px', borderBottom: '1.5px solid #F0EDE8', background: '#FDFCFA' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111214' }}>
              Team Members <span style={{ fontSize: 12, color: '#9C998F', fontWeight: 400 }}>({members.length})</span>
            </p>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9C998F', fontSize: 13 }}>Loading…</div>
          ) : members.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9C998F', fontSize: 13 }}>No members yet. Invite your team above.</div>
          ) : (
            <div>
              {members.map((m, i) => {
                const isMe = m.id === myProfile?.id
                const resetting = actionId === m.id + '-reset'
                const toggling  = actionId === m.id
                return (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px',
                    borderBottom: i < members.length - 1 ? '1px solid #F0EDE8' : 'none',
                    opacity: m.is_active ? 1 : 0.55,
                    transition: 'opacity 200ms',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: 'white',
                    }}>
                      {m.full_name?.[0]?.toUpperCase() ?? '?'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111214' }}>{m.full_name}</p>
                        <RoleBadge role={m.role} />
                        {isMe && <span style={{ fontSize: 10, color: '#9C998F', fontWeight: 500 }}>· you</span>}
                        <StatusDot active={m.is_active} />
                        <span style={{ fontSize: 11, color: '#9C998F' }}>{m.is_active ? 'Active' : 'Deactivated'}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#9C998F', marginTop: 2 }}>
                        Joined {new Date(m.created_at).toLocaleDateString('en-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Actions — cannot act on yourself */}
                    {!isMe && (
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => handleResetPassword(m)} disabled={!!resetting || !m.is_active}
                          style={{
                            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                            border: '1.5px solid #E8E6E1', background: 'white', cursor: 'pointer',
                            color: '#4A4740', transition: 'all 150ms',
                          }}>
                          {resetting ? '…' : '🔑 Reset Password'}
                        </button>
                        <button onClick={() => handleToggleActive(m)} disabled={!!toggling}
                          style={{
                            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                            border: `1.5px solid ${m.is_active ? '#FECDD3' : '#BBF7D0'}`,
                            background: m.is_active ? '#FFF1F2' : '#F0FDF4',
                            color: m.is_active ? '#BE123C' : '#166534',
                            cursor: 'pointer', transition: 'all 150ms',
                          }}>
                          {toggling ? '…' : m.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info box */}
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: '#F4F3F0', border: '1.5px solid #E8E6E1', fontSize: 12, color: '#6B6860', lineHeight: 1.6 }}>
          🔐 <strong>Security note:</strong> Deactivated members lose access immediately on their next action.
          Password resets are sent by email — members set their own new password via the secure link.
          Only admins can perform these actions.
        </div>
      </div>
    </div>
  )
}
