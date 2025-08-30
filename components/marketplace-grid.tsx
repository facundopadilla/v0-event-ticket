"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Ticket, Wallet, ExternalLink } from "lucide-react"
import { useState } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { purchaseMarketplaceListing } from "@/lib/actions/marketplace"

interface MarketplaceGridProps {
  listings: any[]
  currentUserId: string
}

export function MarketplaceGrid({ listings, currentUserId }: MarketplaceGridProps) {
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  const { account, isConnected, connectWallet } = useWallet()

  const handlePurchase = async (listingId: string, price: number) => {
    if (!isConnected || !account) {
      await connectWallet()
      return
    }

    setPurchasingId(listingId)
    try {
      await purchaseMarketplaceListing({
        listingId,
        buyerWalletAddress: account,
        buyerUserId: currentUserId,
        priceEth: price,
      })
      // Refresh page or update state
      window.location.reload()
    } catch (error) {
      console.error("Purchase failed:", error)
    } finally {
      setPurchasingId(null)
    }
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-300 mb-2">No listings available</h3>
        <p className="text-slate-400 mb-6">Be the first to list a ticket for sale!</p>
        <Button
          asChild
          className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
        >
          <a href="/my-tickets">View My Tickets</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => {
        const event = listing.nft_tickets?.events
        const ticket = listing.nft_tickets
        const eventDate = event ? new Date(event.date) : null
        const isUpcoming = eventDate ? eventDate > new Date() : false
        const isOwnListing = listing.seller_user_id === currentUserId

        return (
          <Card key={listing.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-slate-100 text-lg line-clamp-2">
                    {event?.title || "Unknown Event"}
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-1">Token #{ticket?.token_id}</CardDescription>
                </div>
                <Badge
                  variant={isUpcoming ? "default" : "secondary"}
                  className={isUpcoming ? "bg-violet-600" : "bg-slate-600"}
                >
                  {isUpcoming ? "Upcoming" : "Past"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {event && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {eventDate?.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm">Price</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-100">{listing.price_eth} ETH</p>
                    <p className="text-xs text-slate-500">≈ ${(listing.price_eth * 2000).toFixed(0)} USD</p>
                  </div>
                </div>

                {isOwnListing ? (
                  <Button disabled className="w-full bg-slate-700 text-slate-400 cursor-not-allowed">
                    Your Listing
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePurchase(listing.id, listing.price_eth)}
                    disabled={purchasingId === listing.id}
                    className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
                  >
                    {purchasingId === listing.id ? (
                      "Purchasing..."
                    ) : !isConnected ? (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Listed {new Date(listing.created_at).toLocaleDateString()}</span>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-slate-500 hover:text-slate-300">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
