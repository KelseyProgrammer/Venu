import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function GetStarted() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Get Started
        </h1>
        <p className="text-center text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Ready to begin your venue management journey? Follow these simple steps to get started.
        </p>
        
        <div className="space-y-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-2xl font-semibold mb-3">Step 1: Create Your Account</h3>
            <p className="text-muted-foreground">Sign up with your email and create your first venue profile.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-2xl font-semibold mb-3">Step 2: Add Your Venues</h3>
            <p className="text-muted-foreground">Input venue details, capacity, amenities, and availability.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-2xl font-semibold mb-3">Step 3: Start Managing</h3>
            <p className="text-muted-foreground">Begin accepting bookings and managing your venue operations.</p>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Sign Up Now
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
} 