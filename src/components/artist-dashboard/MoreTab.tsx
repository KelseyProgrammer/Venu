"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Share2, TrendingUp } from "lucide-react"

interface EarningsData {
  totalEarnings: number
  goalAmount: number
  progressPercentage: number
  upcomingPayouts?: Array<{ date: string; eventName: string; amount: number; status: string }>
}

interface MoreTabProps {
  earningsData: EarningsData
  availableDates: string[]
  unavailableDates: string[]
  onClearAvailability: () => void
}

export const MoreTab = memo(function MoreTab({
  earningsData,
  availableDates,
  unavailableDates,
  onClearAvailability,
}: MoreTabProps) {
  return (
    <div className="p-4 space-y-6">
      <h2 className="font-serif font-bold text-xl">More</h2>

      {/* Earnings Tracker */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Earnings Tracker</h3>
        <Card className="p-6 bg-card border-border">
          <div className="text-center space-y-4">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">${earningsData.totalEarnings}</div>
                <div className="text-sm text-muted-foreground">of ${earningsData.goalAmount} goal</div>
                <div className="text-xs text-primary font-medium">
                  {Math.round(earningsData.progressPercentage)}%
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress to goal</span>
                  <span>{Math.round(Math.min(earningsData.progressPercentage, 100))}%</span>
                </div>
                <Progress value={Math.min(earningsData.progressPercentage, 100)} className="h-3" />
              </div>
            </div>
            {earningsData.upcomingPayouts && earningsData.upcomingPayouts.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Upcoming payouts</h3>
                <div className="space-y-1 text-sm">
                  {earningsData.upcomingPayouts.map((payout, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-muted-foreground">{payout.date} · {payout.eventName}</span>
                      <span className="text-green-400">${payout.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Promotion Tools */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Promotion Tools</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card border-border text-center">
            <Share2 className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium text-foreground mb-1">Share Gig</h3>
            <p className="text-xs text-muted-foreground">Auto-generated posts</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium text-foreground mb-1">Analytics</h3>
            <p className="text-xs text-muted-foreground">Track engagement</p>
          </Card>
        </div>
      </div>

      {/* Availability Management */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Availability Management</h3>
        <Card className="p-4 bg-card border-border">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-foreground">Current Availability Data</h4>
              <p className="text-sm text-muted-foreground">
                Your availability preferences are automatically saved and will persist across sessions.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <span className="text-muted-foreground">
                  {availableDates.length} Available Date{availableDates.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                </div>
                <span className="text-muted-foreground">
                  {unavailableDates.length} Unavailable Date{unavailableDates.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-border space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAvailability}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                Clear All Availability Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This will remove all your saved availability preferences. Use with caution.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
})
