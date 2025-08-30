"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { createMarketplaceListing } from "@/lib/actions/marketplace"

interface ListTicketDialogProps {
  ticket: any
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
}

export function ListTicketDialog({ ticket, open, onOpenChange, currentUserId }: ListTicketDialogProps) {
  const [price, setPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const { account, isConnected } = useWallet()

  const handleList = async () => {
    if (!ticket || !account || !price) return

    const priceEth = Number.parseFloat(price)
    if (isNaN(priceEth) || priceEth <= 0) {
      setErrorMessage("Please enter a valid price")
      setStatus("error")
      return
    }

    setIsLoading(true)
    setStatus("idle")
    setErrorMessage("")

    try {
      await createMarketplaceListing({
        nftTicketId: ticket.id,
        sellerWalletAddress: account,
        sellerUserId: currentUserId,
        priceEth,
      })

      setStatus("success")
      setTimeout(() => {
        onOpenChange(false)
        window.location.reload() // Refresh to show updated listings
      }, 2000)
    } catch (error) {
      console.error("Listing failed:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to create listing")
      setStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setPrice("")
      setStatus("idle")
      setErrorMessage("")
      onOpenChange(false)
    }
  }

  if (!ticket) return null

  const estimatedUSD = price ? (Number.parseFloat(price) * 2000).toFixed(0) : "0"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            List Ticket for Sale
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            List your ticket on the marketplace for other users to purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ticket Info */}
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <h4 className="font-medium text-slate-200 mb-1">{ticket.events?.title || "Unknown Event"}</h4>
            <p className="text-sm text-slate-400">Token #{ticket.token_id}</p>
            {ticket.events?.date && (
              <p className="text-sm text-slate-400">
                {new Date(ticket.events.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <Alert className="border-green-800 bg-green-900/20">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <AlertDescription className="text-green-400">
                Ticket listed successfully! It will appear on the marketplace shortly.
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="border-red-800 bg-red-900/20">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <AlertDescription className="text-red-400">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-slate-200">
              Listing Price (ETH)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              placeholder="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-100"
              disabled={isLoading || status === "success"}
            />
            {price && <p className="text-xs text-slate-500">≈ ${estimatedUSD} USD (estimated)</p>}
          </div>

          {/* Marketplace Fee Info */}
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <p className="text-sm text-slate-400">
              <strong className="text-slate-300">Marketplace Fee:</strong> 2.5% of sale price
            </p>
            <p className="text-sm text-slate-400">
              <strong className="text-slate-300">You'll receive:</strong>{" "}
              {price ? (Number.parseFloat(price) * 0.975).toFixed(4) : "0"} ETH
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:text-white bg-transparent"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleList}
              disabled={!isConnected || !price || isLoading || status === "success"}
              className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Listing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  List for Sale
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
