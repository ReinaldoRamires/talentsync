// src/lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr'; // Esta é a ÚNICA importação que este arquivo deve ter

export function createClient() {
  // Cria um cliente Supabase no navegador com as credenciais do projeto
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}