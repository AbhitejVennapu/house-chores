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

  const trimmed = name.trim()
  const isSaved = store.myName !== null && trimmed === store.myName

  const handleSaveName = (event: FormEvent) => {
    event.preventDefault()
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
      <form className="hc-card hc-form" style={{ marginTop: 16 }} onSubmit={handleSaveName}>
        <h2 className="hc-card-title">Your name</h2>
        <p className="hc-field-hint">Shown on chores and history. Your partner sees it too.</p>
        <div className="hc-field">
          <label className="hc-field-label" htmlFor="display-name">
            Name
          </label>
          <input
            id="display-name"
            className="hc-input"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={40}
            placeholder="e.g. Abhi"
          />
        </div>
        <div>
          <button type="submit" className="hc-btn hc-btn--primary" disabled={trimmed === '' || isSaved}>
            {isSaved ? 'Saved' : 'Save name'}
          </button>
        </div>
        {!isSaved && trimmed !== '' && <p className={`hc-status`}>Not saved yet.</p>}
        {isSaved && <p className="hc-status is-saved">Saved.</p>}
      </form>

      <section className="hc-card hc-form" style={{ marginTop: 16 }}>
        <h2 className="hc-card-title">Household</h2>
        <p className="hc-field-hint">Share this ID with your partner so they can join from their own sign-in.</p>
        <code className="hc-code">{householdId}</code>
      </section>

      <section className="hc-card hc-form" style={{ marginTop: 16 }}>
        <h2 className="hc-card-title">Backup</h2>
        <p className="hc-field-hint">Your data is stored in Supabase. Export a JSON copy if you want one on your own device.</p>
        <div className="hc-form-actions">
          <button type="button" className="hc-btn hc-btn--secondary" onClick={exportBackup}>
            Export JSON
          </button>
          <button type="button" className="hc-btn hc-btn--secondary" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </section>
    </>
  )
}
