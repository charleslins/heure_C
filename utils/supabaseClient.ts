import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: Substitua pelas suas credenciais reais do Supabase!
// 1. Vá para o painel do seu projeto no Supabase (supabase.com).
// 2. Navegue até "Project Settings" (ícone de engrenagem) -> "API".
// 3. Copie a "Project URL" e cole no lugar de 'COLOQUE_A_SUA_URL_DO_SUPABASE_AQUI' abaixo.
// 4. Copie a chave "anon" "public" (em Project API Keys) e cole no lugar de 'COLOQUE_A_SUA_CHAVE_ANON_PUBLICA_AQUI' abaixo.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// A seção de alerta/erro foi removida pois as credenciais foram configuradas.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);