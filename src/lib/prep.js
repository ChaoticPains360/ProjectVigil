import { supabase } from '../supabaseClient'

// PREP: the simple label-list tables (warning signs, triggers, reasons,
// commitments) all share the same shape, so one factory covers CRUD
// for each rather than four near-identical copies.
function makeLabelStore(table) {
  return {
    async list(userId) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    async add(userId, label) {
      const trimmed = label.trim()
      if (!trimmed) return null
      const { data, error } = await supabase
        .from(table)
        .insert({ user_id: userId, label: trimmed })
        .select()
        .single()
      if (error) throw error
      return data
    },
    async remove(id) {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
    },
  }
}

export const warningSigns = makeLabelStore('warning_signs')
export const personalTriggers = makeLabelStore('personal_triggers')
export const prepReasons = makeLabelStore('prep_reasons')
export const prepCommitments = makeLabelStore('prep_commitments')

export const prepPlans = {
  async list(userId) {
    const { data, error } = await supabase
      .from('prep_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },
  async add(userId, whenText, thenText) {
    if (!whenText.trim() || !thenText.trim()) return null
    const { data, error } = await supabase
      .from('prep_plans')
      .insert({ user_id: userId, when_text: whenText.trim(), then_text: thenText.trim() })
      .select()
      .single()
    if (error) throw error
    return data
  },
  async remove(id) {
    const { error } = await supabase.from('prep_plans').delete().eq('id', id)
    if (error) throw error
  },
}

export const prepWhy = {
  async get(userId) {
    const { data, error } = await supabase
      .from('prep_why')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data
  },
  async save(userId, body) {
    const { error } = await supabase
      .from('prep_why')
      .upsert({ user_id: userId, body, updated_at: new Date().toISOString() })
    if (error) throw error
  },
}
