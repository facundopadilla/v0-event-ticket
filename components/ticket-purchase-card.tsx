"use client"

import { useState, useEffect } from "react"
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
import { useCryptoPrices } from "@/hooks/use-crypto-prices"

interface TicketPurchaseCardProps {
  eventId: string
  eventTitle: string
  eventDate: string
  ticketPrice: number
  availableTickets: number
  maxTicketsPerWallet: number
}

// Function to convert UUID string to a numeric event ID
export function uuidToEventId(uuid: string): number {
  // Remove hyphens and take first 8 characters, then convert to number
  const hex = uuid.replace(/-/g, '').substring(0, 8)
  const numericId = parseInt(hex, 16)
  
  // Ensure it's a valid number
  if (isNaN(numericId)) {
    console.error('Failed to convert UUID to numeric ID:', uuid)
    // Fallback to a hash of the string
    let hash = 0
    for (let i = 0; i < uuid.length; i++) {
      const char = uuid.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
  
  return numericId
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
  // Ensure we have valid numbers to prevent NaN
  const safeAvailableTickets = typeof availableTickets === 'number' && !isNaN(availableTickets) ? availableTickets : 100
  const safeMaxTicketsPerWallet = typeof maxTicketsPerWallet === 'number' && !isNaN(maxTicketsPerWallet) ? maxTicketsPerWallet : 4
  const safeTicketPrice = typeof ticketPrice === 'number' && !isNaN(ticketPrice) ? ticketPrice : 0.01
  
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [priceData, setPriceData] = useState<{
    usd: string
    eth: string
    ethRaw: number
  } | null>(null)
  
  const { address, connectWallet, switchToLiskNetwork } = useWallet()
  const { mintTicket, getTicketsByOwnerForEvent } = useNFTContract()
  const { toast } = useToast()
  const { ethPrice, loading: priceLoading, convertUsdToDisplayPrices } = useCryptoPrices()

  // Load price data when component mounts or ticket price changes
  useEffect(() => {
    const loadPrices = async () => {
      if (safeTicketPrice > 0) {
        const prices = await convertUsdToDisplayPrices(safeTicketPrice)
        setPriceData(prices)
      } else {
        setPriceData(null)
      }
    }
    loadPrices()
  }, [safeTicketPrice, convertUsdToDisplayPrices])

  // Reset ticketQuantity if it becomes NaN (only once)
  useEffect(() => {
    if (isNaN(ticketQuantity)) {
      console.log('Resetting invalid ticket quantity:', ticketQuantity)
      setTicketQuantity(1)
    }
  }, [ticketQuantity])

  const totalPrice = safeTicketPrice * (isNaN(ticketQuantity) ? 1 : ticketQuantity)
  const totalPriceEth = priceData ? priceData.ethRaw * (isNaN(ticketQuantity) ? 1 : ticketQuantity) : 0

  const handlePurchase = async () => {
    if (!address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase tickets",
        variant: "destructive"
      })
      return
    }

    if (safeAvailableTickets <= 0) {
      toast({
        title: "No Tickets Available",
        description: "This event is sold out",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Convert UUID to numeric event ID
      const numericEventId = uuidToEventId(eventId)
      console.log('Converting eventId:', eventId, 'to numeric:', numericEventId)
      
      // Check current user ticket count
      const userTickets = await getTicketsByOwnerForEvent(address, numericEventId)
      const currentTickets = userTickets.length
      
      if (currentTickets + ticketQuantity > maxTicketsPerWallet) {
        toast({
          title: "Ticket Limit Exceeded",
          description: `You can only purchase up to ${maxTicketsPerWallet} tickets for this event`,
          variant: "destructive"
        })
        return
      }

      // Purchase tickets one by one (since mintTicket handles single tickets)
      for (let i = 0; i < ticketQuantity; i++) {
        const result = await mintTicket(
          numericEventId,
          address, 
          eventTitle, 
          `ipfs://ticket-metadata-${eventId}-${Date.now()}-${i}`
        )
        
        if (!result.success) {
          // Check if it's a network error and try to switch
          if (result.error?.includes("Please switch to Lisk Sepolia Testnet")) {
            toast({
              title: "Switching Network",
              description: "Please approve the network switch to Lisk Sepolia Testnet",
            })
            
            const switchResult = await switchToLiskNetwork(true)
            if (switchResult.success) {
              toast({
                title: "Network Switched",
                description: "Successfully switched to Lisk Sepolia Testnet. Please try purchasing again.",
              })
              setIsLoading(false)
              return
            } else {
              throw new Error(switchResult.error || "Failed to switch network")
            }
          }
          
          throw new Error(result.error || "Minting failed")
        }
      }

      toast({
        title: "Tickets Purchased! 🎫",
        description: `Successfully purchased ${ticketQuantity} ticket(s) for ${eventTitle}`,
      })
      
      // Reset quantity
      setTicketQuantity(1)
    } catch (error: any) {
      console.error("Error purchasing tickets:", error)
      
      // Special handling for network errors
      if (error.message?.includes("Please switch to Lisk Sepolia Testnet")) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Lisk Sepolia Testnet to purchase tickets",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Purchase Failed",
          description: error.message || "Failed to purchase tickets. Please try again.",
          variant: "destructive"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isEventPast = new Date(eventDate) < new Date()
  
  // Calculate the actual maximum we can purchase
  const effectiveMaxTickets = Math.min(safeMaxTicketsPerWallet, safeAvailableTickets)
  
  const isQuantityValid = ticketQuantity > 0 && ticketQuantity <= effectiveMaxTickets

  // Functions for incrementing/decrementing with explicit bounds checking
  const incrementTickets = () => {
    const newQuantity = ticketQuantity + 1
    if (newQuantity <= effectiveMaxTickets) {
      setTicketQuantity(newQuantity)
    }
  }

  const decrementTickets = () => {
    const newQuantity = ticketQuantity - 1
    if (newQuantity >= 1) {
      setTicketQuantity(newQuantity)
    }
  }

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
        ) : safeAvailableTickets <= 0 ? (
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
                <div className="text-right">
                  {safeTicketPrice === 0 ? (
                    <span className="font-medium text-green-600">Free</span>
                  ) : priceData ? (
                    <div className="space-y-1">
                      <div className="font-medium text-lg">${priceData.usd} USD</div>
                      <div className="text-sm text-gray-500">{priceData.eth} ETH</div>
                    </div>
                  ) : priceLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading prices...</span>
                    </div>
                  ) : (
                    <span className="font-medium">${safeTicketPrice} USD</span>
                  )}
                </div>
              </div>
              
              {/* ETH Price Display */}
              {ethPrice && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Current ETH Price</span>
                  <span>${ethPrice.toLocaleString()} USD</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <Badge variant="secondary">{safeAvailableTickets} tickets</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Max per wallet</span>
                <span className="text-sm">{safeMaxTicketsPerWallet} tickets</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decrementTickets}
                  disabled={ticketQuantity <= 1}
                >
                  -
                </Button>
                <span className="px-4 py-2 border rounded-md text-center min-w-[3rem]">
                  {isNaN(ticketQuantity) ? 1 : ticketQuantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={incrementTickets}
                  disabled={ticketQuantity >= effectiveMaxTickets}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Total Price */}
            {safeTicketPrice > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Quantity × Price</span>
                  <span>{ticketQuantity} × {safeTicketPrice === 0 ? 'Free' : '$' + (priceData?.usd || safeTicketPrice) + ' USD'}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <div className="text-right">
                      {totalPrice === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : priceData ? (
                        <div className="space-y-1">
                          <div className="text-lg font-semibold">${(Number(priceData.usd) * ticketQuantity).toFixed(2)} USD</div>
                          <div className="text-sm text-gray-500">{(Number(priceData.eth) * ticketQuantity).toFixed(6)} ETH</div>
                        </div>
                      ) : (
                        <span className="text-lg font-semibold">${(safeTicketPrice * ticketQuantity).toFixed(2)} USD</span>
                      )}
                    </div>
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
              <div className="space-y-2">
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
                      {safeTicketPrice === 0 ? 'Get Free Tickets' : `Purchase for ${totalPrice} ETH`}
                    </>
                  )}
                </Button>
                
                {/* Network Switch Button */}
                <Button 
                  className="w-full" 
                  onClick={async () => {
                    const result = await switchToLiskNetwork(true)
                    if (result.success) {
                      toast({
                        title: "Network Switched",
                        description: "Successfully switched to Lisk Sepolia Testnet",
                      })
                    } else {
                      toast({
                        title: "Network Switch Failed",
                        description: result.error || "Failed to switch network",
                        variant: "destructive"
                      })
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Switch to Lisk Testnet
                </Button>
              </div>
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
