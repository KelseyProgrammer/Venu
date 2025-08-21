import { SplashScreen } from "@/components/splash-screen"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      {/* Test div to verify Tailwind is working */}
      <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
        If you see this with red background and white text, Tailwind is working!
      </div>
      
      <SplashScreen />

      {/* Quick navigation for demo purposes */}
      <div className="fixed bottom-4 right-4 space-y-2">
        <Link href="/artist">
          <Button variant="outline" size="sm">
            Artist Dashboard
          </Button>
        </Link>
        <Link href="/venue">
          <Button variant="outline" size="sm">
            Venue Dashboard
          </Button>
        </Link>
        <Link href="/ticket/1">
          <Button variant="outline" size="sm">
            Ticket Purchase
          </Button>
        </Link>
        <Link href="/door">
          <Button variant="outline" size="sm">
            Door Scanner
          </Button>
        </Link>
      </div>
    </div>
  )
}
