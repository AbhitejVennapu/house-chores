import type { ChoreStore } from '../hooks/useChoreStore'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/dates'

interface Props {
  store: ChoreStore
  householdId: string
}

export function Settings({ store, householdId }: Props) {
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(store.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `house-chores-${todayISO()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="card form">
      <h2>Household</h2>
      <p className="muted">Share this ID with your partner so they can join from their own sign-in.</p>
      <code className="code">{householdId}</code>

      <h2>Backup</h2>
      <p className="muted">Your data is stored in Supabase. Export a JSON copy if you want one on your own device.</p>

      <div className="actions">
        <button onClick={exportBackup}>Export JSON</button>
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
    </section>
  )
}
