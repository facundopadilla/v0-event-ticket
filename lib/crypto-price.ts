// Crypto price conversion utilities

// Mock ETH price in USD - In production, you'd fetch this from an API like CoinGecko
const MOCK_ETH_PRICE_USD = 2500 // $2,500 per ETH

/**
 * Convert USD amount to ETH
 * @param usdAmount Amount in USD
 * @returns Amount in ETH
 */
export function convertUsdToEth(usdAmount: number): number {
  if (usdAmount <= 0) return 0
  return usdAmount / MOCK_ETH_PRICE_USD
}

/**
 * Convert ETH amount to USD
 * @param ethAmount Amount in ETH
 * @returns Amount in USD
 */
export function convertEthToUsd(ethAmount: number): number {
  if (ethAmount <= 0) return 0
  return ethAmount * MOCK_ETH_PRICE_USD
}

/**
 * Format ETH amount for display
 * @param ethAmount Amount in ETH
 * @returns Formatted string
 */
export function formatEth(ethAmount: number): string {
  return ethAmount.toFixed(6)
}

/**
 * Format USD amount for display
 * @param usdAmount Amount in USD
 * @returns Formatted string
 */
export function formatUsd(usdAmount: number): string {
  return usdAmount.toFixed(2)
}

/**
 * Get current ETH price in USD (mock)
 * In production, this would fetch from a real API
 */
export function getCurrentEthPrice(): number {
  return MOCK_ETH_PRICE_USD
}

/**
 * Fetch real-time ETH price from API (placeholder for future implementation)
 */
export async function fetchEthPrice(): Promise<number> {
  // TODO: Implement real API call
  // Example: CoinGecko API
  // const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
  // const data = await response.json()
  // return data.ethereum.usd
  
  return MOCK_ETH_PRICE_USD
}
