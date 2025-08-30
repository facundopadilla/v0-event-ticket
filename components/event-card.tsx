"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Users, Zap, ExternalLink, CheckCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useNFTContract } from "@/hooks/use-nft-contract"
import { purchaseTicket } from "@/lib/actions/ticket-purchase"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  max_attendees: number
  creator_id: string
  nft_enabled: boolean
  nft_price: number | null
  nft_supply: number | null
  nft_minted_count: number
  profiles: {
    display_name: string | null
    alias: string
  } | null
}

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const { isConnected, address } = useWallet()
  const { mintTicket } = useNFTContract()
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handlePurchaseTicket = async () => {
    if (!isConnected || !address || !event.nft_enabled || !event.nft_price) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase tickets.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await mintTicket(event.id, event.nft_price.toString())

      if (result.success) {
        await purchaseTicket({
          eventId: event.id,
          buyerAddress: address,
          tokenId: result.tokenId,
          price: event.nft_price,
        })

        setIsPurchased(true)
        toast({
          title: "Ticket Purchased Successfully! 🎉",
          description: `Your NFT ticket for "${event.title}" has been minted to your wallet.`,
        })
      }
    } catch (error) {
      console.error("Error purchasing ticket:", error)
      toast({
        title: "Purchase Failed",
        description: "There was an error purchasing your ticket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const availableTickets = event.nft_supply ? event.nft_supply - event.nft_minted_count : 0
  const soldOut = event.nft_enabled && availableTickets <= 0

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
              {event.title}
            </h3>
            <p className="text-sm text-slate-400 mt-1">by {event.profiles?.display_name || event.profiles?.alias || "Unknown Creator"}</p>
          </div>
          {event.nft_enabled && (
            <Badge variant="secondary" className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white">
              <Zap className="h-3 w-3 mr-1" />
              NFT
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 text-sm text-slate-400">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-cyan-400" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-violet-400" />
            {event.location}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-slate-400" />
            Max {event.max_attendees} attendees
          </div>
        </div>

        {event.nft_enabled && (
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">NFT Ticket</span>
              <span className="text-lg font-bold text-cyan-400">{event.nft_price} ETH</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Available: {availableTickets}</span>
              <span>Minted: {event.nft_minted_count}</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 flex gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
        >
          <Link href={`/events/${event.id}`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </Button>

        {event.nft_enabled && (
          <Button
            onClick={handlePurchaseTicket}
            disabled={!isConnected || soldOut || isLoading || isPurchased}
            size="sm"
            className={`flex-1 ${
              isPurchased
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600"
            } text-white`}
          >
            {isPurchased ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Purchased
              </>
            ) : isLoading ? (
              "Processing..."
            ) : soldOut ? (
              "Sold Out"
            ) : !isConnected ? (
              "Connect Wallet"
            ) : (
              "Buy Ticket"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
