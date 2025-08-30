import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, Calendar, MapPin, Users, ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { DeleteEventButton } from "./delete-event-button"

export const dynamic = "force-dynamic"

interface EventDetailsPageProps {
  params: {
    id: string
  }
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  if (!isValidUUID(params.id)) {
    redirect("/dashboard")
  }

  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // Get the specific event
  const { data: events, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .eq("creator_id", user.id) // Ensure user can only view their own events

  if (eventError) {
    console.error("Event fetch error:", eventError)
    redirect("/dashboard")
  }

  if (!events || events.length === 0) {
    console.log("Event not found or doesn't belong to user")
    redirect("/dashboard")
  }

  const event = events[0]

  const eventDate = new Date(event.date)
  const isUpcoming = eventDate > new Date()

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
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">{event.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={isUpcoming ? "default" : "secondary"} className="bg-violet-600 hover:bg-violet-700">
                  {isUpcoming ? "Upcoming" : "Past"}
                </Badge>
                <span className="text-slate-400">Created {new Date(event.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
              >
                <Link href={`/events/${event.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <DeleteEventButton eventId={event.id} eventTitle={event.title} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-200 mb-2">Description</h3>
                  <p className="text-slate-300 leading-relaxed">{event.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-violet-400" />
                    <div>
                      <p className="text-sm text-slate-400">Date & Time</p>
                      <p className="font-medium text-slate-200">
                        {eventDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-slate-400">
                        {eventDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-sm text-slate-400">Location</p>
                      <p className="font-medium text-slate-200">{event.location}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <Users className="w-5 h-5 text-violet-400" />
                  <div>
                    <p className="text-sm text-slate-400">Capacity</p>
                    <p className="font-medium text-slate-200">{event.max_attendees} maximum attendees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Event Tokens</CardTitle>
                <CardDescription className="text-slate-400">Manage access tokens for this event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">No tokens generated yet</p>
                  <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0">
                    Generate Tokens
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Event ID</span>
                  <span className="text-slate-200 font-mono text-sm">{event.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <Badge variant={isUpcoming ? "default" : "secondary"} className="bg-violet-600 hover:bg-violet-700">
                    {isUpcoming ? "Active" : "Ended"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tokens Issued</span>
                  <span className="text-slate-200">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
