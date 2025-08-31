import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, Users, QrCode, Calendar, Ticket } from "lucide-react"
import { HeroBackground } from "@/components/hero-background"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
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
            <nav className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/get-started">
                <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Video/Animation */}
        <HeroBackground />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-slate-950/80 to-cyan-900/30 z-10" />
        
        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 bg-slate-800/80 backdrop-blur-sm text-violet-300 border-violet-500/20">
            🚀 Now in Beta
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-slate-200 to-cyan-400 bg-clip-text text-transparent leading-tight drop-shadow-2xl">
            Digital Event Tokens
            <br />
            <span className="text-slate-300">Made Simple</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
            Create, distribute, and manage secure digital tokens for your events. No more lost tickets, no more fraud -
            just seamless event access for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0 px-8 shadow-2xl backdrop-blur-sm"
              >
                Create Your First Token
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600/50 text-slate-200 hover:bg-slate-800/50 bg-slate-900/30 backdrop-blur-sm shadow-xl"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="py-16 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-slate-100">Explore Event-Token</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Discover events, buy NFT tickets, and manage your digital collection
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/events">
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 hover:scale-105 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-100">Browse Events</h3>
                  <p className="text-slate-400 text-sm">Discover upcoming events and purchase NFT tickets</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/marketplace">
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 hover:scale-105 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <Ticket className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-100">Marketplace</h3>
                  <p className="text-slate-400 text-sm">Buy and sell NFT event tickets securely</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/my-tickets">
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 hover:scale-105 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-100">My Tickets</h3>
                  <p className="text-slate-400 text-sm">View and manage your NFT ticket collection</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard">
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 hover:scale-105 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-100">Dashboard</h3>
                  <p className="text-slate-400 text-sm">Create and manage your events and tokens</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-100">
              Everything you need for modern events
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to make event management effortless and secure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-100">Secure & Fraud-Proof</h3>
                <p className="text-slate-400">
                  Advanced cryptographic tokens that can't be duplicated or counterfeited. Your events stay secure.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-100">Instant Verification</h3>
                <p className="text-slate-400">
                  Quick QR code scanning for seamless entry. No more long queues or manual ticket checking.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-100">Lightning Fast</h3>
                <p className="text-slate-400">
                  Generate thousands of tokens in seconds. Built for events of any size, from intimate to massive.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-100">Team Management</h3>
                <p className="text-slate-400">
                  Collaborate with your team. Assign roles, track access, and manage permissions effortlessly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-cyan-400 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-100">Event Analytics</h3>
                <p className="text-slate-400">
                  Real-time insights into attendance, token usage, and event performance metrics.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-violet-400 rounded-lg flex items-center justify-center mb-4">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-100">Custom Branding</h3>
                <p className="text-slate-400">
                  Personalize your tokens with custom designs, logos, and branding to match your event.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-100">Ready to revolutionize your events?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of event organizers who trust Event-Token for secure, seamless event management.
          </p>
          <Link href="/get-started">
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0 px-8"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Event-Token
              </span>
            </div>
            <p className="text-slate-400 text-sm">© 2025 Event-Token. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
