import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/VENUDONE.png"
            alt="Venu Logo"
            width={120}
            height={120}
            priority
            className="rounded-lg shadow-lg"
          />
        </div>
        
        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Venu
        </h1>
        <p className="text-center text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your modern venue management platform built with Next.js and shadcn/ui
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/get-started">
            <Button size="lg">
              Get Started
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