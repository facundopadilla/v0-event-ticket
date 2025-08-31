"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, BarChart3, Users, Zap } from "lucide-react"

interface MarketplaceStatsProps {
  listings: any[]
  className?: string
}

export function MarketplaceStats({ listings, className }: MarketplaceStatsProps) {
  // Calculate stats
  const totalListings = listings.length
  const totalVolume = listings.reduce((sum, l) => sum + l.price_eth, 0)
  const averagePrice = totalListings > 0 ? totalVolume / totalListings : 0
  const floorPrice = totalListings > 0 ? Math.min(...listings.map(l => l.price_eth)) : 0
  
  // Mock additional stats
  const weeklyGrowth = 15.3
  const uniqueSellers = 42
  const last24hSales = 8

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Listings</p>
              <p className="text-2xl font-bold text-slate-100">{totalListings}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">+{weeklyGrowth}%</span>
              </div>
            </div>
            <BarChart3 className="w-8 h-8 text-violet-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Floor Price</p>
              <p className="text-2xl font-bold text-slate-100">
                {floorPrice > 0 ? `${floorPrice.toFixed(3)} ETH` : "N/A"}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400">-2.1%</span>
              </div>
            </div>
            <Zap className="w-8 h-8 text-cyan-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">24h Sales</p>
              <p className="text-2xl font-bold text-slate-100">{last24hSales}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">+33%</span>
              </div>
            </div>
            <Badge className="bg-green-600 text-white">24H</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Unique Sellers</p>
              <p className="text-2xl font-bold text-slate-100">{uniqueSellers}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">+5 this week</span>
              </div>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
