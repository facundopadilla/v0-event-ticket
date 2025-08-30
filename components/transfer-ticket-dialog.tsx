"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useNFTContract } from "@/hooks/use-nft-contract"
import { transferTicket } from "@/lib/actions/ticket-transfer"

interface TransferTicketDialogProps {
  ticket: any
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
}

export function TransferTicketDialog({ ticket, open, onOpenChange, currentUserId }: TransferTicketDialogProps) {
  const [recipientAddress, setRecipientAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const { account, isConnected } = useWallet()
  const { transferTicket: contractTransfer, isContractReady } = useNFTContract()

  const handleTransfer = async () => {
    if (!ticket || !account || !recipientAddress) return

    setIsLoading(true)
    setStatus("idle")
    setErrorMessage("")

    try {
      // Validate recipient address
      if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
        throw new Error("Invalid recipient address")
      }

      if (recipientAddress.toLowerCase() === account.toLowerCase()) {
        throw new Error("Cannot transfer to yourself")
      }

      // Transfer on blockchain
      const success = await contractTransfer(account, recipientAddress, ticket.token_id.toString())
      if (!success) {
        throw new Error("Blockchain transfer failed")
      }

      // Update database
      await transferTicket({
        ticketId: ticket.id,
        fromWalletAddress: account,
        toWalletAddress: recipientAddress,
        fromUserId: currentUserId,
      })

      setStatus("success")
      setTimeout(() => {
        onOpenChange(false)
        window.location.reload() // Refresh to show updated ownership
      }, 2000)
    } catch (error) {
      console.error("Transfer failed:", error)
      setErrorMessage(error instanceof Error ? error.message : "Transfer failed")
      setStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setRecipientAddress("")
      setStatus("idle")
      setErrorMessage("")
      onOpenChange(false)
    }
  }

  if (!ticket) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Transfer NFT Ticket
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Transfer your ticket to another wallet address. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ticket Info */}
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <h4 className="font-medium text-slate-200 mb-1">{ticket.events?.title || "Unknown Event"}</h4>
            <p className="text-sm text-slate-400">Token #{ticket.token_id}</p>
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <Alert className="border-green-800 bg-green-900/20">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <AlertDescription className="text-green-400">
                Ticket transferred successfully! The page will refresh shortly.
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="border-red-800 bg-red-900/20">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <AlertDescription className="text-red-400">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Recipient Address Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-slate-200">
              Recipient Wallet Address
            </Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-100"
              disabled={isLoading || status === "success"}
            />
            <p className="text-xs text-slate-500">Enter the Ethereum wallet address of the recipient</p>
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
              onClick={handleTransfer}
              disabled={!isConnected || !isContractReady || !recipientAddress || isLoading || status === "success"}
              className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Transfer Ticket
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
