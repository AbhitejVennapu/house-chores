export type Assignee = 'me' | 'partner' | 'anyone'

export interface Chore {
  id: string
  name: string
  frequencyDays: number
  assignee: Assignee
}

// One row per time a chore was done. A chore's last-done date is derived from these.
export interface Completion {
  id: string
  choreId: string
  doneOn: string // YYYY-MM-DD, local time
}

export interface AppData {
  version: 1
  chores: Chore[]
  completions: Completion[]
}
