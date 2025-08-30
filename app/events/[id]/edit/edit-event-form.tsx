"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createBrowserClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle } from "lucide-react"

const editEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  max_attendees: z.number().min(1, "Must allow at least 1 attendee").max(10000, "Maximum 10,000 attendees allowed"),
})

type EditEventFormData = z.infer<typeof editEventSchema>

interface EditEventFormProps {
  event: {
    id: string
    title: string
    description: string
    date: string
    location: string
    max_attendees: number
  }
}

export function EditEventForm({ event }: EditEventFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      max_attendees: event.max_attendees,
    },
  })

  const onSubmit = async (data: EditEventFormData) => {
    console.log("[v0] Form submitted with data:", data)
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Updating event with ID:", event.id)
      const { error: updateError } = await supabase
        .from("events")
        .update({
          title: data.title,
          description: data.description,
          date: new Date(data.date).toISOString(),
          location: data.location,
          max_attendees: data.max_attendees,
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.id)

      if (updateError) {
        console.log("[v0] Update error:", updateError)
        throw updateError
      }

      console.log("[v0] Event updated successfully, showing success modal...")
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Event update error:", err)
      setError(err instanceof Error ? err.message : "Failed to update event")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    router.push(`/events/${event.id}`)
    router.refresh()
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title" className="text-slate-200">
            Event Title
          </Label>
          <Input
            id="title"
            {...register("title")}
            className="bg-slate-800 border-slate-700 text-slate-100 focus:border-violet-500"
            placeholder="Enter event title"
          />
          {errors.title && <p className="text-red-400 text-sm">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-200">
            Description
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            className="bg-slate-800 border-slate-700 text-slate-100 focus:border-violet-500 min-h-[120px]"
            placeholder="Describe your event"
          />
          {errors.description && <p className="text-red-400 text-sm">{errors.description.message}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-slate-200">
              Date & Time
            </Label>
            <Input
              id="date"
              type="datetime-local"
              {...register("date")}
              className="bg-slate-800 border-slate-700 text-slate-100 focus:border-violet-500"
            />
            {errors.date && <p className="text-red-400 text-sm">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_attendees" className="text-slate-200">
              Max Attendees
            </Label>
            <Input
              id="max_attendees"
              type="number"
              {...register("max_attendees", { valueAsNumber: true })}
              className="bg-slate-800 border-slate-700 text-slate-100 focus:border-violet-500"
              placeholder="100"
            />
            {errors.max_attendees && <p className="text-red-400 text-sm">{errors.max_attendees.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-slate-200">
            Location
          </Label>
          <Input
            id="location"
            {...register("location")}
            className="bg-slate-800 border-slate-700 text-slate-100 focus:border-violet-500"
            placeholder="Event location or venue"
          />
          {errors.location && <p className="text-red-400 text-sm">{errors.location.message}</p>}
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating Event...
              </>
            ) : (
              "Update Event"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/events/${event.id}`)}
            className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
          >
            Cancel
          </Button>
        </div>
      </form>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <DialogTitle className="text-xl font-semibold text-slate-100">Event Updated Successfully!</DialogTitle>
            <DialogDescription className="text-slate-300">
              Your event has been updated with the new information. All changes have been saved.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSuccessModalClose}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
