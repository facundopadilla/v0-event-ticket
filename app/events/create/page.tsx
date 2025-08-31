"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Ticket, ArrowLeft, Calendar, MapPin, Users, FileText, Coins, Hash } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { convertUsdToEth } from "@/lib/crypto-price"
import Link from "next/link"

const eventSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be less than 500 characters"),
    date: z.string().min(1, "Date is required"),
    location: z
      .string()
      .min(3, "Location must be at least 3 characters")
      .max(200, "Location must be less than 200 characters"),
    maxAttendees: z.number().min(1, "Must allow at least 1 attendee").max(10000, "Maximum 10,000 attendees allowed"),
    nftEnabled: z.boolean(),
    ticketPriceUsd: z.number().min(0.01, "Ticket price must be at least $0.01").max(1000, "Maximum ticket price is $1,000").optional(),
  })
  .refine(
    (data) => {
      if (data.nftEnabled) {
        return data.ticketPriceUsd !== undefined
      }
      return true
    },
    {
      message: "Ticket price is required when NFTs are enabled",
      path: ["nftEnabled"],
    },
  )

type EventFormData = z.infer<typeof eventSchema>

export default function CreateEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      maxAttendees: 50,
      nftEnabled: true, // Cambiado a true por defecto para mostrar el campo de precio
    },
    mode: "onSubmit",
  })

  const nftEnabled = watch("nftEnabled")

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createBrowserClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("You must be logged in to create events")
        return
      }

      // Calculate nft_price before insertion
      let nftPrice = null
      if (data.nftEnabled && data.ticketPriceUsd) {
        try {
          nftPrice = await convertUsdToEth(data.ticketPriceUsd)
        } catch (error) {
          console.error("Error converting USD to ETH:", error)
          // Use fallback conversion if API fails
          nftPrice = data.ticketPriceUsd / 2500 // Fallback ETH price
        }
      }

      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          title: data.title,
          description: data.description,
          date: new Date(data.date).toISOString(),
          location: data.location,
          max_attendees: data.maxAttendees,
          creator_id: user.id,
          nft_enabled: data.nftEnabled,
          ticket_price_usd: data.nftEnabled ? data.ticketPriceUsd : null,
          nft_price: nftPrice,
          nft_supply: data.nftEnabled ? data.maxAttendees : null, // Use maxAttendees as nft_supply
        })
        .select()
        .single()

      if (eventError) {
        console.error("Event creation error:", eventError)
        setError("Failed to create event. Please try again.")
        return
      }

      router.refresh()
      router.push("/dashboard")
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Event-Token
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Create New Event</h1>
          <p className="text-slate-400">Set up your event and start generating tokens for attendees</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Event Details</CardTitle>
            <CardDescription className="text-slate-400">Fill in the information about your event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400" />
                  Event Title
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter event title"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-violet-500"
                />
                {errors.title && <p className="text-red-400 text-sm">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-200">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your event"
                  rows={4}
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-violet-500 resize-none"
                />
                {errors.description && <p className="text-red-400 text-sm">{errors.description.message}</p>}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Event Date & Time
                </Label>
                <Input
                  id="date"
                  type="datetime-local"
                  {...register("date")}
                  className="bg-slate-800 border-slate-700 text-slate-100 focus:border-violet-500"
                />
                {errors.date && <p className="text-red-400 text-sm">{errors.date.message}</p>}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-violet-400" />
                  Location
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="Event location or venue"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-violet-500"
                />
                {errors.location && <p className="text-red-400 text-sm">{errors.location.message}</p>}
              </div>

              {/* Max Attendees */}
              <div className="space-y-2">
                <Label htmlFor="maxAttendees" className="text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Maximum Attendees
                </Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  {...register("maxAttendees", { valueAsNumber: true })}
                  placeholder="100"
                  min="1"
                  max="10000"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-violet-500"
                />
                {errors.maxAttendees && <p className="text-red-400 text-sm">{errors.maxAttendees.message}</p>}
              </div>

              {/* NFT Options Section */}
              <Separator className="bg-slate-700" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-slate-200 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-violet-400" />
                      Enable NFT Tickets
                    </Label>
                    <p className="text-sm text-slate-400">
                      Allow attendees to purchase NFT tickets that they can own and trade
                    </p>
                  </div>
                  <Switch
                    {...register("nftEnabled")}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-600 data-[state=checked]:to-cyan-600"
                  />
                </div>

                {nftEnabled && (
                  <div className="space-y-4 pl-6 border-l-2 border-violet-500/30">
                    {/* Ticket Price in USD */}
                    <div className="space-y-2">
                      <Label htmlFor="ticketPriceUsd" className="text-slate-200 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-green-400" />
                        Ticket Price (USD)
                      </Label>
                      <Input
                        id="ticketPriceUsd"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="1000"
                        {...register("ticketPriceUsd", { valueAsNumber: true })}
                        placeholder="10.00"
                        className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-violet-500"
                      />
                      {errors.ticketPriceUsd && <p className="text-red-400 text-sm">{errors.ticketPriceUsd.message}</p>}
                      <p className="text-xs text-slate-500">
                        The number of available tickets will match the maximum attendees setting above
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0 disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
