import { useState, type FormEvent } from 'react'
import type { ChoreStore } from '../hooks/useChoreStore'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/dates'

interface Props {
  store: ChoreStore
  householdId: string
}

export function Settings({ store, householdId }: Props) {
  const [name, setName] = useState(store.myName ?? '')

  const handleSaveName = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed) store.saveName(trimmed)
  }

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
    <>
      <form className="card form" onSubmit={handleSaveName}>
        <h2>Your name</h2>
        <p className="muted">Shown on chores and history. Your partner sees it too.</p>
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder="e.g. Abhi" />
        </label>
        <div className="actions">
          <button type="submit" className="primary" disabled={name.trim() === ''}>
            Save name
          </button>
        </div>
      </form>

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
    </>
  )
}
