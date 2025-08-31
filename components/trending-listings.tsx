"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Flame, Star, Clock } from "lucide-react"

interface TrendingListingsProps {
  className?: string
}

// Mock trending data
const TRENDING_LISTINGS = [
  {
    id: "1",
    eventTitle: "Ethereum Devcon 2024",
    tokenId: "42",
    currentPrice: 0.25,
    previousPrice: 0.18,
    priceChange: 38.9,
    timeLeft: "2 days",
    isHot: true
  },
  {
    id: "2", 
    eventTitle: "Bitcoin Miami Conference",
    tokenId: "157",
    currentPrice: 0.19,
    previousPrice: 0.15,
    priceChange: 26.7,
    timeLeft: "5 days",
    isHot: true
  },
  {
    id: "3",
    eventTitle: "Web3 Gaming Summit",
    tokenId: "89",
    currentPrice: 0.12,
    previousPrice: 0.10,
    priceChange: 20.0,
    timeLeft: "1 week",
    isHot: false
  }
]

export function TrendingListings({ className }: TrendingListingsProps) {
  return (
    <Card className={`bg-slate-900/50 border-slate-800 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Flame className="w-5 h-5 text-orange-400" />
          Trending Listings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {TRENDING_LISTINGS.map((listing, index) => (
          <div key={listing.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg text-white text-sm font-bold">
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-200 truncate">
                    {listing.eventTitle}
                  </span>
                  {listing.isHot && (
                    <Badge className="bg-orange-600 text-white text-xs">
                      <Flame className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  Token #{listing.tokenId}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-100">
                {listing.currentPrice} ETH
              </div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400">+{listing.priceChange}%</span>
              </div>
            </div>
          </div>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-slate-400 hover:text-white mt-4"
        >
          <Star className="w-4 h-4 mr-2" />
          View All Trending
        </Button>
      </CardContent>
    </Card>
  )
}
