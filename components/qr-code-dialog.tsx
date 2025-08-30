"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, Download, Copy } from "lucide-react"
import { useState } from "react"

interface QRCodeDialogProps {
  ticket: {
    tokenId: string;
    eventId: string;
    eventTitle: string;
    isUsed: boolean;
    mintedAt: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeDialog({ ticket, open, onOpenChange }: QRCodeDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!ticket) return null;

  // Generate mock QR data - in production this would be a verified ticket identifier
  const qrData = {
    eventId: ticket.eventId,
    tokenId: ticket.tokenId,
    eventTitle: ticket.eventTitle,
    timestamp: Date.now(),
    // This would normally be a cryptographic signature to prevent forgery
    signature: `verify_${ticket.tokenId}_${ticket.eventId}`
  };

  const qrString = JSON.stringify(qrData);

  // Mock QR Code SVG - in production you'd use a real QR library like 'qrcode'
  const mockQRCode = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="10" y="10" width="20" height="20" fill="black"/>
      <rect x="40" y="10" width="20" height="20" fill="black"/>
      <rect x="70" y="10" width="20" height="20" fill="black"/>
      <rect x="130" y="10" width="20" height="20" fill="black"/>
      <rect x="160" y="10" width="20" height="20" fill="black"/>
      <rect x="10" y="40" width="20" height="20" fill="black"/>
      <rect x="70" y="40" width="20" height="20" fill="black"/>
      <rect x="100" y="40" width="20" height="20" fill="black"/>
      <rect x="160" y="40" width="20" height="20" fill="black"/>
      <rect x="40" y="70" width="20" height="20" fill="black"/>
      <rect x="70" y="70" width="20" height="20" fill="black"/>
      <rect x="130" y="70" width="20" height="20" fill="black"/>
      <rect x="10" y="100" width="20" height="20" fill="black"/>
      <rect x="40" y="100" width="20" height="20" fill="black"/>
      <rect x="100" y="100" width="20" height="20" fill="black"/>
      <rect x="160" y="100" width="20" height="20" fill="black"/>
      <rect x="10" y="130" width="20" height="20" fill="black"/>
      <rect x="70" y="130" width="20" height="20" fill="black"/>
      <rect x="130" y="130" width="20" height="20" fill="black"/>
      <rect x="160" y="130" width="20" height="20" fill="black"/>
      <rect x="40" y="160" width="20" height="20" fill="black"/>
      <rect x="70" y="160" width="20" height="20" fill="black"/>
      <rect x="100" y="160" width="20" height="20" fill="black"/>
      <rect x="130" y="160" width="20" height="20" fill="black"/>
      <text x="100" y="195" text-anchor="middle" font-size="8" fill="black">Token #${ticket.tokenId}</text>
    </svg>
  `;

  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(qrString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([mockQRCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.tokenId}-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Event Entry QR Code
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Scan this QR code at the event entrance for verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-medium text-slate-200 mb-2">{ticket.eventTitle}</h4>
            <div className="text-sm text-slate-400 space-y-1">
              <p>Token ID: #{ticket.tokenId}</p>
              <p>Event ID: {ticket.eventId}</p>
              <p>Status: {ticket.isUsed ? 'Used' : 'Valid'}</p>
              <p>Minted: {new Date(Number(ticket.mintedAt) * 1000).toLocaleDateString()}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: mockQRCode }} />
            </div>
          </div>

          {/* Warning for used tickets */}
          {ticket.isUsed && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
              <p className="text-red-400 text-sm">
                ⚠️ This ticket has already been used and may not be valid for entry.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleCopyData}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:text-white bg-transparent"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Data'}
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-slate-500 space-y-2">
            <p>• Present this QR code at the event entrance</p>
            <p>• Event staff will scan to verify your ticket</p>
            <p>• Keep your wallet connected for additional verification</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
