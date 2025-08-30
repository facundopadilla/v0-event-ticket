"use client"

import { useState, useEffect, useCallback } from "react"

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  chainId: number | null
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

      setWalletState({
        address: accounts[0],
        isConnected: true,
        isConnecting: false,
        error: null,
        chainId: Number.parseInt(chainId, 16),
      })
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
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      chainId: null,
    })
  }, [])

  // Check if already connected on mount
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        })

        if (accounts.length > 0) {
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

  // Format address for display
  const formatAddress = useCallback((address: string | null) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
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
