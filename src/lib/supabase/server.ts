// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// A função é async porque 'cookies()' está sendo tratada como se retornasse uma Promise
// conforme os erros de runtime e de tipo que você encontrou.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // Usando await aqui

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // No contexto de Server Components puros, 'set' e 'remove'
        // são mais para satisfazer a interface do createServerClient.
        // A manipulação real de cookies (escrita) geralmente ocorre
        // em Server Actions, Route Handlers ou via Middleware.
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Se cookieStore for ReadonlyRequestCookies, .set() não existe.
            // Esta é uma tentativa que o cliente Supabase pode fazer; o try/catch previne quebrar.
            // cookieStore.set({ name, value, ...options }); // Mantenha comentado por enquanto
          } catch (error) {
            // console.warn(`(Server Component Context) Tentativa de setar cookie '${name}' foi ignorada ou falhou.`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Similar ao set.
            // cookieStore.set({ name, value: '', ...options }); // Mantenha comentado
          } catch (error) {
            // console.warn(`(Server Component Context) Tentativa de remover cookie '${name}' foi ignorada ou falhou.`, error);
          }
        },
      },
    }
  );
}