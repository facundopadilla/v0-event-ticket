import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function GET() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function POST() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect("/")
}
