"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface PurchaseTicketData {
  eventId: string
  buyerWalletAddress: string
  buyerUserId: string
  quantity: number
  pricePerTicket: number
  totalPrice: number
  tokenIds: string[]
  contractAddress: string
}

export async function purchaseTicket(data: PurchaseTicketData) {
  const supabase = await createServerClient()

  try {
    // Insert NFT tickets into database
    const nftTickets = data.tokenIds.map((tokenId) => ({
      event_id: data.eventId,
      token_id: Number.parseInt(tokenId),
      contract_address: data.contractAddress,
      owner_wallet_address: data.buyerWalletAddress,
      owner_user_id: data.buyerUserId,
      metadata_uri: `data:application/json;base64,${btoa(
        JSON.stringify({
          name: `Event Ticket #${tokenId}`,
          description: "NFT Event Ticket",
          eventId: data.eventId,
        }),
      )}`,
      is_used: false,
      minted_at: new Date().toISOString(),
    }))

    const { error: nftError } = await supabase.from("nft_tickets").insert(nftTickets)

    if (nftError) {
      throw new Error(`Failed to save NFT tickets: ${nftError.message}`)
    }

    // Create transaction records
    const transactions = data.tokenIds.map((tokenId) => ({
      nft_ticket_id: null, // Will be updated after we get the NFT ticket IDs
      transaction_hash: `mock_${Date.now()}_${tokenId}`, // In production, use actual transaction hash
      transaction_type: "mint" as const,
      from_wallet_address: null,
      to_wallet_address: data.buyerWalletAddress,
      price_wei: (data.pricePerTicket * 1e18).toString(),
      price_eth: data.pricePerTicket,
      status: "confirmed" as const,
      confirmed_at: new Date().toISOString(),
    }))

    // Get the inserted NFT ticket IDs to link with transactions
    const { data: insertedTickets, error: fetchError } = await supabase
      .from("nft_tickets")
      .select("id, token_id")
      .eq("owner_wallet_address", data.buyerWalletAddress)
      .eq("event_id", data.eventId)
      .in(
        "token_id",
        data.tokenIds.map((id) => Number.parseInt(id)),
      )

    if (fetchError || !insertedTickets) {
      throw new Error("Failed to fetch inserted tickets")
    }

    // Update transactions with correct NFT ticket IDs
    const transactionsWithTicketIds = transactions.map((tx, index) => ({
      ...tx,
      nft_ticket_id: insertedTickets[index]?.id,
    }))

    const { error: txError } = await supabase.from("nft_transactions").insert(transactionsWithTicketIds)

    if (txError) {
      console.error("Failed to save transactions:", txError)
      // Don't throw here as the main purchase was successful
    }

    // Revalidate relevant pages
    revalidatePath(`/events/${data.eventId}`)
    revalidatePath("/dashboard")
    revalidatePath("/marketplace")

    return { success: true, tokenIds: data.tokenIds }
  } catch (error) {
    console.error("Purchase ticket error:", error)
    throw error
  }
}

export async function getUserTickets(userId: string) {
  const supabase = await createServerClient()

  const { data: tickets, error } = await supabase
    .from("nft_tickets")
    .select(`
      *,
      events (
        id,
        title,
        description,
        date,
        location
      )
    `)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch user tickets: ${error.message}`)
  }

  return tickets || []
}

export async function getEventTickets(eventId: string) {
  const supabase = await createServerClient()

  const { data: tickets, error } = await supabase
    .from("nft_tickets")
    .select("*")
    .eq("event_id", eventId)
    .order("token_id", { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch event tickets: ${error.message}`)
  }

  return tickets || []
}
