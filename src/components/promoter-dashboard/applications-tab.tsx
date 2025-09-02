"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Users, Star, Building2, Wifi, WifiOff } from "lucide-react"
import Image from "next/image"
import { usePromoterRealTime } from "@/hooks/usePromoterRealTime"

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
  const { gigUpdates, isConnected, error } = usePromoterRealTime({ 
    promoterId: "promoter-123", 
    selectedLocation: "all" 
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Artist Applications</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
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

      {/* Real-time Updates Section */}
      {gigUpdates.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Recent Updates</h3>
          </div>
          <div className="space-y-2">
            {gigUpdates.slice(0, 3).map((update, index) => (
              <div key={index} className="text-sm text-blue-700">
                <span className="font-medium">{update.updatedBy?.email || 'Unknown'}</span>
                {' '}updated application status for{' '}
                <span className="font-medium">
                  {String((update.gigData as Record<string, unknown>)?.name || 'gig')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

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
