import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { BrandIcon } from './icons'

export const MIN_PASSWORD_LENGTH = 8

interface FormProps {
  submitLabel: string
  onDone: () => void
}

export function PasswordForm({ submitLabel, onDone }: FormProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError("The two passwords don't match.")
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password, data: { has_password: true } })
    setBusy(false)
    if (error) setError(error.message)
    else onDone()
  }

  return (
    <form className="hc-form" onSubmit={handleSubmit}>
      <div className="hc-field">
        <label className="hc-label" htmlFor="new-password">
          Password
        </label>
        <input
          id="new-password"
          className="hc-input"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <p className="hc-hint">At least {MIN_PASSWORD_LENGTH} characters.</p>
      </div>
      <div className="hc-field">
        <label className="hc-label" htmlFor="confirm-password">
          Confirm password
        </label>
        <input
          id="confirm-password"
          className="hc-input"
          type="password"
          required
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {error && <p className="hc-error">{error}</p>}
      <button type="submit" className="hc-btn hc-btn--primary hc-btn--block" disabled={busy}>
        {submitLabel}
      </button>
    </form>
  )
}

interface Props {
  onDone: () => void
  onSkip: () => void
}

export function SetPassword({ onDone, onSkip }: Props) {
  return (
    <div className="hc-screen" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 40 }}>
      <div style={{ display: 'grid', gap: 14, justifyItems: 'start', marginBottom: 32 }}>
        <div className="hc-brand">
          <BrandIcon />
        </div>
        <div>
          <h1 className="hc-h1">Set a password</h1>
          <p className="hc-lede">Sign in on any device, including the home-screen app, without waiting for an email.</p>
        </div>
      </div>

      <section className="hc-card">
        <PasswordForm submitLabel="Save password" onDone={onDone} />
      </section>

      <button type="button" className="hc-btn hc-btn--quiet hc-btn--block" onClick={onSkip} style={{ marginTop: 16 }}>
        Not now
      </button>
    </div>
  )
}
