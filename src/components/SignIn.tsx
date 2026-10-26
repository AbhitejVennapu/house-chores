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
      <section className="card form">
        <h2>Check your email</h2>
        <p className="muted">Open the sign-in link we sent to {email.trim()} on this device.</p>
      </section>
    )
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Sign in</h2>
      <p className="muted">We'll email you a sign-in link. No password needed.</p>
      <label>
        Email
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="submit" className="primary">
          Send link
        </button>
      </div>
    </form>
  )
}
