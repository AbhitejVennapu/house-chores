import { useMemo, useState } from 'react'
import { summarizeChore, type ChoreSummary } from '../lib/chores'
import { todayISO, parseISODate } from '../lib/dates'
import { formatDueText, formatFrequency } from '../lib/labels'
import type { ChoreStore } from '../hooks/useChoreStore'
import type { Assignee } from '../types'
import { CheckIcon } from './icons'

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

  const overdueCount = summaries.filter(s => s.status === 'overdue').length
  const todayCount = summaries.filter(s => s.status === 'today').length
  const weekday = parseISODate(today).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

  if (data.chores.length === 0) {
    return (
      <>
        <PageHead kicker={weekday} title="Today" lede="No chores yet" />
        <div className="hc-empty" style={{ marginTop: 24 }}>
          <div className="hc-empty-icon">
            <CheckIcon />
          </div>
          <p className="hc-empty-title">Nothing to track yet</p>
          <p className="hc-empty-text">Add your first chore in the Chores tab.</p>
        </div>
      </>
    )
  }

  const onDone = (choreId: string) => markDone(choreId, today)

  return (
    <>
      <PageHead kicker={weekday} title="Today" lede={`${overdueCount} overdue · ${todayCount} due today`} />

      <div className="hc-filter" role="group" aria-label="Filter by person">
        {FILTERS.map(f => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : labels[f]}
          </button>
        ))}
      </div>

      {summaries.length === 0 && <p className="hc-status-line" style={{ marginTop: 24 }}>Nothing assigned here.</p>}
      <Group title="Overdue" items={summaries.filter(s => s.status === 'overdue')} labels={labels} onDone={onDone} />
      <Group title="Due today" items={summaries.filter(s => s.status === 'today')} labels={labels} onDone={onDone} />
      <Group title="Upcoming" items={summaries.filter(s => s.status === 'upcoming')} labels={labels} onDone={onDone} />
    </>
  )
}

function PageHead({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <header className="hc-page-head">
      <p className="hc-kicker">{kicker}</p>
      <h1 className="hc-h1">{title}</h1>
      <p className="hc-lede">{lede}</p>
    </header>
  )
}

interface GroupProps {
  title: string
  items: ChoreSummary[]
  labels: ChoreStore['labels']
  onDone: (choreId: string) => void
}

function Group({ title, items, labels, onDone }: GroupProps) {
  if (items.length === 0) return null

  return (
    <section className="hc-group" aria-labelledby={`group-${title}`}>
      <div className="hc-group-head">
        <h2 className="hc-group-title" id={`group-${title}`}>
          {title}
        </h2>
        <span className="hc-group-count">{items.length}</span>
      </div>
      <div className="hc-card">
        {items.map(summary => (
          <div key={summary.chore.id} className="hc-item">
            <div className="hc-item-main">
              <p className="hc-item-name">{summary.chore.name}</p>
              <span className={`hc-status ${statusClass(summary)}`}>{formatDueText(summary)}</span>
              <span className="hc-item-meta">
                {formatFrequency(summary.chore.frequencyDays)} · {labels[summary.chore.assignee]}
              </span>
            </div>
            <button
              type="button"
              className={`hc-done ${summary.status === 'upcoming' ? '' : 'is-primary'}`}
              onClick={() => onDone(summary.chore.id)}
            >
              <CheckIcon />
              Done
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function statusClass({ status, daysUntilDue }: ChoreSummary): string {
  if (status === 'overdue') return 'is-overdue'
  if (status === 'today') return 'is-today'
  return daysUntilDue > 3 ? 'is-quiet' : ''
}
