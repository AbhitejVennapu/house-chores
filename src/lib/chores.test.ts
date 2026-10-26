import { describe, expect, it } from 'vitest'
import { summarizeChore } from './chores'
import type { Chore, Completion } from '../types'

const TODAY = '2026-10-26'
const laundry: Chore = { id: 'laundry', name: 'Laundry', frequencyDays: 4, assignee: 'anyone' }

const done = (doneOn: string, choreId = laundry.id): Completion => ({
  id: `${choreId}-${doneOn}`,
  choreId,
  doneOn,
})

describe('summarizeChore', () => {
  it('treats a never-done chore as due today', () => {
    const summary = summarizeChore(laundry, [], TODAY)
    expect(summary.status).toBe('today')
    expect(summary.dueOn).toBe(TODAY)
  })

  it('is due today when the frequency has elapsed exactly', () => {
    const summary = summarizeChore(laundry, [done('2026-10-22')], TODAY)
    expect(summary.dueOn).toBe('2026-10-26')
    expect(summary.status).toBe('today')
  })

  it('is overdue when the frequency has passed', () => {
    const summary = summarizeChore(laundry, [done('2026-10-20')], TODAY)
    expect(summary.status).toBe('overdue')
    expect(summary.daysUntilDue).toBe(-2)
  })

  it('is upcoming when the next due date is in the future', () => {
    const summary = summarizeChore(laundry, [done('2026-10-25')], TODAY)
    expect(summary.status).toBe('upcoming')
    expect(summary.daysUntilDue).toBe(3)
  })

  it('uses the latest completion, not the last one in the array', () => {
    const completions = [done('2026-10-25'), done('2026-10-10'), done('2026-10-18')]
    const summary = summarizeChore(laundry, completions, TODAY)
    expect(summary.lastDoneOn).toBe('2026-10-25')
  })

  it('ignores completions of other chores', () => {
    const summary = summarizeChore(laundry, [done('2026-10-25', 'dishes')], TODAY)
    expect(summary.lastDoneOn).toBeNull()
  })
})
