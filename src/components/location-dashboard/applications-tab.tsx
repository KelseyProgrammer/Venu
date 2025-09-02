"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Star } from "lucide-react"
import Image from "next/image"
export function ApplicationsTab() {
  const artistApplications = useMemo(() => [
    {
      id: 1,
      artist: "The Midnight Keys",
      genre: "Rock",
      rating: 4.8,
      followers: "2.3K",
      bio: "High-energy rock band with a modern twist. Known for electrifying live performances and original compositions.",
      image: "/images/BandFallBack.PNG"
    },
    {
      id: 2,
      artist: "Jazz Collective",
      genre: "Jazz",
      rating: 4.6,
      followers: "1.8K",
      bio: "Smooth jazz ensemble bringing classic standards and contemporary arrangements to intimate venues.",
      image: "/images/BandFallBack.PNG"
    },
    {
      id: 3,
      artist: "Acoustic Dreams",
      genre: "Folk",
      rating: 4.7,
      followers: "3.1K",
      bio: "Intimate acoustic performances featuring original folk songs and beautiful harmonies.",
      image: "/images/BandFallBack.PNG"
    }
  ], [])

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
