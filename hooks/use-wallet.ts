"use client"

import { useState, useEffect, useCallback } from "react"
import { liskTestnet, liskMainnet } from "@/lib/lisk-config"

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
    if (typeof window === "undefined") return false
    
    // More robust MetaMask detection
    const ethereum = window.ethereum
    if (!ethereum) return false
    
    // Check if it's actually MetaMask (not another wallet)
    return ethereum.isMetaMask === true && typeof ethereum.request === "function"
  }, [])

  // Connect to MetaMask
  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined") {
      setWalletState((prev) => ({
        ...prev,
        error: "Window is not defined. Please refresh the page.",
      }))
      return
    }

    if (!window.ethereum) {
      setWalletState((prev) => ({
        ...prev,
        error: "MetaMask is not installed. Please install MetaMask to continue.",
      }))
      return
    }

    if (!window.ethereum.isMetaMask) {
      setWalletState((prev) => ({
        ...prev,
        error: "Please use MetaMask wallet.",
      }))
      return
    }

    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Ensure we're using the correct provider
      const ethereum = window.ethereum
      
      // Request account access
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      // Get chain ID
      const chainId = await ethereum.request({
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
      
      let errorMessage = "Failed to connect wallet"
      if (error.code === 4001) {
        errorMessage = "Connection rejected by user"
      } else if (error.code === -32002) {
        errorMessage = "Connection request is already pending"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setWalletState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }))
    }
  }, [])

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
    if (typeof window === "undefined") return
    if (!window.ethereum || !window.ethereum.isMetaMask) return
    
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
        const ethereum = window.ethereum
        const accounts = await ethereum.request({
          method: "eth_accounts",
        })

        if (accounts.length > 0 && !manualDisconnect && userHadConnected) {
          console.log("[Wallet Debug] Auto-reconnecting to:", accounts[0])
          const chainId = await ethereum.request({
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
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!window.ethereum || !window.ethereum.isMetaMask) return

    const ethereum = window.ethereum

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("[Wallet Debug] Accounts changed:", accounts)
      
      // If user manually disconnected, don't reconnect automatically  
      const manualDisconnect = getStorageValue(WALLET_MANUAL_DISCONNECT_KEY)
      if (manualDisconnect && accounts.length > 0) {
        console.log("[Wallet Debug] Ignoring account change due to manual disconnect")
        return
      }
      
      if (accounts.length === 0) {
        console.log("[Wallet Debug] No accounts, disconnecting")
        disconnectWallet()
      } else {
        console.log("[Wallet Debug] Setting new account:", accounts[0])
        setWalletState((prev) => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
        }))
      }
    }

    const handleChainChanged = (chainId: string) => {
      console.log("[Wallet Debug] Chain changed:", chainId)
      setWalletState((prev) => ({
        ...prev,
        chainId: Number.parseInt(chainId, 16),
      }))
    }

    // Use more robust event listener setup
    try {
      if (ethereum.on && typeof ethereum.on === "function") {
        ethereum.on("accountsChanged", handleAccountsChanged)
        ethereum.on("chainChanged", handleChainChanged)
      }
    } catch (error) {
      console.error("[Wallet Debug] Error setting up event listeners:", error)
    }

    return () => {
      try {
        if (ethereum.removeListener && typeof ethereum.removeListener === "function") {
          ethereum.removeListener("accountsChanged", handleAccountsChanged)
          ethereum.removeListener("chainChanged", handleChainChanged)
        } else if (ethereum.off && typeof ethereum.off === "function") {
          ethereum.off("accountsChanged", handleAccountsChanged)
          ethereum.off("chainChanged", handleChainChanged)
        }
      } catch (error) {
        console.error("[Wallet Debug] Error removing event listeners:", error)
      }
    }
  }, [disconnectWallet])

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

  // Debug function to help with MetaMask issues
  const debugMetaMask = useCallback(() => {
    if (typeof window === "undefined") {
      console.log("[MetaMask Debug] Window is undefined")
      return
    }

    console.log("[MetaMask Debug] Starting diagnosis...")
    console.log("[MetaMask Debug] window.ethereum:", !!window.ethereum)
    
    if (window.ethereum) {
      console.log("[MetaMask Debug] ethereum.isMetaMask:", window.ethereum.isMetaMask)
      console.log("[MetaMask Debug] ethereum.request type:", typeof window.ethereum.request)
      console.log("[MetaMask Debug] ethereum.on type:", typeof window.ethereum.on)
      console.log("[MetaMask Debug] ethereum.removeListener type:", typeof window.ethereum.removeListener)
      console.log("[MetaMask Debug] ethereum.selectedAddress:", window.ethereum.selectedAddress)
      console.log("[MetaMask Debug] ethereum.chainId:", window.ethereum.chainId)
      
      // Check if there are multiple providers
      if (window.ethereum.providers) {
        console.log("[MetaMask Debug] Multiple providers detected:", window.ethereum.providers.length)
        window.ethereum.providers.forEach((provider: any, index: number) => {
          console.log(`[MetaMask Debug] Provider ${index}:`, {
            isMetaMask: provider.isMetaMask,
            isCoinbaseWallet: provider.isCoinbaseWallet,
            isRabby: provider.isRabby,
          })
        })
      }
    } else {
      console.log("[MetaMask Debug] No ethereum object found")
    }

    // Check localStorage
    const manualDisconnect = getStorageValue(WALLET_MANUAL_DISCONNECT_KEY)
    const userHadConnected = getStorageValue(WALLET_USER_CONNECTED_KEY)
    console.log("[MetaMask Debug] Storage state:", { manualDisconnect, userHadConnected })
  }, [])

  // Function to switch to Lisk network
  const switchToLiskNetwork = useCallback(async (useTestnet: boolean = true) => {
    if (typeof window === "undefined" || !window.ethereum) {
      return { success: false, error: "MetaMask not found" }
    }

    const targetNetwork = useTestnet ? liskTestnet : liskMainnet
    const targetChainId = `0x${targetNetwork.chainId.toString(16)}`

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      })
      
      console.log(`[Wallet Debug] Successfully switched to ${targetNetwork.name}`)
      return { success: true }
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: targetChainId,
                chainName: targetNetwork.name,
                nativeCurrency: targetNetwork.nativeCurrency,
                rpcUrls: [targetNetwork.rpcUrl],
                blockExplorerUrls: [targetNetwork.blockExplorer],
              },
            ],
          })
          
          console.log(`[Wallet Debug] Successfully added and switched to ${targetNetwork.name}`)
          return { success: true }
        } catch (addError: any) {
          console.error("Failed to add network:", addError)
          return { success: false, error: `Failed to add ${targetNetwork.name}: ${addError.message}` }
        }
      } else {
        console.error("Failed to switch network:", switchError)
        return { success: false, error: `Failed to switch to ${targetNetwork.name}: ${switchError.message}` }
      }
    }
  }, [])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    forceDisconnectWallet,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    formatAddress,
    debugMetaMask,
    switchToLiskNetwork,
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
