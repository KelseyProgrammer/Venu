"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2, Plus } from "lucide-react"
import { getMyLocations, getChatMessages } from "./data"

interface ChatTabProps {
  selectedLocation: string;
}

export function ChatTab({ selectedLocation }: ChatTabProps) {
  const myLocations = getMyLocations()
  const chatMessages = getChatMessages()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Venue Chat</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {selectedLocation === "all" ? "All Venues" : myLocations.find(v => v.id === selectedLocation)?.name}
          </Badge>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-4">
        <Card className="p-4 bg-card border-border">
          <div className="space-y-4">
            {selectedLocation === "all" ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Select a Venue</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a specific venue from the location filter to view venue-specific chat messages.
                </p>
              </div>
            ) : (
              <>
                {/* Sample Chat Messages */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">JD</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">John Doe</span>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-sm text-foreground">
                          Hey! Just wanted to confirm the sound check time for tomorrow&apos;s jazz night. 
                          Can we get in at 6 PM?
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 max-w-xs">
                      <div className="flex items-center gap-2 mb-1 justify-end">
                        <span className="text-xs text-muted-foreground">1 hour ago</span>
                        <span className="text-sm font-medium text-foreground">You</span>
                      </div>
                      <div className="bg-purple-600 text-white rounded-lg p-3">
                        <p className="text-sm">
                          Absolutely! 6 PM works perfectly. The sound system will be ready and tested by then.
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">P</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">SM</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">Sarah Manager</span>
                        <span className="text-xs text-muted-foreground">30 minutes ago</span>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-sm text-foreground">
                          Thanks for the quick response! Also, we have a new artist interested in 
                          playing next month. Should I send you their demo?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-border pt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      className="flex-1 bg-background"
                    />
                    <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Recent Conversations */}
        {selectedLocation !== "all" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Recent Conversations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 1,
                  name: "The Blue Note Team",
                  lastMessage: "Sound check confirmed for 6 PM",
                  time: "2 hours ago",
                  unread: 0,
                },
                {
                  id: 2,
                  name: "Electric Factory Staff",
                  lastMessage: "New artist demo ready for review",
                  time: "1 day ago",
                  unread: 2,
                },
                {
                  id: 3,
                  name: "The Basement Crew",
                  lastMessage: "Equipment list updated",
                  time: "3 days ago",
                  unread: 0,
                },
              ].map((conversation) => (
                <Card key={conversation.id} className="p-4 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{conversation.name}</h4>
                        {conversation.unread > 0 && (
                          <Badge variant="default" className="bg-purple-600 text-white text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{conversation.lastMessage}</p>
                      <span className="text-xs text-muted-foreground">{conversation.time}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
