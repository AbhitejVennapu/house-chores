import type { ChoreStore } from '../hooks/useChoreStore'
import { formatDate } from '../lib/labels'
import { CheckIcon } from './icons'

export function History({ store }: { store: ChoreStore }) {
  const { data, deleteCompletion, labels } = store
  const names = new Map(data.chores.map(chore => [chore.id, chore.name]))
  const assignees = new Map(data.chores.map(chore => [chore.id, chore.assignee]))
  const rows = [...data.completions].sort((a, b) => b.doneOn.localeCompare(a.doneOn))

  const byDay = new Map<string, typeof rows>()
  for (const row of rows) {
    byDay.set(row.doneOn, [...(byDay.get(row.doneOn) ?? []), row])
  }

  return (
    <>
      <header className="hc-page-head">
        <p className="hc-kicker">Recent</p>
        <h1 className="hc-h1">History</h1>
        <p className="hc-lede">
          {rows.length === 0 ? 'Nothing completed yet' : `${rows.length} ${rows.length === 1 ? 'chore' : 'chores'} completed`}
        </p>
      </header>

      {rows.length === 0 && (
        <div className="hc-empty" style={{ marginTop: 24 }}>
          <div className="hc-empty-icon">
            <CheckIcon />
          </div>
          <p className="hc-empty-title">No history yet</p>
          <p className="hc-empty-text">Chores you mark done will show up here.</p>
        </div>
      )}

      {[...byDay.entries()].map(([day, dayRows]) => (
        <section key={day} className="hc-group" aria-labelledby={`day-${day}`}>
          <div className="hc-group-head">
            <h2 className="hc-group-title" id={`day-${day}`}>
              {formatDate(day)}
            </h2>
            <span className="hc-group-count">{dayRows.length}</span>
          </div>
          <div className="hc-card">
            {dayRows.map(row => {
              const assignee = assignees.get(row.choreId)
              return (
                <div key={row.id} className="hc-item">
                  <div className="hc-item-main">
                    <p className="hc-item-name">{names.get(row.choreId) ?? 'Deleted chore'}</p>
                    {assignee && <span className="hc-item-meta">{labels[assignee]}</span>}
                  </div>
                  <button type="button" className="hc-btn hc-btn--quiet" onClick={() => deleteCompletion(row.id)}>
                    Undo
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </>
  )
}
