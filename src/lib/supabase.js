import { createClient } from '@supabase/supabase-js';

// Estas dos variables se configuran en un .env local (ver .env.example)
// Nunca hardcodear las keys reales en el código.
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Por ahora mono-cliente: el slug de Bruma queda fijo acá.
// El día que haya multi-tenant, este valor sale de la URL/subdominio.
export const VENUE_SLUG = 'bruma';

export async function getVenue() {
  const { data, error } = await supabase
    .from('venues')
    .select('*, venue_settings(*)')
    .eq('slug', VENUE_SLUG)
    .single();
  if (error) throw error;
  return data;
}

export async function getMenu(venueId) {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*, products(*)')
    .eq('venue_id', venueId)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });
  if (catError) throw catError;

  categories.forEach((cat) => {
    cat.products.sort((a, b) => a.sort_order - b.sort_order);
  });

  const { data: promoBlocks, error: promoError } = await supabase
    .from('promo_blocks')
    .select('*')
    .eq('venue_id', venueId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (promoError) throw promoError;

  return { categories, promoBlocks };
}
