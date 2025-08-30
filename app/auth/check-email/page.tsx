import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, Ticket } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Event-Token
            </span>
          </div>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-violet-400" />
            </div>
            <CardTitle className="text-2xl text-slate-100">Check Your Email</CardTitle>
            <CardDescription className="text-slate-400">
              We've sent you a confirmation link to complete your registration
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-slate-300">
                Please check your email and click the confirmation link to activate your account.
              </p>
              <p className="text-sm text-slate-500">
                Don't see the email? Check your spam folder or wait a few minutes for it to arrive.
              </p>
            </div>

            <div className="pt-4">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
              >
                <Link href="/login">Continue to Sign In</Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Need help?{" "}
                <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium">
                  Try registering again
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
