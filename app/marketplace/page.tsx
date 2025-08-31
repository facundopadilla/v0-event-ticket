"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Ticket, Search, ArrowLeft, Store, ShoppingCart, DollarSign, Wallet } from "lucide-react"
import Link from "next/link"
import { MarketplaceGrid } from "@/components/marketplace-grid"
import { MarketplaceFilters } from "@/components/marketplace-filters"
import { useWallet } from "@/hooks/use-wallet"
import { WalletConnectButton } from "@/components/wallet-connect-button"

interface MarketplacePageProps {
  searchParams: {
    search?: string
    category?: string
    priceMin?: string
    priceMax?: string
    status?: string
    tab?: string
  }
}

export default function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeListings, setActiveListings] = useState<any[]>([])
  const [hasNFTTables, setHasNFTTables] = useState(true)
  const supabase = createBrowserClient()
  const router = useRouter()
  const { address, isConnected } = useWallet()

  // Mock data for demonstration purposes
  const MOCK_LISTINGS = [
    {
      id: "listing_1",
      price_eth: 0.15,
      seller_user_id: "seller_1", 
      seller_wallet_address: "0x742d35Cc4C4d4532CE6E3C7F5B9e8234AF5b2C37",
      is_active: true,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      nft_tickets: {
        token_id: "101",
        is_used: false,
        owner_wallet_address: "0x742d35Cc4C4d4532CE6E3C7F5B9e8234AF5b2C37",
        events: {
          id: "1",
          title: "Blockchain Conference 2024",
          description: "The premier blockchain event of the year",
          date: "2024-10-15",
          location: "San Francisco, CA",
          max_attendees: 500
        }
      }
    },
    {
      id: "listing_2", 
      price_eth: 0.08,
      seller_user_id: "seller_2",
      seller_wallet_address: "0x8ba1f109551bD432803012645Hac136c26F1234E",
      is_active: true,
      created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      nft_tickets: {
        token_id: "205",
        is_used: false,
        owner_wallet_address: "0x8ba1f109551bD432803012645Hac136c26F1234E",
        events: {
          id: "2",
          title: "DeFi Summit 2024",
          description: "Exploring the future of decentralized finance",
          date: "2024-11-20", 
          location: "New York, NY",
          max_attendees: 300
        }
      }
    },
    {
      id: "listing_3",
      price_eth: 0.22,
      seller_user_id: "seller_3",
      seller_wallet_address: "0x6Cd5B4b2F8A2C4c9F1d3E4F5A6B7C8D9E0F1A2B3",
      is_active: true,
      created_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
      nft_tickets: {
        token_id: "89",
        is_used: false,
        owner_wallet_address: "0x6Cd5B4b2F8A2C4c9F1d3E4F5A6B7C8D9E0F1A2B3",
        events: {
          id: "3",
          title: "Web3 Developer Workshop",
          description: "Hands-on workshop for Web3 development",
          date: "2024-09-30",
          location: "Austin, TX",
          max_attendees: 150
        }
      }
    },
    {
      id: "listing_4",
      price_eth: 0.12,
      seller_user_id: "seller_4",
      seller_wallet_address: "0x4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A",
      is_active: true,
      created_at: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
      nft_tickets: {
        token_id: "456",
        is_used: false,
        owner_wallet_address: "0x4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A",
        events: {
          id: "4",
          title: "NFT Art Exhibition",
          description: "Digital art showcase and auction",
          date: "2024-12-05",
          location: "Miami, FL",
          max_attendees: 400
        }
      }
    },
    {
      id: "listing_5",
      price_eth: 0.18,
      seller_user_id: "seller_5",
      seller_wallet_address: "0x9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D",
      is_active: true,
      created_at: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
      nft_tickets: {
        token_id: "777",
        is_used: false,
        owner_wallet_address: "0x9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D",
        events: {
          id: "5",
          title: "Gaming & Metaverse Expo",
          description: "Explore the future of gaming and virtual worlds",
          date: "2024-08-25",
          location: "Los Angeles, CA",
          max_attendees: 800
        }
      }
    },
    {
      id: "listing_6",
      price_eth: 0.09,
      seller_user_id: "seller_6",
      seller_wallet_address: "0x3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F",
      is_active: true,
      created_at: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
      nft_tickets: {
        token_id: "123",
        is_used: false,
        owner_wallet_address: "0x3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F",
        events: {
          id: "6",
          title: "Crypto Trading Masterclass",
          description: "Learn advanced trading strategies",
          date: "2024-06-12",
          location: "Chicago, IL",
          max_attendees: 100
        }
      }
    },
    {
      id: "listing_7",
      price_eth: 0.25,
      seller_user_id: "seller_7",
      seller_wallet_address: "0x7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B",
      is_active: true,
      created_at: new Date(Date.now() - 25200000).toISOString(), // 7 hours ago
      nft_tickets: {
        token_id: "888",
        is_used: false,
        owner_wallet_address: "0x7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B",
        events: {
          id: "7",
          title: "Ethereum Developers Conference",
          description: "Latest developments in Ethereum ecosystem",
          date: "2024-11-08",
          location: "Berlin, Germany",
          max_attendees: 700
        }
      }
    },
    {
      id: "listing_8",
      price_eth: 0.14,
      seller_user_id: "seller_8",
      seller_wallet_address: "0x2E8C9F5A7B4D1F6E3A8C5B9F2E4D7A1B6C8F5A3E",
      is_active: true,
      created_at: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
      nft_tickets: {
        token_id: "999",
        is_used: false,
        owner_wallet_address: "0x2E8C9F5A7B4D1F6E3A8C5B9F2E4D7A1B6C8F5A3E",
        events: {
          id: "8",
          title: "Solana Breakpoint 2024",
          description: "Annual Solana developer conference",
          date: "2024-09-10",
          location: "Lisbon, Portugal",
          max_attendees: 600
        }
      }
    },
    {
      id: "listing_9",
      price_eth: 0.06,
      seller_user_id: "seller_9",
      seller_wallet_address: "0x8F3E5C9A2B7D4F1E6A9C3F7B5E8D2A4C6F9B1E5A",
      is_active: true,
      created_at: new Date(Date.now() - 32400000).toISOString(), // 9 hours ago
      nft_tickets: {
        token_id: "369",
        is_used: false,
        owner_wallet_address: "0x8F3E5C9A2B7D4F1E6A9C3F7B5E8D2A4C6F9B1E5A",
        events: {
          id: "9",
          title: "DeFi Security Summit",
          description: "Best practices for DeFi security",
          date: "2024-07-18",
          location: "London, UK",
          max_attendees: 250
        }
      }
    }
  ]

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    
    checkAuth()
  }, [supabase])

  useEffect(() => {
    const loadListings = async () => {
      try {
        // Try to get real data first, fallback to mock data
        let query = supabase
          .from("marketplace_listings")
          .select(`
            *,
            nft_tickets (
              *,
              events (
                id,
                title,
                description,
                date,
                location,
                max_attendees
              )
            )
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        // Apply search filter
        if (searchParams.search) {
          query = query.ilike("nft_tickets.events.title", `%${searchParams.search}%`)
        }

        // Apply price filters
        if (searchParams.priceMin) {
          query = query.gte("price_eth", Number.parseFloat(searchParams.priceMin))
        }
        if (searchParams.priceMax) {
          query = query.lte("price_eth", Number.parseFloat(searchParams.priceMax))
        }

        const { data: listings, error: listingsError } = await query

        if (listingsError) {
          // If database tables don't exist or error, use mock data
          console.log("Using mock data for marketplace listings")
          let filteredListings = MOCK_LISTINGS
          
          // Apply search filter to mock data
          if (searchParams.search) {
            filteredListings = filteredListings.filter(listing => 
              listing.nft_tickets.events.title.toLowerCase().includes(searchParams.search!.toLowerCase())
            )
          }
          
          // Apply price filters to mock data
          if (searchParams.priceMin) {
            filteredListings = filteredListings.filter(listing => 
              listing.price_eth >= Number.parseFloat(searchParams.priceMin!)
            )
          }
          if (searchParams.priceMax) {
            filteredListings = filteredListings.filter(listing => 
              listing.price_eth <= Number.parseFloat(searchParams.priceMax!)
            )
          }
          
          setActiveListings(filteredListings)
          setHasNFTTables(false)
        } else {
          setActiveListings(listings && listings.length > 0 ? listings : MOCK_LISTINGS)
          setHasNFTTables(true)
        }
      } catch (error) {
        console.error("Error loading listings:", error)
        setActiveListings(MOCK_LISTINGS)
        setHasNFTTables(false)
      }
    }

    loadListings()
  }, [supabase, searchParams])

  // Allow access if user is logged in OR has wallet connected
  const hasAccess = user || isConnected

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-100 mb-4">Access Required</h1>
              <p className="text-slate-400 mb-6">
                To access the marketplace, you need to either sign in or connect your wallet.
              </p>
              <div className="space-y-4">
                <WalletConnectButton className="w-full" />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500">Or</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  // Main marketplace render
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                NFT Marketplace
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" className="border-slate-600 text-slate-300 hover:text-white bg-transparent">
                <Link href="/events">
                  <Ticket className="w-4 h-4 mr-2" />
                  Browse Events
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border-b border-violet-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Badge variant="secondary" className="bg-violet-600 text-white">Demo Mode</Badge>
            <span className="text-violet-200">
              Showing sample NFT ticket listings for demonstration purposes
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">NFT Ticket Marketplace</h1>
          <p className="text-slate-400">Buy and sell event tickets as NFTs on the blockchain</p>
        </div>

        {/* Search Filters */}
        <div className="mb-6">
          <MarketplaceFilters searchParams={searchParams} />
        </div>

        {/* Marketplace Grid */}
        <MarketplaceGrid 
          listings={activeListings}
          currentUserId={user?.id || address || "anonymous"}
        />
      </main>
    </div>
  )
}
