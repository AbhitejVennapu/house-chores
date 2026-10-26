import type { Assignee } from '../types'
import type { ChoreSummary } from './chores'
import { parseISODate } from './dates'

export const ASSIGNEE_LABELS: Record<Assignee, string> = {
  me: 'Me',
  partner: 'Partner',
  anyone: 'Anyone',
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export function formatFrequency(days: number): string {
  return days % 7 === 0 ? `Every ${plural(days / 7, 'week')}` : `Every ${plural(days, 'day')}`
}

export function formatDueText(summary: ChoreSummary): string {
  if (summary.status === 'overdue') return `${plural(-summary.daysUntilDue, 'day')} overdue`
  if (summary.status === 'today') return 'Due today'
  return `Due in ${plural(summary.daysUntilDue, 'day')}`
}

export function formatDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
