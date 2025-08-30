import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Ticket, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { MyTicketsGrid } from "@/components/my-tickets-grid"
import { getUserTickets } from "@/lib/actions/ticket-purchase"

export const dynamic = "force-dynamic"

export default async function MyTicketsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // Get user's tickets
  let tickets = []
  let nftTablesExist = true

  try {
    tickets = await getUserTickets(user.id)
  } catch (error) {
    console.error("Error fetching tickets:", error)
    nftTablesExist = false
  }

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
                My NFT Tickets
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="outline"
                className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
              >
                <Link href="/marketplace">
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">My NFT Tickets</h1>
          <p className="text-slate-400">Manage your event tickets and marketplace listings</p>
        </div>

        {/* Tickets Grid */}
        {!nftTablesExist ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <Ticket className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">NFT Functionality Not Set Up</h3>
            <p className="text-slate-400 mb-4">
              The NFT ticket system needs to be initialized. Please run the database migration script to enable NFT
              functionality.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
            >
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        ) : (
          <MyTicketsGrid tickets={tickets} currentUserId={user.id} />
        )}
      </main>
    </div>
  )
}
