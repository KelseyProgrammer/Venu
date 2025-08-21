"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { OnboardingFlow } from "./onboarding-flow"
import { AuthFlow } from "./auth-flow"
import Image from "next/image"

export function SplashScreen() {
  const [currentView, setCurrentView] = useState<"splash" | "onboarding" | "auth">("splash")

  if (currentView === "onboarding") {
    return <OnboardingFlow onComplete={() => setCurrentView("auth")} />
  }

  if (currentView === "auth") {
    return <AuthFlow />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background stage lighting effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-accent/40 rounded-full blur-2xl" />
      <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-secondary/25 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/images/venu-logo.png" alt="Venu Logo" width={120} height={120} className="rounded-2xl" />
        </div>

        {/* Brand tagline */}
        <h1 className="font-serif font-black text-3xl mb-4 text-foreground">venu</h1>
        <p className="text-lg text-muted-foreground mb-2 font-medium">The Transparent Booking Platform</p>
        <p className="text-base text-muted-foreground mb-12 leading-relaxed">for Live Music</p>

        {/* Action buttons */}
        <div className="w-full space-y-4">
          <Button
            onClick={() => setCurrentView("onboarding")}
            className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
          >
            Get Started
          </Button>

          <Button
            onClick={() => setCurrentView("auth")}
            variant="outline"
            className="w-full h-12 text-base font-medium border-border hover:bg-accent/10"
          >
            Log In
          </Button>
        </div>

        {/* Trust indicator */}
        <p className="text-xs text-muted-foreground mt-8 opacity-75">Secure payments powered by escrow</p>
      </div>
    </div>
  )
}
