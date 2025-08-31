"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, DollarSign, Search, Ticket, Store, TrendingUp } from "lucide-react"
import { MarketplaceGrid } from "@/components/marketplace-grid"
import { MarketplaceFilters } from "@/components/marketplace-filters"
import { MarketplaceActivity } from "@/components/marketplace-activity"
import { MarketplaceStats } from "@/components/marketplace-stats"
import { TrendingListings } from "@/components/trending-listings"
import { SellingTips } from "@/components/selling-tips"
import { FeaturedListings } from "@/components/featured-listings"
import { DemoBanner } from "@/components/demo-banner"
import { MyTicketsGrid } from "@/components/my-tickets-grid"

interface MarketplaceTabsProps {
  listings: any[]
  currentUserId: string
  searchParams: {
    search?: string
    category?: string
    priceMin?: string
    priceMax?: string
    status?: string
    tab?: string
  }
}

// Mock user tickets for the sell tab
const MOCK_USER_TICKETS = [
  {
    tokenId: "101",
    eventId: "1",
    isUsed: false,
    mintedAt: Date.now().toString(),
    eventTitle: "Blockchain Conference 2024"
  },
  {
    tokenId: "102",
    eventId: "2", 
    isUsed: false,
    mintedAt: (Date.now() - 86400000).toString(),
    eventTitle: "DeFi Summit"
  },
  {
    tokenId: "103",
    eventId: "3", 
    isUsed: true,
    mintedAt: (Date.now() - 172800000).toString(),
    eventTitle: "NFT Art Expo (Used)"
  }
]

export function MarketplaceTabs({ listings, currentUserId, searchParams }: MarketplaceTabsProps) {
  const activeTab = searchParams.tab || "browse"

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex space-x-1 bg-slate-900/50 rounded-lg p-1">
          <Button
            asChild
            variant={activeTab === "browse" ? "default" : "ghost"}
            size="sm"
            className={activeTab === "browse" 
              ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white" 
              : "text-slate-400 hover:text-white"
            }
          >
            <a href="/marketplace?tab=browse">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Browse Listings
            </a>
          </Button>
          <Button
            asChild
            variant={activeTab === "sell" ? "default" : "ghost"}
            size="sm"
            className={activeTab === "sell" 
              ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white" 
              : "text-slate-400 hover:text-white"
            }
          >
            <a href="/marketplace?tab=sell">
              <DollarSign className="w-4 h-4 mr-2" />
              Sell Your Tickets
            </a>
          </Button>
        </div>

        {activeTab === "browse" && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span>{listings.length} active listings</span>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "browse" ? (
        <div className="space-y-6">
          {/* Demo Banner */}
          <DemoBanner />
          
          {/* Search and Filters for Browse */}
          <div className="space-y-4">
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

          {/* Stats for Browse */}
          <MarketplaceStats listings={listings} />

          {/* Featured Listings */}
          <FeaturedListings />

          {/* Marketplace Grid and Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">All Listings</h3>
              <MarketplaceGrid listings={listings} currentUserId={currentUserId} />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <TrendingListings />
              <MarketplaceActivity />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Demo Banner */}
          <DemoBanner />
          
          {/* Info Card for Sell Tab */}
          <Card className="bg-gradient-to-r from-violet-900/20 to-cyan-900/20 border-violet-800/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100 mb-2">Sell Your NFT Tickets</h3>
                  <p className="text-slate-300 text-sm mb-3">
                    List your unused event tickets on the marketplace for other users to purchase. 
                    Set your own price and earn ETH from your ticket sales.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Badge className="w-2 h-2 rounded-full bg-green-500 p-0" />
                      2.5% marketplace fee
                    </span>
                    <span className="flex items-center gap-1">
                      <Badge className="w-2 h-2 rounded-full bg-blue-500 p-0" />
                      Instant payments in ETH
                    </span>
                    <span className="flex items-center gap-1">
                      <Badge className="w-2 h-2 rounded-full bg-purple-500 p-0" />
                      Secure smart contract transfers
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats for Sell Tab */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Your Tickets</p>
                    <p className="text-2xl font-bold text-slate-100">{MOCK_USER_TICKETS.length}</p>
                  </div>
                  <Ticket className="w-8 h-8 text-violet-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Available to Sell</p>
                    <p className="text-2xl font-bold text-slate-100">
                      {MOCK_USER_TICKETS.filter(t => !t.isUsed).length}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Potential Earnings</p>
                    <p className="text-2xl font-bold text-slate-100">~0.15 ETH</p>
                  </div>
                  <Badge className="bg-cyan-600">EST</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Tickets Grid and Selling Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Your NFT Tickets</h3>
              <MyTicketsGrid tickets={MOCK_USER_TICKETS} />
            </div>
            <div className="lg:col-span-1">
              <SellingTips />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
