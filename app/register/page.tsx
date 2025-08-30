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
import { Ticket, ArrowLeft, Loader2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Separator } from "@/components/ui/separator"
import { WalletConnectButton } from "@/components/wallet-connect-button"

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    displayName: z
      .string()
      .min(2, "Display name must be at least 2 characters")
      .max(50, "Display name must be less than 50 characters")
      .regex(/^[a-zA-Z0-9\s_-]+$/, "Display name can only contain letters, numbers, spaces, underscores, and hyphens"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/check-email`,
          data: {
            display_name: data.displayName,
          },
        },
      })

      if (authError) {
        if (authError.message.includes("already registered") || authError.message.includes("already been registered")) {
          setError("This email is already registered. Please use a different email or try signing in.")
        } else if (authError.message.includes("invalid")) {
          setError("Please enter a valid email address.")
        } else {
          setError("Registration failed. Please try again.")
        }
        return
      }

      if (authData.user) {
        router.push("/auth/check-email")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async (address: string) => {
    try {
      // Check if wallet is already registered
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", address)
        .single()

      if (existingProfile) {
        setError("This wallet address is already registered. Please use a different wallet or sign in.")
        return
      }

      // For now, just show a message that they need to complete registration with email
      setError("Wallet connected! Please complete registration with your email and password below.")
    } catch (err) {
      console.error("Wallet registration error:", err)
      setError("Failed to connect wallet. Please try again.")
    }
  }

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
            <CardTitle className="text-2xl text-slate-100">Create Your Account</CardTitle>
            <CardDescription className="text-slate-400">
              Connect your wallet or enter your email to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <WalletConnectButton onConnect={handleWalletConnect} className="w-full" />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500">Or register with email</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert
                  className={`${error.includes("successful") ? "bg-green-900/20 border-green-800 text-green-300" : "bg-red-900/20 border-red-800 text-red-300"}`}
                >
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
                  placeholder="your.email@example.com"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-violet-500"
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
                <p className="text-xs text-slate-500">We'll send you a confirmation email to verify your account.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-slate-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your display name"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-violet-500"
                  {...register("displayName")}
                />
                {errors.displayName && <p className="text-sm text-red-400">{errors.displayName.message}</p>}
                <p className="text-xs text-slate-500">This is how your name will appear to other users.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-violet-500"
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-violet-500"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
