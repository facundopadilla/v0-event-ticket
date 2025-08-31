"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Ticket, Send, DollarSign, ExternalLink, QrCode } from "lucide-react"
import { useState } from "react"
import { TransferTicketDialog } from "./transfer-ticket-dialog"
import { ListTicketDialog } from "./list-ticket-dialog"
import { QRCodeDialog } from "./qr-code-dialog"

interface MyTicketsGridProps {
  tickets: Array<{
    tokenId: string;
    eventId: string;
    isUsed: boolean;
    mintedAt: string;
    eventTitle: string;
  }>;
}

export function MyTicketsGrid({ tickets }: MyTicketsGridProps) {
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [listDialogOpen, setListDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)

  const handleTransfer = (ticket: any) => {
    setSelectedTicket(ticket)
    setTransferDialogOpen(true)
  }

  const handleList = (ticket: any) => {
    setSelectedTicket(ticket)
    setListDialogOpen(true)
  }

  const handleShowQR = (ticket: any) => {
    setSelectedTicket(ticket)
    setQrDialogOpen(true)
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-300 mb-2">No tickets yet</h3>
        <p className="text-slate-400 mb-6">Purchase tickets from events or the marketplace to get started.</p>
        <div className="flex gap-4 justify-center">
          <Button
            asChild
            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
          >
            <a href="/marketplace">Browse Marketplace</a>
          </Button>
          <Button asChild variant="outline" className="border-slate-600 text-slate-300 hover:text-white bg-transparent">
            <a href="/dashboard">View Events</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => {
          const mintedDate = new Date(Number(ticket.mintedAt) * 1000)
          const isUsed = ticket.isUsed

          return (
            <Card key={ticket.tokenId} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-slate-100 text-lg line-clamp-2">
                      {ticket.eventTitle}
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">Token #{ticket.tokenId}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant="default"
                      className="bg-violet-600"
                    >
                      NFT Ticket
                    </Badge>
                    {isUsed && (
                      <Badge variant="secondary" className="bg-red-600">
                        Used
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Ticket className="w-4 h-4" />
                    <span>Event ID: {ticket.eventId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Minted: {mintedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-3">
                  {/* QR Code Button - Prominent */}
                  <Button
                    onClick={() => handleShowQR(ticket)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Show Entry QR Code
                  </Button>
                  
                  {/* Transfer & Sell Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleTransfer(ticket)}
                      disabled={isUsed}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-600 text-slate-300 hover:text-white bg-transparent"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Transfer
                    </Button>
                    <Button
                      onClick={() => handleList(ticket)}
                      disabled={isUsed}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Sell
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Owned since {mintedDate.toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-slate-500 hover:text-slate-300">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Transfer Dialog */}
      {selectedTicket && (
        <TransferTicketDialog
          ticket={selectedTicket}
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          currentUserId=""
        />
      )}

      {/* QR Code Dialog */}
      {selectedTicket && (
        <QRCodeDialog
          ticket={selectedTicket}
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
        />
      )}

      {/* List Dialog */}
      {selectedTicket && (
        <ListTicketDialog
          ticket={selectedTicket}
          open={listDialogOpen}
          onOpenChange={setListDialogOpen}
          currentUserId=""
        />
      )}
    </>
  )
}
