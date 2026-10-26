import type { ChoreStore } from '../hooks/useChoreStore'
import { formatDate } from '../lib/labels'

export function History({ store }: { store: ChoreStore }) {
  const { data, deleteCompletion } = store
  const names = new Map(data.chores.map(chore => [chore.id, chore.name]))
  const rows = [...data.completions].sort((a, b) => b.doneOn.localeCompare(a.doneOn))

  if (rows.length === 0) {
    return <p className="empty">Nothing completed yet.</p>
  }

  return (
    <ul className="list">
      {rows.map(row => (
        <li key={row.id} className="card">
          <div>
            <strong>{names.get(row.choreId) ?? 'Deleted chore'}</strong>
            <div className="muted">{formatDate(row.doneOn)}</div>
          </div>
          <button onClick={() => deleteCompletion(row.id)}>Undo</button>
        </li>
      ))}
    </ul>
  )
}
