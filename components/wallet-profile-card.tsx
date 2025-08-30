"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Copy, ExternalLink, CheckCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useState } from "react"

interface WalletProfileCardProps {
  onSaveWallet?: (address: string) => Promise<void>
  savedWalletAddress?: string | null
}

export function WalletProfileCard({ onSaveWallet, savedWalletAddress }: WalletProfileCardProps) {
  const { address, isConnected, chainId, formatAddress } = useWallet()
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleSaveWallet = async () => {
    if (!address || !onSaveWallet) return

    setIsSaving(true)
    try {
      await onSaveWallet(address)
    } catch (error) {
      console.error("Failed to save wallet:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getChainName = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet"
      case 11155111:
        return "Sepolia Testnet"
      case 137:
        return "Polygon"
      case 80001:
        return "Mumbai Testnet"
      default:
        return `Chain ID: ${chainId}`
    }
  }

  const getEtherscanUrl = (address: string, chainId: number | null) => {
    const baseUrl = chainId === 11155111 ? "https://sepolia.etherscan.io" : "https://etherscan.io"
    return `${baseUrl}/address/${address}`
  }

  if (!isConnected) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Wallet className="w-5 h-5 text-violet-400" />
            Wallet Connection
          </CardTitle>
          <CardDescription className="text-slate-400">Connect your MetaMask wallet to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">No wallet connected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Wallet className="w-5 h-5 text-violet-400" />
          Connected Wallet
          {savedWalletAddress === address && (
            <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-slate-400">Your MetaMask wallet information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Address:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-300">{formatAddress(address)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(address!)}
                className="h-6 w-6 p-0 text-slate-400 hover:text-slate-300"
              >
                {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
              <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0 text-slate-400 hover:text-slate-300">
                <a href={getEtherscanUrl(address!, chainId)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Network:</span>
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              {getChainName(chainId)}
            </Badge>
          </div>
        </div>

        {onSaveWallet && savedWalletAddress !== address && (
          <Button
            onClick={handleSaveWallet}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
          >
            {isSaving ? "Saving..." : "Save to Profile"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
