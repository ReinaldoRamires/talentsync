// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Para Server Components, set e remove são passados para o cliente Supabase.
        // A escrita real de cookies de resposta não acontece diretamente aqui,
        // mas é geralmente tratada por Middleware ou Server Actions.
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Esta chamada pode falhar em um Server Component puro se cookieStore for Readonly,
            // o try/catch é para o Supabase client poder chamar sem quebrar a aplicação.
            // A persistência real ocorreria via middleware/server actions.
            // cookieStore.set({ name, value, ...options }); // Mantenha comentado ou remova se causar erro de tipo
          } catch (error) {
            // console.warn(`(Server Component Context) Tentativa de setar cookie '${name}' falhou ou foi ignorada:`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Similar ao set
            // cookieStore.set({ name, value: '', ...options }); // Mantenha comentado ou remova se causar erro de tipo
          } catch (error) {
            // console.warn(`(Server Component Context) Tentativa de remover cookie '${name}' falhou ou foi ignorada:`, error);
          }
        },
      },
    }
  );
}