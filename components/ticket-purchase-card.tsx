"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Ticket, Wallet, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useNFTContract } from "@/hooks/use-nft-contract"
import { purchaseTicket } from "@/lib/actions/ticket-purchase"

interface TicketPurchaseCardProps {
  event: {
    id: string
    title: string
    description: string
    date: string
    location: string
    max_attendees: number
    creator_id: string
  }
  currentUser: {
    id: string
  }
  isOwner: boolean
}

export function TicketPurchaseCard({ event, currentUser, isOwner }: TicketPurchaseCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const { account, isConnected, connectWallet } = useWallet()
  const { mintTicket, isContractReady } = useNFTContract()

  const ticketPrice = 0.01 // ETH per ticket
  const totalPrice = ticketPrice * quantity

  const handlePurchase = async () => {
    if (!isConnected || !account) {
      await connectWallet()
      return
    }

    if (!isContractReady) {
      setErrorMessage("Smart contract not ready. Please try again.")
      setPurchaseStatus("error")
      return
    }

    setIsLoading(true)
    setPurchaseStatus("idle")
    setErrorMessage("")

    try {
      // Create metadata for the NFT
      const metadata = {
        name: `${event.title} - Ticket`,
        description: `Event ticket for ${event.title}. ${event.description}`,
        image: `https://via.placeholder.com/400x600/6366f1/ffffff?text=${encodeURIComponent(event.title)}`,
        attributes: [
          { trait_type: "Event", value: event.title },
          { trait_type: "Date", value: new Date(event.date).toLocaleDateString() },
          { trait_type: "Location", value: event.location },
          { trait_type: "Event ID", value: event.id },
        ],
        eventId: event.id,
      }

      // Upload metadata to IPFS (simplified - in production use proper IPFS service)
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`

      // Mint NFT tickets
      const mintedTokens = []
      for (let i = 0; i < quantity; i++) {
        const tokenId = await mintTicket(account, event.id, metadataURI)
        if (tokenId) {
          mintedTokens.push(tokenId)
        }
      }

      if (mintedTokens.length === 0) {
        throw new Error("Failed to mint any tickets")
      }

      // Save purchase to database
      await purchaseTicket({
        eventId: event.id,
        buyerWalletAddress: account,
        buyerUserId: currentUser.id,
        quantity,
        pricePerTicket: ticketPrice,
        totalPrice,
        tokenIds: mintedTokens,
        contractAddress: "0x0000000000000000000000000000000000000000", // Replace with actual contract address
      })

      setPurchaseStatus("success")
    } catch (error) {
      console.error("Purchase failed:", error)
      setErrorMessage(error instanceof Error ? error.message : "Purchase failed")
      setPurchaseStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  if (isOwner) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Event Owner
          </CardTitle>
          <CardDescription className="text-slate-400">You are the owner of this event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge className="bg-violet-600 hover:bg-violet-700">Owner Access</Badge>
            <p className="text-slate-400 mt-2 text-sm">As the event owner, you have full access to this event.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Purchase NFT Tickets
        </CardTitle>
        <CardDescription className="text-slate-400">Buy NFT tickets for this event</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {purchaseStatus === "success" && (
          <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">Tickets purchased successfully!</span>
          </div>
        )}

        {purchaseStatus === "error" && (
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{errorMessage}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-slate-200">
            Number of Tickets
          </Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max="10"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(10, Number.parseInt(e.target.value) || 1)))}
            className="bg-slate-800 border-slate-700 text-slate-100"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Price per ticket:</span>
            <span className="text-slate-200">{ticketPrice} ETH</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-slate-200">Total:</span>
            <span className="text-slate-100">{totalPrice.toFixed(4)} ETH</span>
          </div>
        </div>

        {!isConnected ? (
          <Button
            onClick={connectWallet}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet to Purchase
          </Button>
        ) : (
          <Button
            onClick={handlePurchase}
            disabled={isLoading || !isContractReady}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Purchasing...
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4 mr-2" />
                Purchase {quantity} Ticket{quantity > 1 ? "s" : ""}
              </>
            )}
          </Button>
        )}

        <div className="text-xs text-slate-500 space-y-1">
          <p>• NFT tickets are stored on the blockchain</p>
          <p>• You can resell tickets on the marketplace</p>
          <p>• Tickets are required for event entry</p>
        </div>
      </CardContent>
    </Card>
  )
}
