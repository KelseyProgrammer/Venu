"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Star } from "lucide-react"
import Image from "next/image"
import { getArtistApplications } from "./data"

export function ApplicationsTab() {
  const artistApplications = useMemo(() => getArtistApplications(), [])

  return (
    <div className="space-y-4">
      <h2 className="font-serif font-bold text-xl">Artist Applications</h2>

      <div className="grid gap-4">
        {artistApplications.map((artist) => (
          <Card key={artist.id} className="p-4 bg-card border-border">
            <div className="flex items-start gap-4">
              <Image
                src={artist.image || "/images/BandFallBack.PNG"}
                alt={artist.artist}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{artist.artist}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {artist.genre}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-foreground">{artist.rating}</span>
                      </span>
                    </div>
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
                  <Button variant="default" size="sm" className="w-24 bg-purple-600 hover:bg-purple-700 text-white">
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
