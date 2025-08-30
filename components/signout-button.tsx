"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { resetWalletState } from "@/hooks/use-wallet"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface SignOutButtonProps {
  variant?: "default" | "ghost" | "outline"
  className?: string
  children?: React.ReactNode
}

export function SignOutButton({ variant = "ghost", className = "", children = "Sign Out" }: SignOutButtonProps) {
  const { forceDisconnectWallet, isConnected } = useWallet()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    
    try {
      // First, disconnect the wallet if connected
      if (isConnected) {
        forceDisconnectWallet()
        // Give a small delay to ensure wallet state is cleared
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Also reset the complete wallet state to ensure clean logout
      resetWalletState()

      // Then proceed with Supabase signout
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/auth/signout'
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error("Error during signout:", error)
      setIsSigningOut(false)
    }
  }

  return (
    <Button 
      variant={variant} 
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={className}
    >
      {isSigningOut ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing Out...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
