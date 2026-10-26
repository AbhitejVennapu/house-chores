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
  const initialIsWeeks = initial !== undefined && initial.frequencyDays >= 7 && initial.frequencyDays % 7 === 0

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
    <section className="hc-card">
      <h2 className="hc-card-title">{initial ? 'Edit chore' : 'New chore'}</h2>
      <form className="hc-form" onSubmit={handleSubmit}>
        <div className={`hc-field ${error === 'Give the chore a name.' ? 'is-invalid' : ''}`}>
          <label className="hc-field-label" htmlFor="chore-name">
            Name
          </label>
          <input
            id="chore-name"
            className="hc-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Laundry"
            autoFocus
          />
        </div>

        <div className="hc-form-row">
          <div className="hc-field">
            <label className="hc-field-label" htmlFor="chore-every">
              Every
            </label>
            <input
              id="chore-every"
              className="hc-input"
              type="number"
              min={1}
              inputMode="numeric"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div className="hc-field">
            <label className="hc-field-label" htmlFor="chore-unit">
              Unit
            </label>
            <div className="hc-select-wrap">
              <select id="chore-unit" className="hc-select" value={unit} onChange={e => setUnit(e.target.value as Unit)}>
                <option value="days">days</option>
                <option value="weeks">weeks</option>
              </select>
            </div>
          </div>
        </div>

        <div className="hc-field">
          <label className="hc-field-label" htmlFor="chore-assignee">
            Assigned to
          </label>
          <div className="hc-select-wrap">
            <select
              id="chore-assignee"
              className="hc-select"
              value={assignee}
              onChange={e => setAssignee(e.target.value as Assignee)}
            >
              {assignees.map(key => (
                <option key={key} value={key}>
                  {labels[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="hc-error">{error}</p>}

        <div className="hc-form-actions">
          <button type="button" className="hc-btn hc-btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="hc-btn hc-btn--primary">
            Save
          </button>
        </div>
      </form>
    </section>
  )
}
