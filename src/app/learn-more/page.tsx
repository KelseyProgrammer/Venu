import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Learn More — VENU",
  description: "How VENU connects venues, artists, promoters, and fans around live music.",
}

export default function LearnMore() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6 sm:p-12">
      <div className="z-10 max-w-4xl w-full text-center">
        <h1 className="font-serif text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Learn More
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          VENU is the transparent booking platform for live music — one place where venues,
          artists, promoters, and fans make shows happen.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12 text-left">
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-2xl font-semibold mb-2 text-foreground">Two-way gig discovery</h3>
            <p className="text-muted-foreground">
              Venues post open slots and browse local artists by genre; artists find gigs that fit
              and apply in one tap.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-2xl font-semibold mb-2 text-foreground">Transparent payouts</h3>
            <p className="text-muted-foreground">
              Set splits, guarantees, and ticket-sales bonus tiers before the show — every band
              sees the same numbers you do.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-2xl font-semibold mb-2 text-foreground">Tickets and the door</h3>
            <p className="text-muted-foreground">
              Fans buy QR tickets in the app, and your door person scans them in with a phone —
              no printed lists, no clipboard.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-2xl font-semibold mb-2 text-foreground">Real-time everything</h3>
            <p className="text-muted-foreground">
              Applications, confirmations, ticket counts, and venue chat update live, so nobody
              books a show over voicemail.
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/get-started">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
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
