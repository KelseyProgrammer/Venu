import { SplashScreen } from "@/components/splash-screen"
import Link from "next/link"
import { Button } from "@/components/ui/button"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <SplashScreen />

      


      {/* Quick navigation for demo purposes */}
      <div className="fixed bottom-4 right-4 space-y-2">
        <Link href="/demo">
          <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
            Multi-Profile Demo
          </Button>
        </Link>
        <Link href="/artist">
          <Button variant="outline" size="sm">
            Artist Dashboard
          </Button>
        </Link>
        <Link href="/location">
          <Button variant="outline" size="sm">
            Location Dashboard
          </Button>
        </Link>
        <Link href="/fan">
          <Button variant="outline" size="sm">
            Fan Dashboard
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
