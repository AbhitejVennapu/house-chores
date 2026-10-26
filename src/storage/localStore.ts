import type { AppData } from '../types'

// Checkpoint 2 replaces this module with Supabase calls. Keep the shape of AppData stable until then.
const STORAGE_KEY = 'house-chores:data'

const EMPTY_DATA: AppData = { version: 1, chores: [], completions: [] }

export function isAppData(value: unknown): value is AppData {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<AppData>
  return candidate.version === 1 && Array.isArray(candidate.chores) && Array.isArray(candidate.completions)
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_DATA
    const parsed: unknown = JSON.parse(raw)
    return isAppData(parsed) ? parsed : EMPTY_DATA
  } catch {
    // Storage can be blocked (private mode, disabled site data). Fall back to an empty app.
    return EMPTY_DATA
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Could not save chores to localStorage', error)
  }
}
