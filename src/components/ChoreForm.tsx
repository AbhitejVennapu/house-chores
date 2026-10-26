import { useState, type FormEvent } from 'react'
import type { Assignee, Chore, ChoreFormValues } from '../types'
import { ASSIGNEE_LABELS } from '../lib/labels'

type Unit = 'days' | 'weeks'

interface Props {
  initial?: Chore
  assignees: Assignee[]
  onSubmit: (values: ChoreFormValues) => void
  onCancel: () => void
}

export function ChoreForm({ initial, assignees, onSubmit, onCancel }: Props) {
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
    <form className="card form" onSubmit={handleSubmit}>
      <label>
        Name
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Laundry" autoFocus />
      </label>

      <div className="row-inline">
        <label>
          Every
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </label>
        <label>
          Unit
          <select value={unit} onChange={e => setUnit(e.target.value as Unit)}>
            <option value="days">days</option>
            <option value="weeks">weeks</option>
          </select>
        </label>
      </div>

      <label>
        Assigned to
        <select value={assignee} onChange={e => setAssignee(e.target.value as Assignee)}>
          {assignees.map(key => (
            <option key={key} value={key}>
              {ASSIGNEE_LABELS[key]}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button type="submit" className="primary">
          Save
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
