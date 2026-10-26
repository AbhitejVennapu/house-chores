import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import * as remote from '../data/remote'
import { ASSIGNEE_LABELS } from '../lib/labels'
import type { Assignee, Chore, ChoreFormValues, HouseholdData } from '../types'

export interface ChoreStore {
  data: HouseholdData
  hasPartner: boolean
  labels: Record<Assignee, string>
  myName: string | null
  loading: boolean
  error: string | null
  addChore: (values: ChoreFormValues) => void
  updateChore: (chore: Chore) => void
  deleteChore: (choreId: string) => void
  markDone: (choreId: string, doneOn: string) => void
  deleteCompletion: (completionId: string) => void
  saveName: (displayName: string) => void
}

const EMPTY_DATA: HouseholdData = { chores: [], completions: [] }

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

export function useChoreStore(householdId: string, userId: string): ChoreStore {
  const [data, setData] = useState<HouseholdData>(EMPTY_DATA)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [myName, setMyName] = useState<string | null>(null)
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chores', filter }, () => reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions', filter }, () => reload())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, reload])

  const write = (operation: () => Promise<void>) => {
    operation().then(reload).catch(err => setError(messageOf(err)))
  }

  const labels: Record<Assignee, string> = {
    me: myName ?? ASSIGNEE_LABELS.me,
    partner: partnerName ?? ASSIGNEE_LABELS.partner,
    anyone: ASSIGNEE_LABELS.anyone,
  }

  return {
    data,
    hasPartner: partnerId !== null,
    labels,
    myName,
    loading,
    error,
    addChore: values => write(() => remote.insertChore(ctx, values)),
    updateChore: chore => write(() => remote.updateChore(ctx, chore)),
    deleteChore: choreId => write(() => remote.deleteChore(choreId)),
    markDone: (choreId, doneOn) => write(() => remote.insertCompletion(ctx, choreId, doneOn)),
    deleteCompletion: completionId => write(() => remote.deleteCompletion(completionId)),
    saveName: displayName => write(() => remote.saveDisplayName(userId, displayName)),
  }
}
