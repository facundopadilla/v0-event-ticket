import { createBrowserClient } from "@supabase/ssr"

// ✅ NUEVO ESTÁNDAR: Nombre explícito y claro
export function createBrowserSupabaseClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// 🔄 COMPATIBILIDAD: Mantener funciones existentes durante migración
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export { createClient as createBrowserClient }
