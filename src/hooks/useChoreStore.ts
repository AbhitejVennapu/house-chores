import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import * as remote from '../data/remote'
import { ASSIGNEE_LABELS } from '../lib/labels'
import type { Assignee, Chore, ChoreFormValues, HouseholdData } from '../types'

export interface DoneToast {
  completionId: string
  choreName: string
}

export interface ChoreStore {
  data: HouseholdData
  hasPartner: boolean
  labels: Record<Assignee, string>
  myName: string | null
  loading: boolean
  error: string | null
  toast: DoneToast | null
  addChore: (values: ChoreFormValues) => void
  updateChore: (chore: Chore) => void
  deleteChore: (choreId: string) => void
  markDone: (choreId: string, doneOn: string) => void
  undoToast: () => void
  dismissToast: () => void
  deleteCompletion: (completionId: string) => void
  saveName: (displayName: string) => void
}

const EMPTY_DATA: HouseholdData = { chores: [], completions: [] }
const TOAST_MS = 4000

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

export function useChoreStore(householdId: string, userId: string): ChoreStore {
  const [data, setData] = useState<HouseholdData>(EMPTY_DATA)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [myName, setMyName] = useState<string | null>(null)
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<DoneToast | null>(null)

  const ctx = useMemo(() => ({ householdId, userId, partnerId }), [householdId, userId, partnerId])

  const reload = useCallback(async () => {
    try {
      const next = await remote.fetchHousehold(householdId, userId)
      setData(next.data)
      setPartnerId(next.partnerId)
      setMyName(next.myName)
      setPartnerName(next.partnerName)
      setError(null)
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setLoading(false)
    }
  }, [householdId, userId])

  // Reload whenever either table changes, including changes made from the other device.
  useEffect(() => {
    reload()
    const filter = `household_id=eq.${householdId}`
    const channel = supabase
      .channel(`household-${householdId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chores', filter }, () =>
        reload(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions', filter }, () =>
        reload(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, reload])

  // The Done toast hides itself after a few seconds.
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [toast])

  const write = (operation: () => Promise<void>) => {
    operation()
      .then(reload)
      .catch((err) => setError(messageOf(err)))
  }

  const labels: Record<Assignee, string> = {
    me: myName ?? ASSIGNEE_LABELS.me,
    partner: partnerName ?? ASSIGNEE_LABELS.partner,
    anyone: ASSIGNEE_LABELS.anyone,
  }

  const markDone = (choreId: string, doneOn: string) => {
    const choreName = data.chores.find((c) => c.id === choreId)?.name ?? 'Chore'
    remote
      .insertCompletion(ctx, choreId, doneOn)
      .then((completionId) => {
        setToast({ completionId, choreName })
        return reload()
      })
      .catch((err) => setError(messageOf(err)))
  }

  const undoToast = () => {
    if (!toast) return
    const { completionId } = toast
    setToast(null)
    write(() => remote.deleteCompletion(completionId))
  }

  return {
    data,
    hasPartner: partnerId !== null,
    labels,
    myName,
    loading,
    error,
    toast,
    addChore: (values) => write(() => remote.insertChore(ctx, values)),
    updateChore: (chore) => write(() => remote.updateChore(ctx, chore)),
    deleteChore: (choreId) => write(() => remote.deleteChore(choreId)),
    markDone,
    undoToast,
    dismissToast: () => setToast(null),
    deleteCompletion: (completionId) => write(() => remote.deleteCompletion(completionId)),
    saveName: (displayName) => write(() => remote.saveDisplayName(userId, displayName)),
  }
}
