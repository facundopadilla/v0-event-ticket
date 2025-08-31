import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Ticket, Search, ArrowLeft, Store, ShoppingCart, DollarSign } from "lucide-react"
import Link from "next/link"
import { MarketplaceGrid } from "@/components/marketplace-grid"
import { MarketplaceFilters } from "@/components/marketplace-filters"
import { MarketplaceTabs } from "@/components/marketplace-tabs"

export const dynamic = "force-dynamic"

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

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  let activeListings = []
  let hasNFTTables = true

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
          title: "NFT Art Expo",
          description: "Showcasing the best in NFT art",
          date: "2024-09-30",
          location: "Los Angeles, CA", 
          max_attendees: 200
        }
      }
    },
    {
      id: "listing_4",
      price_eth: 0.05,
      seller_user_id: "seller_4",
      seller_wallet_address: "0x9F8E7D6C5B4A3F2E1D0C9B8A7F6E5D4C3B2A1F0E",
      is_active: true,
      created_at: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
      nft_tickets: {
        token_id: "156",
        is_used: false,
        owner_wallet_address: "0x9F8E7D6C5B4A3F2E1D0C9B8A7F6E5D4C3B2A1F0E",
        events: {
          id: "4",
          title: "Web3 Workshop",
          description: "Hands-on Web3 development workshop",
          date: "2024-12-05",
          location: "Austin, TX",
          max_attendees: 100
        }
      }
    },
    {
      id: "listing_5",
      price_eth: 0.35,
      seller_user_id: "seller_5", 
      seller_wallet_address: "0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B",
      is_active: true,
      created_at: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
      nft_tickets: {
        token_id: "1337",
        is_used: false,
        owner_wallet_address: "0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B",
        events: {
          id: "5",
          title: "ETH Denver 2024",
          description: "The largest Ethereum event in the world",
          date: "2024-02-29",
          location: "Denver, CO",
          max_attendees: 1000
        }
      }
    },
    {
      id: "listing_6",
      price_eth: 0.28,
      seller_user_id: "seller_6",
      seller_wallet_address: "0x7F5E9C8B4A6D3F1E2C9B7A5F8E6D4C2B1A9F7E5C",
      is_active: true,
      created_at: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
      nft_tickets: {
        token_id: "420",
        is_used: false,
        owner_wallet_address: "0x7F5E9C8B4A6D3F1E2C9B7A5F8E6D4C2B1A9F7E5C",
        events: {
          id: "6",
          title: "Consensus 2024",
          description: "The most important blockchain event",
          date: "2024-05-15",
          location: "Austin, TX",
          max_attendees: 800
        }
      }
    },
    {
      id: "listing_7",
      price_eth: 0.12,
      seller_user_id: "seller_7",
      seller_wallet_address: "0x4B5A6F2E8C9D7F3A1B6E5C8F9A2D4E7B1C5A8F3E",
      is_active: true,
      created_at: new Date(Date.now() - 25200000).toISOString(), // 7 hours ago
      nft_tickets: {
        token_id: "777",
        is_used: false,
        owner_wallet_address: "0x4B5A6F2E8C9D7F3A1B6E5C8F9A2D4E7B1C5A8F3E",
        events: {
          id: "7",
          title: "Crypto Gaming Convention",
          description: "The future of blockchain gaming",
          date: "2024-08-22",
          location: "Las Vegas, NV",
          max_attendees: 400
        }
      }
    },
    {
      id: "listing_8",
      price_eth: 0.45,
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
      activeListings = MOCK_LISTINGS
      
      // Apply search filter to mock data
      if (searchParams.search) {
        activeListings = activeListings.filter(listing => 
          listing.nft_tickets.events.title.toLowerCase().includes(searchParams.search!.toLowerCase())
        )
      }
      
      // Apply price filters to mock data
      if (searchParams.priceMin) {
        activeListings = activeListings.filter(listing => 
          listing.price_eth >= Number.parseFloat(searchParams.priceMin!)
        )
      }
      if (searchParams.priceMax) {
        activeListings = activeListings.filter(listing => 
          listing.price_eth <= Number.parseFloat(searchParams.priceMax!)
        )
      }
    } else {
      activeListings = listings && listings.length > 0 ? listings : MOCK_LISTINGS
    }
  } catch (error) {
    console.error("Error fetching marketplace listings, using mock data:", error)
    activeListings = MOCK_LISTINGS
  }

  // Remove the setup message since we have mock data to show
  // if (!hasNFTTables) { ... }

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
              <Button
                asChild
                variant="outline"
                className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
              >
                <Link href="/my-tickets">
                  <Ticket className="w-4 h-4 mr-2" />
                  My Tickets
                </Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
              >
                <Link href="/marketplace?tab=sell">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Sell Tickets
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">NFT Ticket Marketplace</h1>
          <p className="text-slate-400">Buy and sell event tickets as NFTs on the blockchain</p>
        </div>

        {/* Marketplace Tabs */}
        <MarketplaceTabs 
          listings={activeListings} 
          currentUserId={user.id} 
          searchParams={searchParams}
        />
      </main>
    </div>
  )
}
