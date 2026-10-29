import { useState, type FormEvent } from 'react'
import type { Assignee, Chore, ChoreFormValues } from '../types'

type Unit = 'days' | 'weeks'

interface Props {
  initial?: Chore
  assignees: Assignee[]
  labels: Record<Assignee, string>
  onSubmit: (values: ChoreFormValues) => void
  onCancel: () => void
}

export function ChoreForm({ initial, assignees, labels, onSubmit, onCancel }: Props) {
  const initialIsWeeks =
    initial !== undefined && initial.frequencyDays >= 7 && initial.frequencyDays % 7 === 0

  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(
    String(initial ? (initialIsWeeks ? initial.frequencyDays / 7 : initial.frequencyDays) : 1),
  )
  const [unit, setUnit] = useState<Unit>(initialIsWeeks ? 'weeks' : 'days')
  const [assignee, setAssignee] = useState<Assignee>(initial?.assignee ?? 'anyone')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const count = Number(amount)

    if (!name.trim()) {
      setError('Give the chore a name.')
      return
    }
    if (!Number.isInteger(count) || count < 1) {
      setError('Frequency must be a whole number, 1 or more.')
      return
    }

    onSubmit({
      name: name.trim(),
      frequencyDays: unit === 'weeks' ? count * 7 : count,
      assignee,
    })
  }

  return (
    <section className="hc-card" style={{ marginTop: 20 }}>
      <h2 className="hc-group-title" style={{ padding: '18px 20px 0' }}>
        {initial ? 'Edit chore' : 'New chore'}
      </h2>
      <form className="hc-form" onSubmit={handleSubmit}>
        <div className={`hc-field ${error === 'Give the chore a name.' ? 'is-invalid' : ''}`}>
          <label className="hc-label" htmlFor="chore-name">
            Name
          </label>
          <input
            id="chore-name"
            className="hc-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Laundry"
            autoFocus
          />
          {error === 'Give the chore a name.' && <p className="hc-error">{error}</p>}
        </div>

        <div className="hc-field">
          <label className="hc-label" htmlFor="chore-every">
            Repeat every
          </label>
          <div className="hc-stepper">
            <input
              id="chore-every"
              className="hc-input"
              type="number"
              min={1}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ textAlign: 'center' }}
            />
            <div className="hc-choices" role="radiogroup" aria-label="Unit">
              {(['days', 'weeks'] as Unit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  role="radio"
                  className="hc-choice"
                  aria-checked={unit === u}
                  onClick={() => setUnit(u)}
                >
                  {u === 'days' ? 'Days' : 'Weeks'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hc-field">
          <span className="hc-label" id="assigned-to">
            Assigned to
          </span>
          <div className="hc-choices" role="radiogroup" aria-labelledby="assigned-to">
            {assignees.map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                className="hc-choice"
                aria-checked={assignee === key}
                onClick={() => setAssignee(key)}
              >
                {labels[key]}
              </button>
            ))}
          </div>
        </div>

        {error && error !== 'Give the chore a name.' && <p className="hc-error">{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 10, marginTop: 4 }}>
          <button type="button" className="hc-btn hc-btn--outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="hc-btn hc-btn--primary">
            Save chore
          </button>
        </div>
      </form>
    </section>
  )
}
