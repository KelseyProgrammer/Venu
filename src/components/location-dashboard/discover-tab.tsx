"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArtistListing } from "../artist-listing"
import { gigApi, ArtistProfile, GigProfile } from "@/lib/api"

interface DiscoverTabProps {
  gigs: GigProfile[]
}

export function DiscoverTab({ gigs }: DiscoverTabProps) {
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null)
  const [selectedGigId, setSelectedGigId] = useState<string>("")
  const [inviteState, setInviteState] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [inviteError, setInviteError] = useState("")

  const openGigs = gigs.filter(g =>
    (g.status === "posted" || g.status === "pending-confirmation") &&
    g.numberOfBands - g.bands.filter(b => b.confirmed).length > 0
  )

  function handleArtistSelect(artist: ArtistProfile) {
    setSelectedArtist(artist)
    setSelectedGigId("")
    setInviteState("idle")
    setInviteError("")
  }

  function handleClose() {
    setSelectedArtist(null)
    setInviteState("idle")
    setInviteError("")
  }

  async function handleInvite() {
    if (!selectedArtist || !selectedGigId) return
    setInviteState("sending")
    const res = await gigApi.inviteArtist(selectedGigId, selectedArtist.email)
    if (res.success) {
      setInviteState("sent")
    } else {
      setInviteError(res.error || "Failed to send invite")
      setInviteState("error")
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Discover Local Artists</h2>
      </div>

      <ArtistListing
        showSearch={true}
        showFilters={true}
        limit={12}
        onArtistSelect={handleArtistSelect}
      />

      <Dialog open={!!selectedArtist} onOpenChange={(open) => { if (!open) handleClose() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite {selectedArtist?.name}</DialogTitle>
            <DialogDescription>
              Select one of your open gigs to invite this artist to perform.
            </DialogDescription>
          </DialogHeader>

          {inviteState === "sent" ? (
            <div className="py-4 text-center space-y-3">
              <p className="text-green-600 font-medium">Invite sent!</p>
              <p className="text-sm text-muted-foreground">{selectedArtist?.name} will receive a notification and email to confirm.</p>
              <Button onClick={handleClose} className="bg-purple-600 hover:bg-purple-700 text-white">Done</Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {openGigs.length === 0 ? (
                <p className="text-sm text-muted-foreground">You have no posted gigs with open slots. Post a gig first.</p>
              ) : (
                <>
                  <Select value={selectedGigId} onValueChange={setSelectedGigId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a gig..." />
                    </SelectTrigger>
                    <SelectContent>
                      {openGigs.map(g => {
                        const date = new Date(g.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        const openSlots = g.numberOfBands - g.bands.filter(b => b.confirmed).length
                        return (
                          <SelectItem key={g._id} value={g._id}>
                            {g.eventName} — {date} ({openSlots} slot{openSlots !== 1 ? "s" : ""} open)
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  {inviteState === "error" && (
                    <p className="text-sm text-red-500">{inviteError}</p>
                  )}

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!selectedGigId || inviteState === "sending"}
                      onClick={handleInvite}
                    >
                      {inviteState === "sending" ? "Sending..." : "Send Invite"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
