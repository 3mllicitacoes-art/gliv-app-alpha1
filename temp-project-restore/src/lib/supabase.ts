import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Função para criar cliente Supabase
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Cliente singleton para uso geral
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper para verificar autenticação
export async function getCurrentUser() {
  if (!supabase) {
    console.warn('Supabase não configurado. Configure as variáveis de ambiente.');
    return null;
  }
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper para logout
export async function signOut() {
  if (!supabase) {
    console.warn('Supabase não configurado. Configure as variáveis de ambiente.');
    return;
  }
  await supabase.auth.signOut();
}
