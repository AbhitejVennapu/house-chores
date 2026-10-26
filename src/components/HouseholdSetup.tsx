import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

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
    <section className="hc-card hc-form" style={{ marginTop: 48 }}>
      <h2 className="hc-card-title">Set up your household</h2>
      <p className="hc-field-hint">
        Create a household if you're first. If your partner already created one, paste its ID to join.
      </p>
      <button type="button" className="hc-btn hc-btn--primary hc-btn--block" onClick={handleCreate} disabled={busy}>
        Create household
      </button>

      <form onSubmit={handleJoin} className="hc-form">
        <div className="hc-field">
          <label className="hc-field-label" htmlFor="household-id">
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
        <button type="submit" className="hc-btn hc-btn--secondary hc-btn--block" disabled={busy || joinId.trim() === ''}>
          Join household
        </button>
      </form>

      {error && <p className="hc-error">{error}</p>}
    </section>
  )
}
