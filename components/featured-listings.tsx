"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, ExternalLink, TrendingUp } from "lucide-react"

interface FeaturedListingsProps {
  className?: string
}

// Mock featured listings
const FEATURED_LISTINGS = [
  {
    id: "featured_1",
    eventTitle: "ETH Denver 2024",
    eventDate: "2024-02-29",
    location: "Denver, CO",
    tokenId: "1337",
    price: 0.35,
    originalPrice: 0.25,
    imageUrl: "/placeholder.jpg",
    rarity: "VIP Access",
    timeLeft: "3 days"
  },
  {
    id: "featured_2", 
    eventTitle: "Consensus 2024",
    eventDate: "2024-05-15",
    location: "Austin, TX",
    tokenId: "420",
    price: 0.28,
    originalPrice: 0.20,
    imageUrl: "/placeholder.jpg",
    rarity: "Early Bird",
    timeLeft: "1 week"
  }
]

export function FeaturedListings({ className }: FeaturedListingsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Featured Listings</h3>
        <Badge className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white">
          Editor's Choice
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURED_LISTINGS.map((listing) => (
          <Card key={listing.id} className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700 hover:border-violet-500/50 transition-all duration-300">
            <div className="aspect-video bg-gradient-to-br from-violet-600/20 to-cyan-600/20 rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold text-slate-600">#{listing.tokenId}</div>
              </div>
              <div className="absolute top-3 left-3">
                <Badge className="bg-violet-600 text-white">Featured</Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="border-cyan-400 text-cyan-400 bg-slate-900/50">
                  {listing.rarity}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-slate-100 mb-1">{listing.eventTitle}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(listing.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-slate-100">{listing.price} ETH</div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500 line-through">{listing.originalPrice} ETH</span>
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">
                        +{(((listing.price - listing.originalPrice) / listing.originalPrice) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {listing.timeLeft}
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
                  size="sm"
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
