import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { EventsGrid } from "@/components/events-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, MapPin } from "lucide-react"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-balance">Discover Amazing Events</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto text-pretty">
            Browse upcoming events and purchase NFT tickets that you can collect and trade
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
            <Calendar className="h-4 w-4 mr-2" />
            Filter by Date
          </Button>
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
            <MapPin className="h-4 w-4 mr-2" />
            Filter by Location
          </Button>
        </div>

        {/* Events Grid */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-6 animate-pulse">
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
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
            <p className="text-slate-400">Check back later for upcoming events!</p>
          </div>
        )}
      </div>
    </div>
  )
}
