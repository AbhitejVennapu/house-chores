import type { ChoreStore } from '../hooks/useChoreStore'
import { formatDate } from '../lib/labels'

export function History({ store }: { store: ChoreStore }) {
  const { data, deleteCompletion } = store
  const names = new Map(data.chores.map(chore => [chore.id, chore.name]))
  const rows = [...data.completions].sort((a, b) => b.doneOn.localeCompare(a.doneOn))

  if (rows.length === 0) {
    return (
      <div className="hc-empty">
        <p className="hc-empty-title">Nothing completed yet</p>
        <p className="hc-empty-text">Chores you mark done will show up here.</p>
      </div>
    )
  }

  return (
    <ul className="hc-list">
      {rows.map(row => (
        <li key={row.id} className="hc-chore">
          <div className="hc-chore-body">
            <p className="hc-chore-name">{names.get(row.choreId) ?? 'Deleted chore'}</p>
            <span className="hc-chore-meta">{formatDate(row.doneOn)}</span>
          </div>
          <button type="button" className="hc-btn hc-btn--secondary" onClick={() => deleteCompletion(row.id)}>
            Undo
          </button>
        </li>
      ))}
    </ul>
  )
}
