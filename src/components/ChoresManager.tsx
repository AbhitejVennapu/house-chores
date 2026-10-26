import { useState } from 'react'
import type { ChoreStore } from '../hooks/useChoreStore'
import type { Assignee, Chore, ChoreFormValues } from '../types'
import { ASSIGNEE_LABELS, formatFrequency } from '../lib/labels'
import { ChoreForm } from './ChoreForm'

type Editing = Chore | 'new' | null

export function ChoresManager({ store }: { store: ChoreStore }) {
  const { data, addChore, updateChore, deleteChore, hasPartner } = store
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

  return (
    <>
      {editing ? (
        <ChoreForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? undefined : editing}
          assignees={assignees}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <button className="primary" onClick={() => setEditing('new')}>
          Add chore
        </button>
      )}

      <ul className="list">
        {data.chores.map(chore => (
          <li key={chore.id} className="card">
            <div>
              <strong>{chore.name}</strong>
              <div className="muted">
                {formatFrequency(chore.frequencyDays)} · {ASSIGNEE_LABELS[chore.assignee]}
              </div>
            </div>
            <div className="actions">
              <button onClick={() => setEditing(chore)}>Edit</button>
              <button className="danger" onClick={() => handleDelete(chore)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
