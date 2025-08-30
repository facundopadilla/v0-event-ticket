"use client"

import { useParams } from "next/navigation"

export default function EventDetailsPage() {
  const params = useParams()
  const eventId = params.id as string

  return (
    <div>
      <h1>Event Details - Working</h1>
      <p>Event ID: {eventId}</p>
      <p>This page is working!</p>
    </div>
  )
}
