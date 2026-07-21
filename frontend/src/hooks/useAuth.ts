import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/api'

export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  role: string
  credits_used: number
  plan: string
  plan_expires_at: string | null
  agreed_terms_at: string | null
  created_at: string
  updated_at: string
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await apiFetch<UserProfile>('/users/me')
      setUser(profile)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (import.meta.env.VITE_DEV_BYPASS_AUTH === 'true') {
      setSession({ access_token: 'dev-bypass' } as Session)
      fetchProfile().finally(() => setLoading(false))
      return
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) {
        fetchProfile().finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)
        if (s) {
          fetchProfile()
        } else {
          setUser(null)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
  }

  return { session, user, loading, signOut, refetchProfile: fetchProfile }
}
