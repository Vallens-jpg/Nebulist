import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  async function loadProfile(authUser) {
    if (!authUser) { setUser(null); setProfile(null); return }
    try {
      const p = await ensureProfile(authUser)
      // Block deactivated users
      if (!p.is_active) {
        await supabase.auth.signOut()
        setUser(null); setProfile(null)
        return
      }
      setUser(authUser)
      setProfile(p)
    } catch {
      setUser(authUser)
      setProfile(null)
    }
  }

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin   = profile?.role === 'admin'
  const isLoading = user === undefined

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, isLoading, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
