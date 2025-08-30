"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function getPublicEvents() {
  const supabase = await createServerClient()

  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles!events_creator_id_fkey(display_name, alias)
    `)
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching events:", error)
    throw new Error("Failed to fetch events")
  }

  return events || []
}

export async function searchEvents(query: string) {
  const supabase = await createServerClient()

  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles!events_creator_id_fkey(display_name, alias)
    `)
    .gte("date", new Date().toISOString())
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error searching events:", error)
    throw new Error("Failed to search events")
  }

  return events || []
}

export async function getEventsByLocation(location: string) {
  const supabase = await createServerClient()

  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles!events_creator_id_fkey(display_name, alias)
    `)
    .gte("date", new Date().toISOString())
    .ilike("location", `%${location}%`)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching events by location:", error)
    throw new Error("Failed to fetch events by location")
  }

  return events || []
}

export async function getEventsByDateRange(startDate: string, endDate: string) {
  const supabase = await createServerClient()

  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles!events_creator_id_fkey(display_name, alias)
    `)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching events by date range:", error)
    throw new Error("Failed to fetch events by date range")
  }

  return events || []
}
