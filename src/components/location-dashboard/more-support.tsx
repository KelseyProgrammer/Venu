"use client"

import { Card } from "@/components/ui/card"
import { Users, MapPin, Star } from "lucide-react"

export function MoreSupport() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Support & Help</h3>
      
      <div className="grid gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Contact Support</h4>
              <p className="text-sm text-muted-foreground">Get help from our support team</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Venue Guidelines</h4>
              <p className="text-sm text-muted-foreground">Best practices for venue management</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Feature Requests</h4>
              <p className="text-sm text-muted-foreground">Suggest new features for the platform</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
