// Crypto price conversion utilities

// Fallback ETH price in USD if API fails
const FALLBACK_ETH_PRICE_USD = 2500 // $2,500 per ETH

// Cache for ETH price to avoid too many API calls
let cachedEthPrice: number | null = null
let lastFetchTime: number = 0
const CACHE_DURATION = 60000 // 1 minute cache

/**
 * Fetch real-time ETH price from CoinGecko API
 */
export async function fetchEthPrice(): Promise<number> {
  const now = Date.now()
  
  // Return cached price if it's fresh
  if (cachedEthPrice && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedEthPrice
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const ethPrice = data.ethereum?.usd

    if (typeof ethPrice === 'number' && ethPrice > 0) {
      cachedEthPrice = ethPrice
      lastFetchTime = now
      console.log('📈 ETH Price updated:', ethPrice)
      return ethPrice
    } else {
      throw new Error('Invalid price data received')
    }
  } catch (error) {
    console.error('Failed to fetch ETH price from CoinGecko:', error)
    console.log('📉 Using fallback ETH price:', FALLBACK_ETH_PRICE_USD)
    
    // Use fallback price and cache it temporarily
    cachedEthPrice = FALLBACK_ETH_PRICE_USD
    lastFetchTime = now
    return FALLBACK_ETH_PRICE_USD
  }
}

/**
 * Convert USD amount to ETH using real-time price
 * @param usdAmount Amount in USD
 * @returns Amount in ETH
 */
export async function convertUsdToEth(usdAmount: number): Promise<number> {
  if (usdAmount <= 0) return 0
  const ethPrice = await fetchEthPrice()
  return usdAmount / ethPrice
}

/**
 * Convert ETH amount to USD using real-time price
 * @param ethAmount Amount in ETH
 * @returns Amount in USD
 */
export async function convertEthToUsd(ethAmount: number): Promise<number> {
  if (ethAmount <= 0) return 0
  const ethPrice = await fetchEthPrice()
  return ethAmount * ethPrice
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
 * Get current ETH price in USD (with caching)
 */
export async function getCurrentEthPrice(): Promise<number> {
  return await fetchEthPrice()
}

/**
 * Get both USD and ETH prices for an item
 * @param usdPrice Price in USD
 * @returns Object with both USD and ETH prices formatted
 */
export async function getPriceInBothCurrencies(usdPrice: number): Promise<{
  usd: string
  eth: string
  ethRaw: number
}> {
  const ethAmount = await convertUsdToEth(usdPrice)
  return {
    usd: formatUsd(usdPrice),
    eth: formatEth(ethAmount),
    ethRaw: ethAmount
  }
}
