"use client"

import { useState, useEffect, useCallback } from 'react'
import { getPriceInBothCurrencies, getCurrentEthPrice } from '@/lib/crypto-price'

export function useCryptoPrices() {
  const [ethPrice, setEthPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEthPrice = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const price = await getCurrentEthPrice()
      setEthPrice(price)
    } catch (err) {
      console.error('Failed to load ETH price:', err)
      setError('Failed to load cryptocurrency prices')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load ETH price on mount
  useEffect(() => {
    loadEthPrice()
  }, [loadEthPrice])

  const convertUsdToDisplayPrices = useCallback(async (usdAmount: number) => {
    try {
      return await getPriceInBothCurrencies(usdAmount)
    } catch (err) {
      console.error('Failed to convert prices:', err)
      // Return fallback values
      return {
        usd: usdAmount.toFixed(2),
        eth: (usdAmount / 2500).toFixed(6), // Fallback conversion
        ethRaw: usdAmount / 2500
      }
    }
  }, [])

  return {
    ethPrice,
    loading,
    error,
    convertUsdToDisplayPrices,
    refetch: loadEthPrice
  }
}
