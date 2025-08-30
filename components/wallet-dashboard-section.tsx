"use client"

import { WalletConnectButton } from "@/components/wallet-connect-button"
import { WalletProfileCard } from "@/components/wallet-profile-card"
import { saveWalletAddress, removeWalletAddress } from "@/lib/actions/wallet"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WalletDashboardSectionProps {
  savedWalletAddress?: string | null
}

export function WalletDashboardSection({ savedWalletAddress }: WalletDashboardSectionProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSaveWallet = async (address: string) => {
    try {
      setError(null)
      setSuccess(null)
      await saveWalletAddress(address)
      setSuccess("Wallet address saved successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to save wallet address")
    }
  }

  const handleRemoveWallet = async () => {
    try {
      setError(null)
      setSuccess(null)
      await removeWalletAddress()
      setSuccess("Wallet address removed successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to remove wallet address")
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="bg-red-900/20 border-red-800 text-red-300">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-900/20 border-green-800 text-green-300">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Wallet Connection</h2>
          <WalletConnectButton onConnect={handleSaveWallet} />
        </div>

        <WalletProfileCard onSaveWallet={handleSaveWallet} savedWalletAddress={savedWalletAddress} />
      </div>
    </div>
  )
}
