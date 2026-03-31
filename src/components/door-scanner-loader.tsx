"use client"

import { useSearchParams } from 'next/navigation'
import { DoorScanner } from './door-scanner'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export function DoorScannerLoader() {
  const params = useSearchParams()
  const gigId = params.get('gigId')

  if (!gigId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 max-w-sm w-full text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <h2 className="font-serif font-bold text-xl">No event selected</h2>
          <p className="text-sm text-muted-foreground">
            This link is missing an event ID. Ask the event organiser to share the correct door-scanner link.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Expected: /door?gigId=&lt;id&gt;
          </p>
        </Card>
      </div>
    )
  }

  return <DoorScanner gigId={gigId} />
}
