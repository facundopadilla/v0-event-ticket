import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, Plus, Calendar, Users, Home } from "lucide-react"
import Link from "next/link"
import { WalletDashboardSection } from "@/components/wallet-dashboard-section"
import { SignOutButton } from "@/components/signout-button"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })

  const totalEvents = events?.length || 0
  const totalAttendees = events?.reduce((sum, event) => sum + (event.max_attendees || 0), 0) || 0

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Event-Token
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="text-slate-300 hover:text-white">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Link>
              </Button>
              <span className="text-slate-300">
                Welcome, {profile?.display_name || profile?.email?.split("@")[0] || profile?.alias || "User"}
              </span>
              <SignOutButton 
                variant="ghost" 
                className="text-slate-300 hover:text-white"
              >
                Sign Out
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Dashboard</h1>
          <p className="text-slate-400">Manage your events and tokens</p>
        </div>

        <div className="mb-8">
          <WalletDashboardSection savedWalletAddress={profile?.wallet_address} />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Plus className="w-5 h-5 text-violet-400" />
                Create Event
              </CardTitle>
              <CardDescription className="text-slate-400">Start a new event and generate tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
              >
                <Link href="/events/create">New Event</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Calendar className="w-5 h-5 text-cyan-400" />
                My Events
              </CardTitle>
              <CardDescription className="text-slate-400">View and manage your events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">{totalEvents}</div>
              <p className="text-sm text-slate-400">Active events</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Users className="w-5 h-5 text-violet-400" />
                Total Capacity
              </CardTitle>
              <CardDescription className="text-slate-400">Across all your events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">{totalAttendees}</div>
              <p className="text-sm text-slate-400">Max attendees</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Recent Events</CardTitle>
            <CardDescription className="text-slate-400">Your latest created events</CardDescription>
          </CardHeader>
          <CardContent>
            {events && events.length > 0 ? (
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-100">{event.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.max_attendees} max
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300" asChild>
                      <Link href={`/events/${event.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
                {events.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                      View All Events
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No events yet</p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
                >
                  <Link href="/events/create">Create Your First Event</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
