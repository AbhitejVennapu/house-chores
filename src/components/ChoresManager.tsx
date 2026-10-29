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
  const count = data.chores.length

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
      <header className="hc-page-head">
        <p className="hc-kicker">Shared between you</p>
        <h1 className="hc-h1">Chores</h1>
        <p className="hc-lede">{count === 1 ? '1 chore in total' : `${count} chores in total`}</p>
      </header>

      {editing ? (
        <ChoreForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? undefined : editing}
          assignees={assignees}
          labels={labels}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <button
          type="button"
          className="hc-btn hc-btn--primary hc-btn--block"
          onClick={() => setEditing('new')}
        >
          Add chore
        </button>
      )}

      {count > 0 && (
        <section className="hc-group" aria-labelledby="all-chores">
          <div className="hc-group-head">
            <h2 className="hc-group-title" id="all-chores">
              All chores
            </h2>
            <span className="hc-group-count">{count}</span>
          </div>
          <div className="hc-card">
            {data.chores.map((chore) => (
              <div key={chore.id} className="hc-item">
                <div className="hc-item-main">
                  <p className="hc-item-name">{chore.name}</p>
                  <span className="hc-item-meta">
                    {formatFrequency(chore.frequencyDays)} · {labels[chore.assignee]}
                  </span>
                </div>
                <button
                  type="button"
                  className="hc-btn hc-btn--quiet"
                  onClick={() => setEditing(chore)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="hc-btn hc-btn--danger"
                  onClick={() => handleDelete(chore)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
