import type { Chore, Completion } from '../types'
import { addDays, daysBetween } from './dates'

export type ChoreStatus = 'overdue' | 'today' | 'upcoming'

export interface ChoreSummary {
  chore: Chore
  lastDoneOn: string | null
  dueOn: string
  daysUntilDue: number // negative means overdue
  status: ChoreStatus
}

export function summarizeChore(
  chore: Chore,
  completions: Completion[],
  today: string,
): ChoreSummary {
  const lastDoneOn = completions
    .filter((c) => c.choreId === chore.id)
    .reduce<string | null>(
      (latest, c) => (latest === null || c.doneOn > latest ? c.doneOn : latest),
      null,
    )

  // A chore that has never been done is due today.
  const dueOn = lastDoneOn ? addDays(lastDoneOn, chore.frequencyDays) : today
  const daysUntilDue = daysBetween(today, dueOn)
  const status: ChoreStatus =
    daysUntilDue < 0 ? 'overdue' : daysUntilDue === 0 ? 'today' : 'upcoming'

  return { chore, lastDoneOn, dueOn, daysUntilDue, status }
}
