// "me" and "partner" are relative to the signed-in user. "anyone" means no specific person.
export type Assignee = 'me' | 'partner' | 'anyone'

export interface Chore {
  id: string
  name: string
  frequencyDays: number
  assignee: Assignee
}

export type ChoreFormValues = Omit<Chore, 'id'>

// One row per time a chore was done. A chore's last-done date is derived from these.
export interface Completion {
  id: string
  choreId: string
  doneOn: string // YYYY-MM-DD
}

export interface HouseholdData {
  chores: Chore[]
  completions: Completion[]
}
