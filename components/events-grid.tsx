"use client"

import { EventCard } from "./event-card"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  max_attendees: number
  creator_id: string
  nft_enabled: boolean
  nft_price: number | null
  nft_supply: number | null
  nft_minted_count: number
  profiles: {
    display_name: string | null
    alias: string
  } | null
}

interface EventsGridProps {
  events: Event[]
}

export function EventsGrid({ events }: EventsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
