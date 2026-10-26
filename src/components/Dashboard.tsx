import { useMemo, useState } from 'react'
import { summarizeChore, type ChoreSummary } from '../lib/chores'
import { todayISO } from '../lib/dates'
import { formatDueText, formatFrequency } from '../lib/labels'
import type { ChoreStore } from '../hooks/useChoreStore'
import type { Assignee } from '../types'

type Filter = Assignee | 'all'

const FILTERS: Filter[] = ['all', 'me', 'partner', 'anyone']

export function Dashboard({ store }: { store: ChoreStore }) {
  const { data, markDone, labels } = store
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
    return (
      <div className="hc-empty">
        <p className="hc-empty-title">No chores yet</p>
        <p className="hc-empty-text">Add your first chore in the Chores tab.</p>
      </div>
    )
  }

  const byStatus = (status: ChoreSummary['status']) => summaries.filter(s => s.status === status)
  const onDone = (choreId: string) => markDone(choreId, today)

  return (
    <>
      <div className="hc-chips" role="group" aria-label="Filter by person">
        {FILTERS.map(f => (
          <button key={f} type="button" className="hc-chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : labels[f]}
          </button>
        ))}
      </div>

      {summaries.length === 0 && (
        <div className="hc-empty">
          <p className="hc-empty-text">Nothing assigned here.</p>
        </div>
      )}
      <Section title="Overdue" items={byStatus('overdue')} labels={labels} onDone={onDone} />
      <Section title="Due today" items={byStatus('today')} labels={labels} onDone={onDone} />
      <Section title="Upcoming" items={byStatus('upcoming')} labels={labels} onDone={onDone} />
    </>
  )
}

interface SectionProps {
  title: string
  items: ChoreSummary[]
  labels: ChoreStore['labels']
  onDone: (choreId: string) => void
}

function Section({ title, items, labels, onDone }: SectionProps) {
  if (items.length === 0) return null

  return (
    <section>
      <h2 className="hc-label">{title}</h2>
      <ul className="hc-list">
        {items.map(summary => {
          const status = summary.status
          const cardClass = status === 'overdue' ? 'is-overdue' : status === 'today' ? 'is-today' : ''
          const badgeClass = status === 'overdue' ? 'is-overdue' : status === 'today' ? 'is-today' : ''
          return (
            <li key={summary.chore.id} className={`hc-chore ${cardClass}`}>
              <div className="hc-chore-body">
                <p className="hc-chore-name">{summary.chore.name}</p>
                <span className={`hc-badge ${badgeClass}`}>{formatDueText(summary)}</span>
                <span className="hc-chore-meta">
                  {formatFrequency(summary.chore.frequencyDays)} · {labels[summary.chore.assignee]}
                </span>
              </div>
              <button
                type="button"
                className={`hc-btn ${status === 'upcoming' ? 'hc-btn--secondary' : 'hc-btn--primary'}`}
                onClick={() => onDone(summary.chore.id)}
              >
                Done
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
