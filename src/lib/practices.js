import { supabase } from '../supabaseClient'

export const SPIES_CATEGORIES = [
  { key: 'social', label: 'Social', hint: 'Relationships, community, phone-free time with people.' },
  { key: 'physical', label: 'Physical', hint: 'Sleep, movement, food, the body you live in.' },
  { key: 'intellectual', label: 'Intellectual', hint: 'Reading, learning, replacing passive scrolling.' },
  { key: 'emotional', label: 'Emotional', hint: 'Naming feelings, sitting with discomfort, processing.' },
  { key: 'spiritual', label: 'Spiritual', hint: 'Prayer, Scripture, Mass, stillness.' },
]

export const practices = {
  async list(userId) {
    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },
  async add(userId, category, label, why) {
    const trimmed = label.trim()
    if (!trimmed) return null
    const { data, error } = await supabase
      .from('practices')
      .insert({ user_id: userId, category, label: trimmed, why: why?.trim() || null })
      .select()
      .single()
    if (error) throw error
    return data
  },
  async remove(id) {
    const { error } = await supabase.from('practices').delete().eq('id', id)
    if (error) throw error
  },
}
