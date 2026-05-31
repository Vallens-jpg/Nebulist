import { supabase } from './supabase'

/* ── Sign in ── */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}

/* ── Sign out ── */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

/* ── Get current session user ── */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile ? { ...user, profile } : null
}

/* ── Get all team members (admin only) ── */
export async function getTeamMembers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

/* ──
   Invite new member:
   Uses Supabase magic link — admin triggers email invitation.
   User clicks link → sets own password.
── */
export async function inviteMember(email, fullName, role = 'member') {
  // Step 1: Send magic link / invite via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}?onboarding=true`,
      data: { full_name: fullName },
    },
  })
  if (authError) throw new Error(authError.message)

  // Step 2: Create profile row (will be linked once user confirms)
  // We store a pending profile keyed by email so we can show it in Team panel
  const { error: profileError } = await supabase
    .from('pending_invites')
    .upsert({ email, full_name: fullName, role, invited_at: new Date().toISOString() })

  // Non-fatal if pending_invites doesn't exist yet
  void profileError

  return authData
}

/* ──
   Admin resets a member's password:
   Sends a password-reset email. Admin controls WHEN this is sent.
   User follows the link and sets their new password.
── */
export async function adminResetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}?reset=true`,
  })
  if (error) throw new Error(error.message)
}

/* ── Deactivate member (admin only) ── */
export async function setMemberActive(userId, isActive) {
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_active: isActive })
    .eq('id', userId)
  if (error) throw new Error(error.message)
}

/* ── Create own profile after first login ── */
export async function ensureProfile(user, overrides = {}) {
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (existing) return existing

  const fullName = overrides.full_name
    || user.user_metadata?.full_name
    || user.email?.split('@')[0]
    || 'User'

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ id: user.id, full_name: fullName, role: overrides.role ?? 'member', is_active: true })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
