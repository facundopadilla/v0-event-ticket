"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Ticket, 
  Wallet,
  ShoppingCart,
  Loader2,
  CheckCircle,
  AlertCircle,
  DollarSign
} from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useNFTContract } from "@/hooks/use-nft-contract"
import { useToast } from "@/hooks/use-toast"

interface TicketPurchaseCardProps {
  eventId: string
  eventTitle: string
  eventDate: string
  ticketPrice: number
  availableTickets: number
  maxTicketsPerWallet: number
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function TicketPurchaseCard({
  eventId,
  eventTitle,
  eventDate,
  ticketPrice,
  availableTickets,
  maxTicketsPerWallet
}: TicketPurchaseCardProps) {
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const { address, connectWallet } = useWallet()
  const { purchaseTicket, getUserTicketCount } = useNFTContract()
  const { toast } = useToast()

  const totalPrice = ticketPrice * ticketQuantity

  const handlePurchase = async () => {
    if (!address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase tickets",
        variant: "destructive"
      })
      return
    }

    if (availableTickets <= 0) {
      toast({
        title: "No Tickets Available",
        description: "This event is sold out",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Check current user ticket count
      const currentTickets = await getUserTicketCount(eventId, address)
      
      if (currentTickets + ticketQuantity > maxTicketsPerWallet) {
        toast({
          title: "Ticket Limit Exceeded",
          description: `You can only purchase up to ${maxTicketsPerWallet} tickets for this event`,
          variant: "destructive"
        })
        return
      }

      // Purchase tickets
      const result = await purchaseTicket(eventId, ticketQuantity, address)
      
      if (result.success) {
        toast({
          title: "Tickets Purchased! 🎫",
          description: `Successfully purchased ${ticketQuantity} ticket(s) for ${eventTitle}`,
        })
        
        // Reset quantity
        setTicketQuantity(1)
      } else {
        throw new Error(result.error || "Purchase failed")
      }
    } catch (error: any) {
      console.error("Error purchasing tickets:", error)
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase tickets. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isEventPast = new Date(eventDate) < new Date()
  const isQuantityValid = ticketQuantity > 0 && ticketQuantity <= Math.min(availableTickets, maxTicketsPerWallet)

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl sticky top-8">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Ticket className="w-5 h-5" />
          <span>Purchase Tickets</span>
        </CardTitle>
        <CardDescription>
          {isEventPast ? "Event has ended" : `For ${formatDate(eventDate)}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEventPast ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This event has already taken place. Tickets are no longer available.
            </AlertDescription>
          </Alert>
        ) : availableTickets <= 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This event is sold out. No tickets are currently available.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Ticket Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price per ticket</span>
                <span className="font-medium">
                  {ticketPrice === 0 ? 'Free' : `${ticketPrice} ETH`}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <Badge variant="secondary">{availableTickets} tickets</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Max per wallet</span>
                <span className="text-sm">{maxTicketsPerWallet} tickets</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  disabled={ticketQuantity <= 1}
                >
                  -
                </Button>
                <span className="px-4 py-2 border rounded-md text-center min-w-[3rem]">
                  {ticketQuantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTicketQuantity(Math.min(maxTicketsPerWallet, availableTickets, ticketQuantity + 1))}
                  disabled={ticketQuantity >= Math.min(maxTicketsPerWallet, availableTickets)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Total Price */}
            {ticketPrice > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-lg font-bold">{totalPrice} ETH</span>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Button */}
            {!address ? (
              <Button 
                className="w-full" 
                onClick={connectWallet}
                size="lg"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet to Purchase
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={handlePurchase}
                disabled={isLoading || !isQuantityValid}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {ticketPrice === 0 ? 'Get Free Tickets' : `Purchase for ${totalPrice} ETH`}
                  </>
                )}
              </Button>
            )}

            {/* Wallet Info */}
            {address && (
              <div className="text-xs text-gray-500 text-center">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
