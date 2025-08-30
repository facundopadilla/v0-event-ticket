"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveWalletAddress(walletAddress: string) {
  const supabase = await createServerClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  // Update profile with wallet address
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ wallet_address: walletAddress })
    .eq("id", user.id)

  if (updateError) {
    throw new Error(`Failed to save wallet address: ${updateError.message}`)
  }

  // Revalidate the dashboard page to show updated data
  revalidatePath("/dashboard")

  return { success: true }
}

export async function removeWalletAddress() {
  const supabase = await createServerClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  // Remove wallet address from profile
  const { error: updateError } = await supabase.from("profiles").update({ wallet_address: null }).eq("id", user.id)

  if (updateError) {
    throw new Error(`Failed to remove wallet address: ${updateError.message}`)
  }

  // Revalidate the dashboard page to show updated data
  revalidatePath("/dashboard")

  return { success: true }
}
