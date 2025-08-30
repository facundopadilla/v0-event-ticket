"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface PurchaseMarketplaceListingData {
  listingId: string
  buyerWalletAddress: string
  buyerUserId: string
  priceEth: number
}

export async function purchaseMarketplaceListing(data: PurchaseMarketplaceListingData) {
  const supabase = await createServerClient()

  try {
    // Get the listing details
    const { data: listing, error: listingError } = await supabase
      .from("marketplace_listings")
      .select(`
        *,
        nft_tickets (*)
      `)
      .eq("id", data.listingId)
      .eq("is_active", true)
      .single()

    if (listingError || !listing) {
      throw new Error("Listing not found or no longer active")
    }

    // Update NFT ticket ownership
    const { error: ticketError } = await supabase
      .from("nft_tickets")
      .update({
        owner_wallet_address: data.buyerWalletAddress,
        owner_user_id: data.buyerUserId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listing.nft_ticket_id)

    if (ticketError) {
      throw new Error(`Failed to transfer ticket: ${ticketError.message}`)
    }

    // Mark listing as inactive
    const { error: listingUpdateError } = await supabase
      .from("marketplace_listings")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.listingId)

    if (listingUpdateError) {
      throw new Error(`Failed to update listing: ${listingUpdateError.message}`)
    }

    // Create transaction record
    const { error: txError } = await supabase.from("nft_transactions").insert({
      nft_ticket_id: listing.nft_ticket_id,
      transaction_hash: `marketplace_${Date.now()}_${data.listingId}`,
      transaction_type: "sale",
      from_wallet_address: listing.seller_wallet_address,
      to_wallet_address: data.buyerWalletAddress,
      price_wei: (data.priceEth * 1e18).toString(),
      price_eth: data.priceEth,
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })

    if (txError) {
      console.error("Failed to create transaction record:", txError)
      // Don't throw here as the main purchase was successful
    }

    // Revalidate relevant pages
    revalidatePath("/marketplace")
    revalidatePath("/my-tickets")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Marketplace purchase error:", error)
    throw error
  }
}

export async function createMarketplaceListing(data: {
  nftTicketId: string
  sellerWalletAddress: string
  sellerUserId: string
  priceEth: number
  expiresAt?: string
}) {
  const supabase = await createServerClient()

  try {
    const { error } = await supabase.from("marketplace_listings").insert({
      nft_ticket_id: data.nftTicketId,
      seller_wallet_address: data.sellerWalletAddress,
      seller_user_id: data.sellerUserId,
      price_wei: (data.priceEth * 1e18).toString(),
      price_eth: data.priceEth,
      currency: "ETH",
      is_active: true,
      expires_at: data.expiresAt,
    })

    if (error) {
      throw new Error(`Failed to create listing: ${error.message}`)
    }

    revalidatePath("/marketplace")
    revalidatePath("/my-tickets")

    return { success: true }
  } catch (error) {
    console.error("Create listing error:", error)
    throw error
  }
}
