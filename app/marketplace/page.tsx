import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Ticket, Search, ArrowLeft, Store } from "lucide-react"
import Link from "next/link"
import { MarketplaceGrid } from "@/components/marketplace-grid"
import { MarketplaceFilters } from "@/components/marketplace-filters"

export const dynamic = "force-dynamic"

interface MarketplacePageProps {
  searchParams: {
    search?: string
    category?: string
    priceMin?: string
    priceMax?: string
    status?: string
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

  // Get active marketplace listings with event details
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
    // Note: This is a simplified search. In production, you'd want full-text search
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
    console.error("Failed to fetch marketplace listings:", listingsError)
  }

  const activeListings = listings || []

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
          <p className="text-slate-400">Buy and sell event tickets as NFTs</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                defaultValue={searchParams.search}
                className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400"
              />
            </div>
            <MarketplaceFilters searchParams={searchParams} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Listings</p>
                  <p className="text-2xl font-bold text-slate-100">{activeListings.length}</p>
                </div>
                <Store className="w-8 h-8 text-violet-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Floor Price</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {activeListings.length > 0
                      ? `${Math.min(...activeListings.map((l) => l.price_eth)).toFixed(3)} ETH`
                      : "N/A"}
                  </p>
                </div>
                <Ticket className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Price</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {activeListings.length > 0
                      ? `${(activeListings.reduce((sum, l) => sum + l.price_eth, 0) / activeListings.length).toFixed(3)} ETH`
                      : "N/A"}
                  </p>
                </div>
                <Badge className="bg-violet-600">AVG</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Volume</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {activeListings.length > 0
                      ? `${activeListings.reduce((sum, l) => sum + l.price_eth, 0).toFixed(2)} ETH`
                      : "0 ETH"}
                  </p>
                </div>
                <Badge className="bg-cyan-600">VOL</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Marketplace Grid */}
        <MarketplaceGrid listings={activeListings} currentUserId={user.id} />
      </main>
    </div>
  )
}
