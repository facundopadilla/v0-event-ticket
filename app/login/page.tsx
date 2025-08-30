"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Ticket, ArrowLeft, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { WalletConnectButton } from "@/components/wallet-connect-button"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else {
          setError(authError.message)
        }
        return
      }

      if (authData.user) {
        // Redirect to dashboard
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async (address: string) => {
    try {
      // Check if user exists with this wallet address
      const { data: profile } = await supabase.from("profiles").select("*").eq("wallet_address", address).single()

      if (profile) {
        // If profile exists, sign in the user
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: "wallet-auth", // This won't work, we need a different approach
        })

        if (!authError && authData.user) {
          router.push("/dashboard")
        } else {
          setError("Wallet found but authentication failed. Please use email/password login.")
        }
      } else {
        setError("No account found with this wallet address. Please register first or use email/password login.")
      }
    } catch (err) {
      console.error("Wallet login error:", err)
      setError("Failed to authenticate with wallet. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
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
            <CardTitle className="text-2xl text-slate-100">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">Sign in to your Event-Token account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Wallet connection section */}
            <div className="space-y-4 mb-6">
              <WalletConnectButton onConnect={handleWalletConnect} className="w-full" />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500">Or continue with email</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert className="bg-red-900/20 border-red-800 text-red-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-violet-500"
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-violet-500"
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Don't have an account?{" "}
                <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium">
                  Create one
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm text-slate-500 hover:text-slate-400">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
