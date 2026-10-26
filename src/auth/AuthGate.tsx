import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { App } from '../App'
import { SignIn } from '../components/SignIn'
import { HouseholdSetup } from '../components/HouseholdSetup'

const Loading = () => (
  <div className="hc-app">
    <div className="hc-skeleton" style={{ marginTop: 48 }} />
  </div>
)

export function AuthGate() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [householdId, setHouseholdId] = useState<string | null | undefined>(undefined)

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
  if (session === null) return <div className="hc-app"><SignIn /></div>
  if (householdId === undefined) return <Loading />
  if (householdId === null) return <div className="hc-app"><HouseholdSetup onReady={setHouseholdId} /></div>

  return <App householdId={householdId} userId={session.user.id} />
}
