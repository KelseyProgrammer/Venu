"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Star, MapPin, Instagram, Music } from "lucide-react"
import Image from "next/image"
import { ArtistListing } from "../artist-listing"
// import { LocalArtist } from "./types"

export function DiscoverTab() {
  const localArtists = useMemo(() => [
    {
      id: 1,
      artist: "The Midnight Keys",
      genre: "Rock",
      rating: 4.8,
      location: "St. Augustine, FL",
      followers: "2.3K",
      priceRange: "$200-400",
      availability: "Available",
      bio: "High-energy rock band with a modern twist. Known for electrifying live performances and original compositions.",
      image: "/images/BandFallBack.PNG",
      instagram: "@midnightkeys",
      spotify: "The Midnight Keys"
    },
    {
      id: 2,
      artist: "Jazz Collective",
      genre: "Jazz",
      rating: 4.6,
      location: "Jacksonville, FL",
      followers: "1.8K",
      priceRange: "$150-300",
      availability: "Available",
      bio: "Smooth jazz ensemble bringing classic standards and contemporary arrangements to intimate venues.",
      image: "/images/BandFallBack.PNG",
      instagram: "@jazzcollective",
      spotify: "Jazz Collective"
    },
    {
      id: 3,
      artist: "Acoustic Dreams",
      genre: "Folk",
      rating: 4.7,
      location: "St. Augustine, FL",
      followers: "3.1K",
      priceRange: "$100-250",
      availability: "Available",
      bio: "Intimate acoustic performances featuring original folk songs and beautiful harmonies.",
      image: "/images/BandFallBack.PNG",
      instagram: "@acousticdreams",
      spotify: "Acoustic Dreams"
    }
  ], [])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Discover Local Artists</h2>
      </div>

      <div className="grid gap-4">
        {localArtists.map((artist) => (
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
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm text-foreground">{artist.location}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {artist.followers}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {artist.priceRange}
                  </span>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                    {artist.availability}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>

                {/* Social Media Links */}
                <div className="flex items-center gap-4 pt-2 pb-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Instagram className="w-4 h-4" />
                    <a 
                      href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      {artist.instagram}
                    </a>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Music className="w-4 h-4" />
                    <div className="flex gap-2">
                      <a 
                        href={artist.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 hover:underline"
                      >
                        Spotify
                      </a>
                      <span className="text-muted-foreground">•</span>
                      <a 
                        href={artist.appleMusic}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gray-200 hover:underline"
                      >
                        Apple Music
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="default" size="sm" className="w-28 bg-purple-600 hover:bg-purple-700 text-white">
                    View Details
                  </Button>
                  <Button variant="default" size="sm" className="w-20 bg-purple-600 hover:bg-purple-700 text-white">
                    Book
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ArtistListing 
        showSearch={true}
        showFilters={true}
        limit={8}
        onArtistSelect={(artist) => {
          // Handle artist selection - could open booking modal
          console.log('Selected artist for booking:', artist)
        }}
      />
    </div>
  )
}
