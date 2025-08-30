"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Loader2, ExternalLink, RefreshCw } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { resetWalletState } from "@/hooks/use-wallet"

interface WalletConnectButtonProps {
  onConnect?: (address: string) => void
  onDisconnect?: () => void
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
  onForceDisconnectRef?: (forceDisconnect: () => void) => void
  showClearButton?: boolean
}

export function WalletConnectButton({
  onConnect,
  onDisconnect,
  variant = "default",
  size = "default",
  className = "",
  onForceDisconnectRef,
  showClearButton = false,
}: WalletConnectButtonProps) {
  const [isMounted, setIsMounted] = useState(false)
  const {
    address,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    forceDisconnectWallet,
    isMetaMaskInstalled,
    formatAddress,
  } = useWallet()

  const [showError, setShowError] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    
    // Provide force disconnect function to parent if requested
    if (onForceDisconnectRef) {
      onForceDisconnectRef(handleForceDisconnect)
    }
  }, [onForceDisconnectRef])

  const handleConnect = async () => {
    await connectWallet()
    if (address && onConnect) {
      onConnect(address)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    if (onDisconnect) {
      onDisconnect()
    }
  }

  // Force disconnect method for external use
  const handleForceDisconnect = () => {
    forceDisconnectWallet()
    if (onDisconnect) {
      onDisconnect()
    }
  }

  // Clear all wallet state and reset everything
  const handleClearWalletState = () => {
    resetWalletState()
    forceDisconnectWallet()
    if (onDisconnect) {
      onDisconnect()
    }
    // Force page refresh to ensure clean state
    window.location.reload()
  }

  // Prevent hydration mismatch by not rendering wallet-specific content until mounted
  if (!isMounted) {
    return (
      <div className="space-y-3">
        <Button
          variant={variant}
          size={size}
          disabled
          className={`${className} ${
            variant === "default"
              ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0"
              : ""
          }`}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    )
  }

  if (!isMetaMaskInstalled) {
    return (
      <div className="space-y-3">
        <Button
          variant="outline"
          size={size}
          className={`${className} border-orange-600 text-orange-400 hover:bg-orange-600/10`}
          asChild
        >
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Install MetaMask
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && showError && (
        <Alert className="bg-red-900/20 border-red-800 text-red-300">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowError(false)}
              className="h-auto p-1 text-red-400 hover:text-red-300"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300 font-mono">{formatAddress(address)}</span>
          </div>
          <Button
            variant="outline"
            size={size}
            onClick={handleDisconnect}
            className={`${className} border-slate-600 text-slate-300 hover:bg-slate-700`}
          >
            Disconnect
          </Button>
          {showClearButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearWalletState}
              className="text-slate-400 hover:text-slate-300 px-2"
              title="Clear wallet cache completely"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      ) : (
        <Button
          variant={variant}
          size={size}
          onClick={handleConnect}
          disabled={isConnecting}
          className={`${className} ${
            variant === "default"
              ? "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
              : ""
          }`}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
      )}
    </div>
  )
}
