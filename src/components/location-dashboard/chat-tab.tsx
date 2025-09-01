"use client"

import { RealTimeChat } from "@/components/real-time-chat"

interface ChatTabProps {
  locationId: string;
  currentUserId?: string;
}

export function ChatTab({ locationId, currentUserId }: ChatTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Venue Chat</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Real-time communication</span>
        </div>
      </div>

      {/* Real-time Chat Component */}
      <RealTimeChat 
        locationId={locationId}
        currentUserId={currentUserId}
        className="h-[600px]"
      />
    </div>
  )
}

