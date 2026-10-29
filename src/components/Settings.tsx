import { useState, type FormEvent } from 'react'
import type { ChoreStore } from '../hooks/useChoreStore'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/dates'
import { PasswordForm } from './SetPassword'

interface Props {
  store: ChoreStore
  householdId: string
}

export function Settings({ store, householdId }: Props) {
  const [name, setName] = useState(store.myName ?? '')
  const [copied, setCopied] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const trimmed = name.trim()
  const isSaved = store.myName !== null && trimmed === store.myName

  const handleSaveName = (event: FormEvent) => {
    event.preventDefault()
    if (trimmed) store.saveName(trimmed)
  }

  const copyId = async () => {
    await navigator.clipboard.writeText(householdId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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
      <header className="hc-page-head">
        <h1 className="hc-h1">Settings</h1>
      </header>

      <h2 className="hc-section-title">Profile</h2>
      <form className="hc-card hc-form" style={{ gap: 12, padding: 16 }} onSubmit={handleSaveName}>
        <label className="hc-label" htmlFor="display-name">
          Your name
        </label>
        <input
          id="display-name"
          className="hc-input"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={40}
          placeholder="e.g. Abhi"
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span className={`hc-status-line ${isSaved ? 'is-saved' : ''}`}>{isSaved ? 'Saved' : 'Not saved yet'}</span>
          <button type="submit" className="hc-btn hc-btn--primary" disabled={trimmed === '' || isSaved} style={{ minHeight: 44, padding: '0 18px' }}>
            Save
          </button>
        </div>
      </form>

      <h2 className="hc-section-title">Password</h2>
      <section className="hc-card" style={{ padding: 16 }}>
        {passwordSaved && <p className="hc-status-line is-saved">Password saved</p>}
        <PasswordForm submitLabel="Save password" onDone={() => setPasswordSaved(true)} />
      </section>

      <h2 className="hc-section-title">Household</h2>
      <section className="hc-card">
        <div className="hc-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div>
            <p className="hc-row-label" style={{ margin: 0 }}>
              Household ID
            </p>
            <p className="hc-row-sub" style={{ margin: '2px 0 0' }}>
              Share it so your partner can join.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--sunk)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
            <span className="hc-mono" style={{ flex: 1, minWidth: 0 }}>
              {householdId}
            </span>
            <button type="button" className="hc-btn hc-btn--quiet" onClick={copyId} style={{ minHeight: 36, padding: '0 10px' }}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </section>

      <h2 className="hc-section-title">Data</h2>
      <section className="hc-card">
        <div className="hc-row">
          <div>
            <p className="hc-row-label" style={{ margin: 0 }}>
              Export data
            </p>
            <p className="hc-row-sub" style={{ margin: '2px 0 0' }}>
              Download chores and history as JSON
            </p>
          </div>
          <button type="button" className="hc-btn hc-btn--quiet" onClick={exportBackup}>
            Export
          </button>
        </div>
        <div className="hc-row">
          <p className="hc-row-label" style={{ margin: 0 }}>
            Sign out
          </p>
          <button type="button" className="hc-btn hc-btn--danger" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </section>
    </>
  )
}
