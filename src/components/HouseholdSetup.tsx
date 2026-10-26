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
    <section className="card form">
      <h2>Set up your household</h2>
      <p className="muted">Create a household if you're first. If your partner already created one, paste its ID to join.</p>
      <div className="actions">
        <button className="primary" onClick={handleCreate} disabled={busy}>
          Create household
        </button>
      </div>

      <form onSubmit={handleJoin} className="form">
        <label>
          Household ID
          <input value={joinId} onChange={e => setJoinId(e.target.value)} placeholder="xxxxxxxx-xxxx-…" />
        </label>
        <div className="actions">
          <button type="submit" disabled={busy || joinId.trim() === ''}>
            Join household
          </button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}
    </section>
  )
}
