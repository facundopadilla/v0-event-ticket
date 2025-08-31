"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, ExternalLink } from "lucide-react"

interface DemoBannerProps {
  className?: string
}

export function DemoBanner({ className }: DemoBannerProps) {
  return (
    <Card className={`bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-800/50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-800/50 rounded-lg">
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-600 text-white text-xs">Demo Mode</Badge>
              <span className="text-sm font-medium text-slate-200">Marketplace Simulation</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              You're viewing simulated marketplace data to demonstrate the full functionality. 
              In production, this would show real NFT ticket listings from connected users.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1 text-slate-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>6 Mock Listings</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Smart Contract Ready</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Blockchain Compatible</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-1">
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
