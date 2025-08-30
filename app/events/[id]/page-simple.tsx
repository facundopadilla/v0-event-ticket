"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft, 
  DollarSign,
  Loader2,
  AlertCircle
} from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { TicketPurchaseCard } from "@/components/ticket-purchase-card"
import { getEventById } from "@/lib/actions/events"
import Link from "next/link"

// Define the Event type based on Supabase structure
interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  max_attendees: number
  creator_id: string
  created_at: string
  updated_at: string
  // NFT-related fields
  nft_enabled?: boolean
  ticket_price_usd?: number
  nft_price?: number
  nft_supply?: number
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function EventDetailsPage() {
  const params = useParams()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { address } = useWallet()
  const { toast } = useToast()

  // Load event details
  useEffect(() => {
    async function loadEvent() {
      if (!eventId) return
      
      setLoading(true)
      setError(null)
      try {
        const eventData = await getEventById(eventId)
        if (eventData) {
          setEvent(eventData)
        } else {
          setError("Event not found")
        }
      } catch (error) {
        console.error("Error loading event:", error)
        setError("Failed to load event details")
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [eventId])

  const isEventCreator = event && address && 
    event.creator_id === address

  const isEventPast = event && new Date(event.date) < new Date()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error || "Event not found"}
              </h3>
              <p className="text-gray-600 mb-6">
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {/* Event Details */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Event Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {event.description}
                    </CardDescription>
                  </div>
                  <Badge variant={isEventPast ? "secondary" : "default"}>
                    {isEventPast ? "Past Event" : "Upcoming"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-sm text-gray-600">{event.max_attendees} attendees</p>
                    </div>
                  </div>
                  
                  {event.nft_enabled && event.ticket_price_usd && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Ticket Price</p>
                        <p className="text-sm text-gray-600">${event.ticket_price_usd} USD</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Organizer */}
                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Organizer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">Event Creator</p>
                      <p className="text-sm text-gray-600">Creator ID: {event.creator_id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* NFT Ticket Purchase Card */}
            {!isEventPast && event.nft_enabled && (
              <TicketPurchaseCard
                eventId={eventId}
                eventTitle={event.title}
                eventDate={event.date}
                ticketPrice={event.ticket_price_usd || 10.00}
                availableTickets={event.nft_supply || 100}
                maxTicketsPerWallet={4}
              />
            )}

            {/* Event Information */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Attendees</span>
                  <span className="font-medium">{event.max_attendees}</span>
                </div>
                
                {event.nft_enabled && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">NFT Enabled</span>
                      <Badge variant="default">Yes</Badge>
                    </div>
                    
                    {event.nft_supply && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">NFT Supply</span>
                        <span className="font-medium">{event.nft_supply}</span>
                      </div>
                    )}
                    
                    {event.ticket_price_usd && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ticket Price</span>
                        <span className="font-medium">${event.ticket_price_usd} USD</span>
                      </div>
                    )}
                    
                    {event.nft_price && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ETH Price</span>
                        <span className="font-medium">{event.nft_price} ETH</span>
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{new Date(event.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Event Status */}
            {!event.nft_enabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-gray-500" />
                    Standard Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    This event does not have NFT ticketing enabled. Contact the organizer for ticket information.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
