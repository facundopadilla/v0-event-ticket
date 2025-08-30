import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Ticket, UserPlus, Calendar, QrCode, Users, Shield } from "lucide-react"

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Event-Token
              </span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0">
                  Sign Up
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-slate-800 text-violet-300 border-violet-500/20">
            Getting Started Guide
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Welcome to Event-Token
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Learn how to create, manage, and distribute secure digital tokens for your events in just a few simple
            steps.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-12">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-slate-100">Step 1: Create Your Account</CardTitle>
                  <CardDescription className="text-slate-400">
                    Choose a unique alias and secure password to get started
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Your alias is your unique identifier on Event-Token. It's how others will find and recognize your
                events. Choose something memorable and professional.
              </p>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0">
                  Create Account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-slate-100">Step 2: Create Your First Event</CardTitle>
                  <CardDescription className="text-slate-400">
                    Set up your event details and configure token settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Once you're logged in, you can create events with custom details like date, location, capacity, and
                special requirements. Each event gets its own set of secure digital tokens.
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>Add event name, description, and date</li>
                <li>Set capacity and ticket types</li>
                <li>Configure security settings</li>
                <li>Customize token appearance</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-slate-100">Step 3: Generate & Distribute Tokens</CardTitle>
                  <CardDescription className="text-slate-400">
                    Create secure tokens and share them with your attendees
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Generate unique, secure tokens for your event. Each token contains encrypted information and can't be
                duplicated or counterfeited.
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>Generate tokens in bulk or individually</li>
                <li>Share via email, SMS, or direct links</li>
                <li>Track token status and usage</li>
                <li>Export for external distribution</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-violet-400 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-slate-100">Step 4: Verify at Your Event</CardTitle>
                  <CardDescription className="text-slate-400">
                    Use our verification system for seamless entry management
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                At your event, use the built-in verification system to quickly validate tokens and manage entry.
                Real-time updates ensure no duplicate entries.
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>Scan QR codes for instant verification</li>
                <li>Real-time attendance tracking</li>
                <li>Offline verification support</li>
                <li>Detailed analytics and reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Features Highlight */}
        <Card className="bg-gradient-to-br from-violet-900/20 via-slate-900/50 to-cyan-900/20 border-slate-800 mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-100 mb-2">Why Choose Event-Token?</CardTitle>
            <CardDescription className="text-slate-400">
              Built for modern event organizers who demand security and simplicity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Fraud-Proof Security</h4>
                  <p className="text-sm text-slate-400">
                    Advanced cryptographic tokens that can't be duplicated or counterfeited
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <QrCode className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Instant Verification</h4>
                  <p className="text-sm text-slate-400">Quick QR code scanning for seamless entry management</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Team Collaboration</h4>
                  <p className="text-sm text-slate-400">Work with your team and assign roles for better management</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Real-time Analytics</h4>
                  <p className="text-sm text-slate-400">
                    Track attendance and get insights into your event performance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Ready to Get Started?</h2>
          <p className="text-slate-400 mb-6">
            Join thousands of event organizers who trust Event-Token for secure, seamless event management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0 px-8"
              >
                Create Your Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                Already have an account?
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
