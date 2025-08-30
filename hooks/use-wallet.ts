"use client"

import { useState, useEffect, useCallback } from "react"

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  chainId: number | null
}

// Constants for localStorage keys
const WALLET_MANUAL_DISCONNECT_KEY = "wallet_manual_disconnect"
const WALLET_USER_CONNECTED_KEY = "wallet_user_connected"

// Helper functions for localStorage
const getStorageValue = (key: string, defaultValue: boolean = false): boolean => {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item !== null ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

const setStorageValue = (key: string, value: boolean): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore localStorage errors
  }
}

// Function to reset the wallet state completely
export function resetWalletState() {
  setStorageValue(WALLET_MANUAL_DISCONNECT_KEY, false)
  setStorageValue(WALLET_USER_CONNECTED_KEY, false)
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    chainId: null,
  })

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }, [])

  // Connect to MetaMask
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setWalletState((prev) => ({
        ...prev,
        error: "MetaMask is not installed. Please install MetaMask to continue.",
      }))
      return
    }

    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      })

      // Reset manual disconnect flag when user manually connects
      setStorageValue(WALLET_MANUAL_DISCONNECT_KEY, false)
      setStorageValue(WALLET_USER_CONNECTED_KEY, true)

      setWalletState({
        address: accounts[0],
        isConnected: true,
        isConnecting: false,
        error: null,
        chainId: Number.parseInt(chainId, 16),
      })

      console.log("[Wallet Debug] Connected successfully:", accounts[0])
    } catch (error: any) {
      console.error("Failed to connect wallet:", error)
      setWalletState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to connect wallet",
      }))
    }
  }, [isMetaMaskInstalled])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    console.log("[Wallet Debug] Manual disconnect triggered")
    // Set manual disconnect flag to prevent auto-reconnection
    setStorageValue(WALLET_MANUAL_DISCONNECT_KEY, true)
    setStorageValue(WALLET_USER_CONNECTED_KEY, false)
    
    // Clear local state immediately
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      chainId: null,
    })
    
    // Also clear any localStorage that might be caching the connection
    if (typeof window !== "undefined") {
      localStorage.removeItem("walletconnect")
      localStorage.removeItem("WALLETCONNECT_DEEPLINK_CHOICE")
      
      // For some wallets, we might need to explicitly disconnect
      try {
        // Note: MetaMask doesn't have a programmatic disconnect method
        // but we're clearing our local state which is the important part
        console.log("Wallet disconnected locally")
      } catch (error) {
        console.log("Wallet disconnect cleanup completed")
      }
    }
  }, [])

  // Check if already connected on mount
  useEffect(() => {
    if (!isMetaMaskInstalled()) return
    
    // Don't auto-reconnect if user manually disconnected OR if user never connected before
    const manualDisconnect = getStorageValue(WALLET_MANUAL_DISCONNECT_KEY)
    const userHadConnected = getStorageValue(WALLET_USER_CONNECTED_KEY)
    
    console.log("[Wallet Debug] Mount check:", { 
      manualDisconnect, 
      userHadConnected,
      shouldSkipAutoConnect: manualDisconnect || !userHadConnected
    })
    
    if (manualDisconnect || !userHadConnected) return

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        })

        if (accounts.length > 0 && !manualDisconnect && userHadConnected) {
          console.log("[Wallet Debug] Auto-reconnecting to:", accounts[0])
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          })

          setWalletState({
            address: accounts[0],
            isConnected: true,
            isConnecting: false,
            error: null,
            chainId: Number.parseInt(chainId, 16),
          })
        } else {
          console.log("[Wallet Debug] Skipping auto-reconnect")
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error)
      }
    }

    checkConnection()
  }, [isMetaMaskInstalled])

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const handleAccountsChanged = (accounts: string[]) => {
      // If user manually disconnected, don't reconnect automatically  
      const manualDisconnect = getStorageValue(WALLET_MANUAL_DISCONNECT_KEY)
      if (manualDisconnect && accounts.length > 0) {
        return
      }
      
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        setWalletState((prev) => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
        }))
      }
    }

    const handleChainChanged = (chainId: string) => {
      setWalletState((prev) => ({
        ...prev,
        chainId: Number.parseInt(chainId, 16),
      }))
    }

    window.ethereum?.on("accountsChanged", handleAccountsChanged)
    window.ethereum?.on("chainChanged", handleChainChanged)

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum?.removeListener("chainChanged", handleChainChanged)
    }
  }, [isMetaMaskInstalled, disconnectWallet])

  // Force disconnect (for logout scenarios)
  const forceDisconnectWallet = useCallback(() => {
    console.log("[Wallet Debug] Force disconnect triggered")
    setStorageValue(WALLET_MANUAL_DISCONNECT_KEY, true)
    setStorageValue(WALLET_USER_CONNECTED_KEY, false)
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      chainId: null,
    })
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("walletconnect")
      localStorage.removeItem("WALLETCONNECT_DEEPLINK_CHOICE")
    }
  }, [])

  // Format address for display
  const formatAddress = useCallback((address: string | null) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    forceDisconnectWallet,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    formatAddress,
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
