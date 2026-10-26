import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { BrandIcon } from './icons'

interface Props {
  onReady: (householdId: string) => void
}

export function HouseholdSetup({ onReady }: Props) {
  const [joinId, setJoinId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    const { data, error } = await supabase.rpc('create_household', { household_name: 'Our home' })
    setBusy(false)
    if (error) setError(error.message)
    else onReady(data as string)
  }

  const handleJoin = async (event: FormEvent) => {
    event.preventDefault()
    const id = joinId.trim()
    setBusy(true)
    setError(null)
    const { error } = await supabase.rpc('join_household', { hid: id })
    setBusy(false)
    if (error) setError(error.message)
    else onReady(id)
  }

  return (
    <div className="hc-screen" style={{ paddingTop: 40 }}>
      <div style={{ display: 'grid', gap: 14, justifyItems: 'start', marginBottom: 32 }}>
        <div className="hc-brand">
          <BrandIcon />
        </div>
        <div>
          <h1 className="hc-h1">Set up your household</h1>
          <p className="hc-lede">Create one if you're first. If your partner already did, paste their ID to join.</p>
        </div>
      </div>

      <section className="hc-card hc-form">
        <button type="button" className="hc-btn hc-btn--primary hc-btn--block" onClick={handleCreate} disabled={busy}>
          Create household
        </button>

        <form onSubmit={handleJoin} className="hc-form" style={{ padding: 0 }}>
          <div className="hc-field">
            <label className="hc-label" htmlFor="household-id">
              Household ID
            </label>
            <input
              id="household-id"
              className="hc-input"
              value={joinId}
              onChange={e => setJoinId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-…"
            />
          </div>
          <button type="submit" className="hc-btn hc-btn--outline hc-btn--block" disabled={busy || joinId.trim() === ''}>
            Join household
          </button>
        </form>

        {error && <p className="hc-error">{error}</p>}
      </section>
    </div>
  )
}
