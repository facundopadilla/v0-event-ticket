"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, X } from "lucide-react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

interface MarketplaceFiltersProps {
  searchParams: {
    search?: string
    category?: string
    priceMin?: string
    priceMax?: string
    status?: string
  }
}

export function MarketplaceFilters({ searchParams }: MarketplaceFiltersProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    priceMin: searchParams.priceMin || "",
    priceMax: searchParams.priceMax || "",
    status: searchParams.status || "all",
  })

  const applyFilters = () => {
    const params = new URLSearchParams(currentSearchParams.toString())

    // Update price filters
    if (filters.priceMin) {
      params.set("priceMin", filters.priceMin)
    } else {
      params.delete("priceMin")
    }

    if (filters.priceMax) {
      params.set("priceMax", filters.priceMax)
    } else {
      params.delete("priceMax")
    }

    if (filters.status !== "all") {
      params.set("status", filters.status)
    } else {
      params.delete("status")
    }

    router.push(`/marketplace?${params.toString()}`)
    setShowFilters(false)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(currentSearchParams.toString())
    params.delete("priceMin")
    params.delete("priceMax")
    params.delete("status")

    setFilters({
      priceMin: "",
      priceMax: "",
      status: "all",
    })

    router.push(`/marketplace?${params.toString()}`)
    setShowFilters(false)
  }

  const hasActiveFilters = filters.priceMin || filters.priceMax || filters.status !== "all"

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-violet-500 rounded-full"></span>}
      </Button>

      {showFilters && (
        <Card className="absolute right-0 top-12 w-80 bg-slate-900 border-slate-800 z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100 text-lg">Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Price Range (ETH)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  step="0.001"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
                <Input
                  placeholder="Max"
                  type="number"
                  step="0.001"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Event Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="upcoming">Upcoming Only</SelectItem>
                  <SelectItem value="past">Past Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={applyFilters}
                className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
              >
                Apply
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
