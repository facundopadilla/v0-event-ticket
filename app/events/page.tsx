import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { EventsGrid } from "@/components/events-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Calendar, MapPin, ArrowLeft, Ticket, TrendingUp, Users, Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function getPublicEvents() {
  const supabase = await createServerClient()

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })

  if (eventsError) {
    console.error("Error fetching events:", eventsError)
    return []
  }

  if (!events || events.length === 0) {
    return []
  }

  // Get unique creator IDs
  const creatorIds = [...new Set(events.map((event) => event.creator_id))]

  // Fetch profiles for all creators
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name, alias")
    .in("id", creatorIds)

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
    // Continue without profile data rather than failing completely
  }

  // Combine events with profile data
  const eventsWithProfiles = events.map((event) => {
    const profile = profiles?.find((profile) => profile.id === event.creator_id)
    return {
      ...event,
      profiles: profile || {
        display_name: null,
        alias: "Unknown Creator"
      },
    }
  })

  return eventsWithProfiles
}

export default async function EventsPage() {
  const events = await getPublicEvents()
  const totalEvents = events.length
  const totalCapacity = events.reduce((sum, event) => sum + (event.max_attendees || 0), 0)
  const upcomingThisWeek = events.filter(event => {
    const eventDate = new Date(event.date)
    const weekFromNow = new Date()
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    return eventDate <= weekFromNow
  }).length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Discover Events
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="outline"
                className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
              >
                <Link href="/marketplace">
                  <Ticket className="w-4 h-4 mr-2" />
                  Marketplace
                </Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
              >
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
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
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="bg-violet-600 text-white">
              {totalEvents} Events Available
            </Badge>
            <Badge variant="outline" className="border-cyan-400 text-cyan-400">
              {upcomingThisWeek} This Week
            </Badge>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-2">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl">
            Browse upcoming events and purchase NFT tickets that you can collect, trade, and use for exclusive access.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Events</p>
                  <p className="text-2xl font-bold text-slate-100">{totalEvents}</p>
                </div>
                <Calendar className="w-8 h-8 text-violet-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Capacity</p>
                  <p className="text-2xl font-bold text-slate-100">{totalCapacity.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">This Week</p>
                  <p className="text-2xl font-bold text-slate-100">{upcomingThisWeek}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search events by name, location, or description..."
                className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Date
              </Button>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </Button>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
                <Ticket className="h-4 w-4 mr-2" />
                Price
              </Button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 animate-pulse">
                  <div className="h-48 bg-slate-700 rounded-lg mb-4"></div>
                  <div className="h-6 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded mb-4"></div>
                  <div className="h-10 bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          }
        >
          <EventsGrid events={events} />
        </Suspense>

        {events.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-200 mb-4">No Events Found</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Be the first to create an amazing event! Events you create will appear here for others to discover.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
            >
              <Link href="/events/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
