"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, TrendingDown, Clock, ExternalLink } from "lucide-react"

interface MarketplaceActivityProps {
  className?: string
}

// Mock transaction data
const RECENT_ACTIVITY = [
  {
    id: "1",
    type: "sale",
    eventTitle: "Blockchain Conference 2024",
    tokenId: "101",
    price: 0.15,
    buyer: "0x742d35Cc4C4d4532CE6E3C7F5B9e8234AF5b2C37",
    seller: "0x8ba1f109551bD432803012645Hac136c26F1234E",
    timestamp: Date.now() - 3600000, // 1 hour ago
  },
  {
    id: "2", 
    type: "listing",
    eventTitle: "DeFi Summit",
    tokenId: "205",
    price: 0.08,
    seller: "0x6Cd5B4b2F8A2C4c9F1d3E4F5A6B7C8D9E0F1A2B3",
    timestamp: Date.now() - 7200000, // 2 hours ago
  },
  {
    id: "3",
    type: "sale",
    eventTitle: "NFT Art Expo",
    tokenId: "89",
    price: 0.22,
    buyer: "0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B",
    seller: "0x742d35Cc4C4d4532CE6E3C7F5B9e8234AF5b2C37",
    timestamp: Date.now() - 10800000, // 3 hours ago
  },
  {
    id: "4",
    type: "listing", 
    eventTitle: "Web3 Workshop",
    tokenId: "156",
    price: 0.05,
    seller: "0x9F8E7D6C5B4A3F2E1D0C9B8A7F6E5D4C3B2A1F0E",
    timestamp: Date.now() - 14400000, // 4 hours ago
  }
]

export function MarketplaceActivity({ className }: MarketplaceActivityProps) {
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ago`
    } else {
      return `${minutes}m ago`
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className={`bg-slate-900/50 border-slate-800 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {RECENT_ACTIVITY.map((activity) => (
          <div key={activity.id} className="flex items-start justify-between p-3 bg-slate-800/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant={activity.type === "sale" ? "default" : "secondary"}
                  className={activity.type === "sale" ? "bg-green-600" : "bg-blue-600"}
                >
                  {activity.type === "sale" ? "Sale" : "Listed"}
                </Badge>
                <span className="text-sm text-slate-300 truncate">
                  {activity.eventTitle}
                </span>
              </div>
              
              <div className="text-xs text-slate-400 space-y-1">
                <div>Token #{activity.tokenId}</div>
                {activity.type === "sale" ? (
                  <div className="flex items-center gap-1">
                    <span>{formatAddress(activity.buyer!)}</span>
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span>{formatAddress(activity.seller)}</span>
                  </div>
                ) : (
                  <div>by {formatAddress(activity.seller)}</div>
                )}
              </div>
            </div>
            
            <div className="text-right ml-3">
              <div className="text-sm font-semibold text-slate-100">
                {activity.price} ETH
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(activity.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-slate-400 hover:text-white mt-4"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View All Activity
        </Button>
      </CardContent>
    </Card>
  )
}
