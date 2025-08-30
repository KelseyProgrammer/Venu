"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Users, Star, Building2 } from "lucide-react"
import Image from "next/image"
import { getArtistApplications } from "./data"

export function ApplicationsTab() {
  const artistApplications = useMemo(() => getArtistApplications(), [])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Artist Applications</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select>
            <SelectTrigger className="w-32 bg-background">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {artistApplications.map((artist) => (
          <Card key={artist.id} className="p-4 bg-card border-border">
            <div className="flex gap-4">
              <Image
                src={artist.image || "/images/BandFallBack.PNG"}
                alt={artist.artist}
                width={60}
                height={60}
                className="rounded-lg object-cover w-15 h-15"
              />

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{artist.artist}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-foreground">{artist.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {artist.genre}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {artist.followers}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="w-24 bg-transparent">
                    Decline
                  </Button>
                  <Button variant="default" size="sm" className="w-24 bg-purple-600 hover:bg-purple-700 text-white">
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
