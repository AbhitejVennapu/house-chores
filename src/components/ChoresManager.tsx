import { useState } from 'react'
import type { ChoreStore } from '../hooks/useChoreStore'
import type { Assignee, Chore, ChoreFormValues } from '../types'
import { formatFrequency } from '../lib/labels'
import { ChoreForm } from './ChoreForm'

type Editing = Chore | 'new' | null

export function ChoresManager({ store }: { store: ChoreStore }) {
  const { data, addChore, updateChore, deleteChore, hasPartner, labels } = store
  const [editing, setEditing] = useState<Editing>(null)

  const assignees: Assignee[] = hasPartner ? ['me', 'partner', 'anyone'] : ['me', 'anyone']

  const handleSubmit = (values: ChoreFormValues) => {
    if (editing === 'new') addChore(values)
    else if (editing) updateChore({ ...editing, ...values })
    setEditing(null)
  }

  const handleDelete = (chore: Chore) => {
    if (confirm(`Delete "${chore.name}" and its history?`)) deleteChore(chore.id)
  }

  if (editing) {
    return (
      <ChoreForm
        key={editing === 'new' ? 'new' : editing.id}
        initial={editing === 'new' ? undefined : editing}
        assignees={assignees}
        labels={labels}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <>
      <button type="button" className="hc-btn hc-btn--primary hc-btn--block" onClick={() => setEditing('new')}>
        Add chore
      </button>

      {data.chores.length === 0 ? (
        <div className="hc-empty" style={{ marginTop: 16 }}>
          <p className="hc-empty-title">No chores yet</p>
          <p className="hc-empty-text">Add the things you share, like bins, laundry, or the dishwasher.</p>
        </div>
      ) : (
        <ul className="hc-list" style={{ marginTop: 16 }}>
          {data.chores.map(chore => (
            <li key={chore.id} className="hc-chore">
              <div className="hc-chore-body">
                <p className="hc-chore-name">{chore.name}</p>
                <span className="hc-chore-meta">
                  {formatFrequency(chore.frequencyDays)} · {labels[chore.assignee]}
                </span>
              </div>
              <button type="button" className="hc-btn hc-btn--secondary" onClick={() => setEditing(chore)}>
                Edit
              </button>
              <button type="button" className="hc-btn hc-btn--danger" onClick={() => handleDelete(chore)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
