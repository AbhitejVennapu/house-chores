import { useCallback, useEffect, useState } from 'react'
import type { AppData, Chore, Completion } from '../types'
import { loadData, saveData } from '../storage/localStore'

export type ChoreFormValues = Omit<Chore, 'id'>

export interface ChoreStore {
  data: AppData
  addChore: (values: ChoreFormValues) => void
  updateChore: (chore: Chore) => void
  deleteChore: (choreId: string) => void
  markDone: (choreId: string, doneOn: string) => void
  deleteCompletion: (completionId: string) => void
  replaceData: (data: AppData) => void
}

const newId = () => crypto.randomUUID()

export function useChoreStore(): ChoreStore {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const addChore = useCallback((values: ChoreFormValues) => {
    setData(d => ({ ...d, chores: [...d.chores, { ...values, id: newId() }] }))
  }, [])

  const updateChore = useCallback((chore: Chore) => {
    setData(d => ({ ...d, chores: d.chores.map(c => (c.id === chore.id ? chore : c)) }))
  }, [])

  const deleteChore = useCallback((choreId: string) => {
    setData(d => ({
      ...d,
      chores: d.chores.filter(c => c.id !== choreId),
      completions: d.completions.filter(c => c.choreId !== choreId),
    }))
  }, [])

  const markDone = useCallback((choreId: string, doneOn: string) => {
    const completion: Completion = { id: newId(), choreId, doneOn }
    setData(d => ({ ...d, completions: [...d.completions, completion] }))
  }, [])

  const deleteCompletion = useCallback((completionId: string) => {
    setData(d => ({ ...d, completions: d.completions.filter(c => c.id !== completionId) }))
  }, [])

  const replaceData = useCallback((next: AppData) => setData(next), [])

  return { data, addChore, updateChore, deleteChore, markDone, deleteCompletion, replaceData }
}
