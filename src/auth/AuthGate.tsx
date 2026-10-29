import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { App } from '../App'
import { SignIn } from '../components/SignIn'
import { HouseholdSetup } from '../components/HouseholdSetup'
import { SetPassword } from '../components/SetPassword'

const skipKey = (userId: string) => `hc-skip-password-${userId}`

const hasSkipped = (userId: string) => {
  try {
    return localStorage.getItem(skipKey(userId)) === '1'
  } catch {
    return false
  }
}

const Loading = () => (
  <div className="hc-screen">
    <div className="hc-skeleton" style={{ marginTop: 48 }} />
  </div>
)

export function AuthGate() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [householdId, setHouseholdId] = useState<string | null | undefined>(undefined)
  const [passwordDismissed, setPasswordDismissed] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    setHouseholdId(undefined)
    supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', session.user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error(error)
        setHouseholdId(data?.household_id ?? null)
      })
  }, [session])

  if (session === undefined) return <Loading />
  if (session === null) return <SignIn />
  const needsPassword = !session.user.user_metadata?.has_password && !passwordDismissed && !hasSkipped(session.user.id)
  if (needsPassword) {
    const dismiss = () => setPasswordDismissed(true)
    const skip = () => {
      try {
        localStorage.setItem(skipKey(session.user.id), '1')
      } catch {
        // storage unavailable: the prompt just returns next visit
      }
      dismiss()
    }
    return <SetPassword onDone={dismiss} onSkip={skip} />
  }
  if (householdId === undefined) return <Loading />
  if (householdId === null) return <HouseholdSetup onReady={setHouseholdId} />

  return <App householdId={householdId} userId={session.user.id} />
}
