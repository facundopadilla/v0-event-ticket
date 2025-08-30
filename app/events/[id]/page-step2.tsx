"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getEventById } from "@/lib/actions/events"

export default function EventDetailsPage() {
  const params = useParams()
  const eventId = params.id as string
  
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) return
      
      try {
        console.log("Loading event:", eventId)
        const eventData = await getEventById(eventId)
        console.log("Event data:", eventData)
        setEvent(eventData)
      } catch (error) {
        console.error("Error loading event:", error)
        setError("Failed to load event")
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [eventId])

  if (loading) return <div>Loading event...</div>
  if (error) return <div>Error: {error}</div>
  if (!event) return <div>Event not found</div>

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Event Details</h1>
      <h2>{event.title}</h2>
      <p><strong>Description:</strong> {event.description}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Max Attendees:</strong> {event.max_attendees}</p>
      
      {event.nft_enabled && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f0f0f0" }}>
          <h3>NFT Ticketing</h3>
          <p><strong>NFT Enabled:</strong> Yes</p>
          {event.ticket_price_usd && <p><strong>Price:</strong> ${event.ticket_price_usd} USD</p>}
          {event.nft_price && <p><strong>ETH Price:</strong> {event.nft_price} ETH</p>}
          {event.nft_supply && <p><strong>NFT Supply:</strong> {event.nft_supply}</p>}
        </div>
      )}
      
      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <p>Created: {new Date(event.created_at).toLocaleString()}</p>
        <p>Creator ID: {event.creator_id}</p>
      </div>
    </div>
  )
}
