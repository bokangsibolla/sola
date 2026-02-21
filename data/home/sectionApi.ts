import { supabase } from '@/lib/supabase';
import { toCamel } from '@/data/api';
import type { HomeSectionRow, SearchChip } from './sectionTypes';

/**
 * Fetch active homepage sections, ordered by order_index.
 * Returns empty array if the table doesn't exist yet (migration not applied).
 */
export async function fetchHomeSections(): Promise<HomeSectionRow[]> {
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  // Gracefully handle missing table (migration not yet applied)
  if (error) return [];
  return (data ?? []).map((row: Record<string, unknown>) => toCamel<HomeSectionRow>(row));
}

/**
 * Fetch search chips for a given surface (home, explore, or both).
 * Returns empty array if the table doesn't exist yet (migration not applied).
 */
export async function fetchSearchChips(
  surface: 'home' | 'explore',
): Promise<SearchChip[]> {
  const { data, error } = await supabase
    .from('search_chips')
    .select('*')
    .eq('is_active', true)
    .or(`surface.eq.${surface},surface.eq.both`)
    .order('order_index');

  // Gracefully handle missing table (migration not yet applied)
  if (error) return [];
  return (data ?? []).map((row: Record<string, unknown>) => toCamel<SearchChip>(row));
}
