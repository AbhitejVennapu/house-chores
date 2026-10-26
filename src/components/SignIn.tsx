import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function SignIn() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
    if (error) setError(error.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <section className="hc-card hc-form" style={{ marginTop: 48 }}>
        <h2 className="hc-card-title">Check your email</h2>
        <p className="hc-field-hint">Open the sign-in link we sent to {email.trim()} on this device.</p>
      </section>
    )
  }

  return (
    <form className="hc-card hc-form" style={{ marginTop: 48 }} onSubmit={handleSubmit}>
      <h2 className="hc-card-title">Sign in</h2>
      <p className="hc-field-hint">We'll email you a sign-in link. No password needed.</p>
      <div className="hc-field">
        <label className="hc-field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="hc-input"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      {error && <p className="hc-error">{error}</p>}
      <button type="submit" className="hc-btn hc-btn--primary hc-btn--block">
        Send link
      </button>
    </form>
  )
}
