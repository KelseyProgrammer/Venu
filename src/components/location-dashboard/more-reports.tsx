"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function MoreReports() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Reports</h3>
      
      <div className="grid gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">Monthly Revenue Report</h4>
              <p className="text-sm text-muted-foreground">Detailed breakdown of earnings and expenses</p>
            </div>
            <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              Download
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">Artist Performance Report</h4>
              <p className="text-sm text-muted-foreground">Attendance and satisfaction metrics by artist</p>
            </div>
            <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              Download
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">Event History</h4>
              <p className="text-sm text-muted-foreground">Complete list of past events and outcomes</p>
            </div>
            <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              View
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
