"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function ChatTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Venue Chat</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Connected users only</span>
        </div>
      </div>

      {/* Chat Messages */}
      <Card className="h-96 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Sample messages - will be replaced with real chat data */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                V
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">Venue Manager</span>
                  <span className="text-xs text-muted-foreground">2:30 PM</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  Welcome to the venue chat! Only connected users can participate in this conversation.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 justify-end">
              <div className="flex-1 max-w-xs">
                <div className="flex items-center gap-2 mb-1 justify-end">
                  <span className="text-xs text-muted-foreground">2:32 PM</span>
                  <span className="font-medium text-sm">You</span>
                </div>
                <div className="bg-purple-600 text-white rounded-lg p-3 text-sm">
                  Thanks! Looking forward to connecting with other venue staff.
                </div>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                Y
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                D
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">Door Staff</span>
                  <span className="text-xs text-muted-foreground">2:35 PM</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  Ready for tonight&apos;s event! Everything looks good on our end.
                </div>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                className="flex-1"
                disabled
              />
              <Button 
                variant="default" 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled
              >
                Send
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Chat feature coming soon with Socket.io integration
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
