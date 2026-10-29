import { supabase } from '../lib/supabase'
import type { Assignee, Chore, ChoreFormValues, HouseholdData } from '../types'

export interface HouseholdContext {
  householdId: string
  userId: string
  partnerId: string | null
}

interface ChoreRow {
  id: string
  name: string
  frequency_days: number
  assignee_user_id: string | null
}

interface CompletionRow {
  id: string
  chore_id: string
  done_on: string
}

interface MemberRow {
  user_id: string
}

interface ProfileRow {
  user_id: string
  display_name: string
}

// Converts the app's relative assignee to a database user id.
const toUserId = (assignee: Assignee, ctx: HouseholdContext): string | null => {
  if (assignee === 'me') return ctx.userId
  if (assignee === 'partner') return ctx.partnerId
  return null
}

const toAssignee = (userId: string | null, ctx: HouseholdContext): Assignee => {
  if (userId === null) return 'anyone'
  return userId === ctx.userId ? 'me' : 'partner'
}

export interface HouseholdSnapshot {
  data: HouseholdData
  partnerId: string | null
  myName: string | null
  partnerName: string | null
}

export async function fetchHousehold(
  householdId: string,
  userId: string,
): Promise<HouseholdSnapshot> {
  const [choresRes, completionsRes, membersRes] = await Promise.all([
    supabase
      .from('chores')
      .select('id, name, frequency_days, assignee_user_id')
      .eq('household_id', householdId)
      .order('created_at'),
    supabase.from('completions').select('id, chore_id, done_on').eq('household_id', householdId),
    supabase.from('household_members').select('user_id').eq('household_id', householdId),
  ])

  if (choresRes.error) throw choresRes.error
  if (completionsRes.error) throw completionsRes.error
  if (membersRes.error) throw membersRes.error

  const members = (membersRes.data ?? []) as MemberRow[]
  const ctx: HouseholdContext = {
    householdId,
    userId,
    partnerId: members.find((m) => m.user_id !== userId)?.user_id ?? null,
  }

  // Names are optional. If the profiles table is missing, the app still works with default labels.
  const names = new Map<string, string>()
  const profilesRes = await supabase
    .from('profiles')
    .select('user_id, display_name')
    .in(
      'user_id',
      members.map((m) => m.user_id),
    )
  if (profilesRes.error) console.warn('Could not load display names', profilesRes.error)
  for (const row of (profilesRes.data ?? []) as ProfileRow[])
    names.set(row.user_id, row.display_name)

  const chores: Chore[] = ((choresRes.data ?? []) as ChoreRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    frequencyDays: row.frequency_days,
    assignee: toAssignee(row.assignee_user_id, ctx),
  }))

  const completions = ((completionsRes.data ?? []) as CompletionRow[]).map((row) => ({
    id: row.id,
    choreId: row.chore_id,
    doneOn: row.done_on,
  }))

  return {
    data: { chores, completions },
    partnerId: ctx.partnerId,
    myName: names.get(userId) ?? null,
    partnerName: ctx.partnerId ? (names.get(ctx.partnerId) ?? null) : null,
  }
}

export async function saveDisplayName(userId: string, displayName: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, display_name: displayName })
  if (error) throw error
}

export async function insertChore(ctx: HouseholdContext, values: ChoreFormValues): Promise<void> {
  const { error } = await supabase.from('chores').insert({
    household_id: ctx.householdId,
    name: values.name,
    frequency_days: values.frequencyDays,
    assignee_user_id: toUserId(values.assignee, ctx),
  })
  if (error) throw error
}

export async function updateChore(ctx: HouseholdContext, chore: Chore): Promise<void> {
  const { error } = await supabase
    .from('chores')
    .update({
      name: chore.name,
      frequency_days: chore.frequencyDays,
      assignee_user_id: toUserId(chore.assignee, ctx),
    })
    .eq('id', chore.id)
  if (error) throw error
}

export async function deleteChore(choreId: string): Promise<void> {
  const { error } = await supabase.from('chores').delete().eq('id', choreId)
  if (error) throw error
}

export async function insertCompletion(
  ctx: HouseholdContext,
  choreId: string,
  doneOn: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('completions')
    .insert({
      household_id: ctx.householdId,
      chore_id: choreId,
      done_on: doneOn,
    })
    .select('id')
    .single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function deleteCompletion(completionId: string): Promise<void> {
  const { error } = await supabase.from('completions').delete().eq('id', completionId)
  if (error) throw error
}
