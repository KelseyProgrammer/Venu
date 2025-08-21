"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, CheckCircle, XCircle, Users, TrendingUp } from "lucide-react"

export function DoorScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<{ name: string; status: "valid" | "invalid" } | null>(null)

  // Mock event data
  const event = {
    name: "The Midnight Keys",
    venue: "The Blue Note",
    date: "Sat, Oct 12",
    time: "8 PM",
    checkedIn: 47,
    totalTickets: 75,
    currentTier: { threshold: 50, amount: 400 },
    nextTier: { threshold: 75, amount: 600 },
  }

  const progress = (event.checkedIn / event.totalTickets) * 100
  const tierProgress = (event.checkedIn / event.nextTier.threshold) * 100

  const handleScan = () => {
    setIsScanning(true)
    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false)
      setLastScan({ name: "Alex Johnson", status: "valid" })
      // In real app, this would update the check-in count
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif font-bold text-xl text-foreground mb-2">Door Check-in</h1>
        <div className="text-sm text-muted-foreground">
          <p>
            {event.name} at {event.venue}
          </p>
          <p>
            {event.date} - {event.time}
          </p>
        </div>
      </div>

      {/* Live Stats */}
      <Card className="p-6 bg-card border-border mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Live Check-ins</h3>
            <Badge className="bg-green-600 text-white">
              <Users className="w-3 h-3 mr-1" />
              {event.checkedIn} / {event.totalTickets}
            </Badge>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{event.checkedIn} checked in</span>
              <span>{event.totalTickets - event.checkedIn} remaining</span>
            </div>
          </div>

          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Payout Tier Progress</span>
            </div>
            <div className="space-y-2">
              <Progress value={tierProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {event.nextTier.threshold - event.checkedIn} more check-ins to reach ${event.nextTier.amount} payout
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Scanner Interface */}
      <Card className="p-6 bg-card border-border mb-6">
        <div className="text-center space-y-4">
          <h3 className="font-semibold text-foreground">QR Code Scanner</h3>

          <div className="relative">
            <div className="w-48 h-48 mx-auto border-2 border-dashed border-primary rounded-lg flex items-center justify-center bg-primary/5">
              {isScanning ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-primary">Scanning...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Align QR code with frame</p>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isScanning ? "Scanning..." : "Scan QR Code"}
          </Button>
        </div>
      </Card>

      {/* Last Scan Result */}
      {lastScan && (
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            {lastScan.status === "valid" ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <div className="flex-1">
              <p className="font-medium text-foreground">{lastScan.name}</p>
              <p className="text-sm text-muted-foreground">
                {lastScan.status === "valid" ? "Entry approved" : "Invalid ticket"}
              </p>
            </div>
            <Badge variant={lastScan.status === "valid" ? "default" : "destructive"}>
              {lastScan.status === "valid" ? "Valid" : "Invalid"}
            </Badge>
          </div>
        </Card>
      )}
    </div>
  )
}
