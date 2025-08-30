"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface TransferTicketData {
  ticketId: string
  fromWalletAddress: string
  toWalletAddress: string
  fromUserId: string
  toUserId?: string
}

export async function transferTicket(data: TransferTicketData) {
  const supabase = await createServerClient()

  try {
    // Check if recipient has an account (optional)
    let toUserId = data.toUserId
    if (!toUserId) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("wallet_address", data.toWalletAddress)
        .single()

      toUserId = profiles?.id || null
    }

    // Update ticket ownership
    const { error: ticketError } = await supabase
      .from("nft_tickets")
      .update({
        owner_wallet_address: data.toWalletAddress,
        owner_user_id: toUserId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.ticketId)
      .eq("owner_wallet_address", data.fromWalletAddress) // Ensure current owner is transferring

    if (ticketError) {
      throw new Error(`Failed to transfer ticket: ${ticketError.message}`)
    }

    // Create transaction record
    const { error: txError } = await supabase.from("nft_transactions").insert({
      nft_ticket_id: data.ticketId,
      transaction_hash: `transfer_${Date.now()}_${data.ticketId}`,
      transaction_type: "transfer",
      from_wallet_address: data.fromWalletAddress,
      to_wallet_address: data.toWalletAddress,
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })

    if (txError) {
      console.error("Failed to create transaction record:", txError)
      // Don't throw here as the main transfer was successful
    }

    // Revalidate relevant pages
    revalidatePath("/my-tickets")
    revalidatePath("/marketplace")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Transfer ticket error:", error)
    throw error
  }
}
