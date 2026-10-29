import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { BrandIcon } from './icons'

export function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [useLink, setUseLink] = useState(false)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const switchMode = () => {
    setUseLink(prev => !prev)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!useLink) {
      setBusy(true)
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      setBusy(false)
      if (error) setError(error.message)
      return
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="hc-screen" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 40 }}>
      <div style={{ display: 'grid', gap: 14, justifyItems: 'start', marginBottom: 32 }}>
        <div className="hc-brand">
          <BrandIcon />
        </div>
        <div>
          <h1 className="hc-h1">Sign in</h1>
          <p className="hc-lede">{useLink ? "We'll email you a link." : 'Use your email and password.'}</p>
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
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              <p className="hc-hint">Use the address your partner signs in with too.</p>
            </div>
            {!useLink && (
              <div className="hc-field">
                <label className="hc-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="hc-input"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            )}
            {error && <p className="hc-error">{error}</p>}
            <button type="submit" className="hc-btn hc-btn--primary hc-btn--block" disabled={busy}>
              {useLink ? 'Send sign-in link' : 'Sign in'}
            </button>
            <button type="button" className="hc-btn hc-btn--quiet hc-btn--block" onClick={switchMode}>
              {useLink ? 'Use a password instead' : 'First time or forgot password? Email me a link'}
            </button>
          </div>
        </form>
      )}

      {useLink && (
        <p className="hc-status-line" style={{ margin: '20px 0 0', textAlign: 'center' }}>
          Opening the link signs you in in that browser. Set a password afterwards to use the home-screen app.
        </p>
      )}
    </div>
  )
}
