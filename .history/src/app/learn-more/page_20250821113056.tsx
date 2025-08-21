import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LearnMore() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Learn More
        </h1>
        <p className="text-center text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover how Venu can transform your venue management experience with powerful features and intuitive design.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-2xl font-semibold mb-3">Smart Booking Management</h3>
            <p className="text-muted-foreground">Automated booking systems, calendar integration, and real-time availability updates.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-2xl font-semibold mb-3">Venue Analytics</h3>
            <p className="text-muted-foreground">Comprehensive insights into venue performance, booking patterns, and revenue optimization.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-2xl font-semibold mb-3">Multi-Venue Support</h3>
            <p className="text-muted-foreground">Manage multiple venues from a single dashboard with centralized control and reporting.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-2xl font-semibold mb-3">Customer Management</h3>
            <p className="text-muted-foreground">Built-in CRM features to manage client relationships and improve customer satisfaction.</p>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link href="/get-started">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </Link>
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