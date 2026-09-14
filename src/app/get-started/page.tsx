import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Get Started — VENU",
  description: "Book your first show on VENU in three steps.",
}

export default function GetStarted() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6 sm:p-12">
      <div className="z-10 max-w-3xl w-full text-center">
        <h1 className="font-serif text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Get Started
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          From empty calendar to sold-out show — booking live music on VENU takes three steps.
        </p>

        <div className="space-y-4 mb-12 text-left">
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-2xl font-semibold mb-2 text-foreground">1. Pick your role</h3>
            <p className="text-muted-foreground">
              Sign up as a venue, artist, promoter, or fan — each gets its own dashboard built
              around what you do.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-2xl font-semibold mb-2 text-foreground">2. Post or apply</h3>
            <p className="text-muted-foreground">
              Venues post open gigs with the date, genre, and ticket price. Artists discover them
              and apply to play — or get invited directly.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-2xl font-semibold mb-2 text-foreground">3. Play the show, get paid</h3>
            <p className="text-muted-foreground">
              Fans buy tickets, the door scans them in, and everyone&apos;s cut is agreed up front —
              no back-office math after the encore.
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/?view=signup">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
              Create Your Account
            </Button>
          </Link>
          <Link href="/learn-more">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
