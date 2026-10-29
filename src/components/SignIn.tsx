import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { BrandIcon } from './icons'

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

  return (
    <div
      className="hc-screen"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingBottom: 40,
      }}
    >
      <div style={{ display: 'grid', gap: 14, justifyItems: 'start', marginBottom: 32 }}>
        <div className="hc-brand">
          <BrandIcon />
        </div>
        <div>
          <h1 className="hc-h1">Sign in</h1>
          <p className="hc-lede">We'll email you a link. No password needed.</p>
        </div>
      </div>

      {sent ? (
        <section className="hc-card hc-form">
          <h2 className="hc-group-title">Check your email</h2>
          <p className="hc-hint">Open the sign-in link we sent to {email.trim()} on this device.</p>
        </section>
      ) : (
        <form className="hc-card" onSubmit={handleSubmit}>
          <div className="hc-form">
            <div className="hc-field">
              <label className="hc-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="hc-input"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <p className="hc-hint">Use the address your partner signs in with too.</p>
            </div>
            {error && <p className="hc-error">{error}</p>}
            <button type="submit" className="hc-btn hc-btn--primary hc-btn--block">
              Send sign-in link
            </button>
          </div>
        </form>
      )}

      <p className="hc-status-line" style={{ margin: '20px 0 0', textAlign: 'center' }}>
        Opening the link on this device signs you in.
      </p>
    </div>
  )
}
