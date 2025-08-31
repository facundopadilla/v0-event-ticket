"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, TrendingUp, Shield, Zap } from "lucide-react"

interface SellingTipsProps {
  className?: string
}

const SELLING_TIPS = [
  {
    icon: TrendingUp,
    title: "Price Competitively",
    description: "Check similar listings and price yours to match or slightly below market rate.",
    color: "text-green-400"
  },
  {
    icon: Zap,
    title: "List Popular Events",
    description: "Tickets for trending events tend to sell faster and at better prices.",
    color: "text-yellow-400"
  },
  {
    icon: Shield,
    title: "Verify Authenticity",
    description: "Ensure your ticket is valid and hasn't been used for maximum buyer confidence.",
    color: "text-blue-400"
  }
]

export function SellingTips({ className }: SellingTipsProps) {
  return (
    <Card className={`bg-slate-900/50 border-slate-800 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Selling Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {SELLING_TIPS.map((tip, index) => {
          const IconComponent = tip.icon
          return (
            <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <div className={`p-2 rounded-lg bg-slate-800 ${tip.color}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-200 mb-1">{tip.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{tip.description}</p>
              </div>
            </div>
          )
        })}
        
        <div className="mt-6 p-3 bg-gradient-to-r from-violet-900/20 to-cyan-900/20 border border-violet-800/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-violet-600 text-white text-xs">Pro Tip</Badge>
          </div>
          <p className="text-xs text-slate-300">
            List your tickets closer to the event date for better demand, but not too close to avoid last-minute buyers.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
