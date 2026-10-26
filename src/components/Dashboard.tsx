import { useMemo, useState } from 'react'
import { summarizeChore, type ChoreSummary } from '../lib/chores'
import { todayISO } from '../lib/dates'
import { ASSIGNEE_LABELS, formatDueText, formatFrequency } from '../lib/labels'
import type { ChoreStore } from '../hooks/useChoreStore'
import type { Assignee } from '../types'

type Filter = Assignee | 'all'

const FILTERS: Filter[] = ['all', 'me', 'partner', 'anyone']

export function Dashboard({ store }: { store: ChoreStore }) {
  const { data, markDone } = store
  const today = todayISO()
  const [filter, setFilter] = useState<Filter>('all')

  const summaries = useMemo(
    () =>
      data.chores
        .filter(chore => filter === 'all' || chore.assignee === filter)
        .map(chore => summarizeChore(chore, data.completions, today))
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue || a.chore.name.localeCompare(b.chore.name)),
    [data, today, filter],
  )

  if (data.chores.length === 0) {
    return <p className="empty">No chores yet. Add some in the Chores tab.</p>
  }

  const byStatus = (status: ChoreSummary['status']) => summaries.filter(s => s.status === status)
  const onDone = (choreId: string) => markDone(choreId, today)

  return (
    <>
      <div className="segmented" role="group" aria-label="Filter by assignee">
        {FILTERS.map(f => (
          <button key={f} aria-pressed={filter === f} className={filter === f ? 'active' : undefined} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : ASSIGNEE_LABELS[f]}
          </button>
        ))}
      </div>

      {summaries.length === 0 && <p className="empty">Nothing assigned here.</p>}
      <Section title="Overdue" items={byStatus('overdue')} onDone={onDone} />
      <Section title="Due today" items={byStatus('today')} onDone={onDone} />
      <Section title="Upcoming" items={byStatus('upcoming')} onDone={onDone} />
    </>
  )
}

function Section({ title, items, onDone }: { title: string; items: ChoreSummary[]; onDone: (choreId: string) => void }) {
  if (items.length === 0) return null

  return (
    <section>
      <h2>{title}</h2>
      <ul className="list">
        {items.map(summary => (
          <li key={summary.chore.id} className={`card status-${summary.status}`}>
            <div>
              <strong>{summary.chore.name}</strong>
              <div className="muted">
                {formatFrequency(summary.chore.frequencyDays)} · {ASSIGNEE_LABELS[summary.chore.assignee]}
              </div>
              <div className="due">{formatDueText(summary)}</div>
            </div>
            <button className="primary" onClick={() => onDone(summary.chore.id)}>
              Done
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
