import { supabase } from './supabase'

export async function fetchCurrentMenus(activeOnly = true) {
  let query = supabase
    .from('menu')
    .select('*')
    .eq('is_current', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (activeOnly) {
    query = query.eq('active', true)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchMenuOptions() {
  const [{ data: proteins, error: pErr }, { data: noodles, error: nErr }, { data: extras, error: eErr }] =
    await Promise.all([
      supabase.from('menu_proteins').select('*').eq('active', true).order('sort_order', { ascending: true }),
      supabase.from('menu_noodles').select('*').eq('active', true).order('sort_order', { ascending: true }),
      supabase.from('menu_extras').select('*').eq('active', true).order('sort_order', { ascending: true }),
    ])

  if (pErr) throw pErr
  if (nErr) throw nErr
  if (eErr) throw eErr

  return {
    proteins: proteins || [],
    noodles: noodles || [],
    extras: extras || [],
  }
}