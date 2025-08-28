"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calculateBandBonusTiers, getCurrentBandTier } from "@/lib/bonus-tiers"

export function BonusTierDemo() {
  const [bandGuarantee, setBandGuarantee] = useState("200")
  const [bandPercentage, setBandPercentage] = useState("60")
  const [ticketPrice, setTicketPrice] = useState("25")
  const [totalTickets, setTotalTickets] = useState("100")
  const [ticketsSold, setTicketsSold] = useState("50")

  const guarantee = parseFloat(bandGuarantee) || 0
  const percentage = parseFloat(bandPercentage) || 0
  const price = parseFloat(ticketPrice) || 0
  const total = parseInt(totalTickets) || 0
  const sold = parseInt(ticketsSold) || 0

  const tiers = calculateBandBonusTiers(guarantee, percentage, price, total, sold)
  // Calculate current earnings based on tickets sold and band percentage
  const currentEarnings = guarantee + (price * sold * (percentage / 100))

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Dynamic Bonus Tier Calculator</h1>
        <p className="text-muted-foreground">
          See how bonus tiers are calculated using: <strong>Band Guarantee + (Ticket Price × Tickets Sold × Band Percentage)</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Event Parameters</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="guarantee">Band Guarantee ($)</Label>
              <Input
                id="guarantee"
                type="number"
                value={bandGuarantee}
                onChange={(e) => setBandGuarantee(e.target.value)}
                placeholder="200"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum guaranteed payment (even if 0)
              </p>
            </div>

            <div>
              <Label htmlFor="percentage">Band Percentage (%)</Label>
              <Input
                id="percentage"
                type="number"
                value={bandPercentage}
                onChange={(e) => setBandPercentage(e.target.value)}
                placeholder="60"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Band&apos;s share of ticket revenue
              </p>
            </div>

            <div>
              <Label htmlFor="ticketPrice">Ticket Price ($)</Label>
              <Input
                id="ticketPrice"
                type="number"
                step="0.01"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                placeholder="25.00"
              />
            </div>

            <div>
              <Label htmlFor="totalTickets">Total Ticket Capacity</Label>
              <Input
                id="totalTickets"
                type="number"
                value={totalTickets}
                onChange={(e) => setTotalTickets(e.target.value)}
                placeholder="100"
              />
            </div>

            <div>
              <Label htmlFor="ticketsSold">Tickets Sold</Label>
              <Input
                id="ticketsSold"
                type="number"
                value={ticketsSold}
                onChange={(e) => setTicketsSold(e.target.value)}
                placeholder="50"
              />
            </div>
          </div>
        </Card>

        {/* Results Display */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bonus Tier Results</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Current Earnings</div>
              <div className="text-2xl font-bold">${Math.round(currentEarnings)}</div>
              <div className="text-xs text-muted-foreground">
                {guarantee} + ({price} × {sold} × {percentage}%) = {guarantee} + {price * sold * (percentage / 100)}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Bonus Tiers</h3>
              {tiers.map((tier, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${tier.color}`} />
                    <div>
                      <div className="font-medium">{tier.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {tier.threshold === 0 ? "Base guarantee" : `${tier.threshold}+ tickets`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${tier.amount}</div>
                    {tier.threshold > 0 && (
                      <div className="text-xs text-muted-foreground">
                        +${tier.amount - guarantee}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How It Works</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• <strong>Base:</strong> Band gets their guarantee regardless of sales</div>
                <div>• <strong>Bonus:</strong> Additional earnings based on actual ticket sales</div>
                <div>• <strong>Formula:</strong> Guarantee + (Price × Sold × Percentage)</div>
                <div>• <strong>Fair:</strong> Bands earn more when events perform better</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Example Scenarios */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Example Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Low Sales (25 tickets)</h3>
            <div className="text-sm space-y-1">
              <div>Guarantee: $200</div>
              <div>Bonus: $200 × 25 × 60% = $300</div>
              <div className="font-medium">Total: $500</div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Medium Sales (50 tickets)</h3>
            <div className="text-sm space-y-1">
              <div>Guarantee: $200</div>
              <div>Bonus: $200 × 50 × 60% = $600</div>
              <div className="font-medium">Total: $800</div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">High Sales (100 tickets)</h3>
            <div className="text-sm space-y-1">
              <div>Guarantee: $200</div>
              <div>Bonus: $200 × 100 × 60% = $1,200</div>
              <div className="font-medium">Total: $1,400</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
