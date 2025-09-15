"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, MapPin, Music, X, Users, DollarSign, Instagram } from "lucide-react"
import Image from "next/image"
import { artistApi, ArtistProfile } from "@/lib/api"

interface ArtistListingProps {
  showSearch?: boolean
  showFilters?: boolean
  limit?: number
  genre?: string
  location?: string
  onArtistSelect?: (artist: ArtistProfile) => void
  className?: string
}

export function ArtistListing({
  showSearch = true,
  showFilters = true,
  limit = 10,
  genre,
  location,
  onArtistSelect,
  className = ""
}: ArtistListingProps) {
  const [artists, setArtists] = useState<ArtistProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState(genre || "all")
  const [selectedLocation, setSelectedLocation] = useState(location || "all")
  const [sortBy, setSortBy] = useState("rating")
  const [sortOrder, setSortOrder] = useState("desc")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>({})

  const genreOptions = [
    "jazz", "rock", "electronic", "folk", "blues", "pop", "country", "hip-hop", "classical", "reggae"
  ]

  const locationOptions = [
    "Downtown", "Midtown", "Uptown", "East Side", "West Side", "Suburbs", "University Area"
  ]

  // Load favorite counts for artists
  const loadFavoriteCounts = useCallback(async () => {
    try {
      const response = await artistApi.getFavoriteCounts()
      if (response.success && response.data) {
        const counts: Record<string, number> = {}
        response.data.forEach((item) => {
          counts[item.artistId] = item.fanCount
        })
        setFavoriteCounts(prev => ({ ...prev, ...counts }))
      }
    } catch (err) {
      console.error('Error loading favorite counts:', err)
    }
  }, [])

  // Load artists based on current filters
  const loadArtists = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(true)
      setError(null)

      let response
      
      if (searchQuery.trim()) {
        // Search artists
        response = await artistApi.searchArtists(searchQuery.trim(), pageNum, limit)
      } else if (selectedGenre && selectedGenre !== "all") {
        // Filter by genre
        response = await artistApi.getArtistsByGenre(selectedGenre, pageNum, limit)
      } else if (selectedLocation && selectedLocation !== "all") {
        // Filter by location
        response = await artistApi.getArtistsByLocation(selectedLocation, pageNum, limit)
      } else {
        // Get all artists with filters
        const params: {
          page?: number;
          limit?: number;
          genre?: string;
          location?: string;
          sortBy?: string;
          sortOrder?: string;
        } = {
          page: pageNum,
          limit,
          sortBy,
          sortOrder
        };
        
        if (selectedGenre !== "all") {
          params.genre = selectedGenre;
        }
        
        if (selectedLocation !== "all") {
          params.location = selectedLocation;
        }
        
        response = await artistApi.getAllArtists(params);
      }

      if (response.success && response.data) {
        if (reset) {
          setArtists(response.data)
        } else {
          setArtists(prev => [...prev, ...response.data!])
        }
        
        setHasMore(response.pagination ? pageNum < response.pagination.totalPages : false)
        
        // Load favorite counts for the loaded artists
        await loadFavoriteCounts()
      } else {
        setError(response.error || 'Failed to load artists')
      }
    } catch (err) {
      console.error('Error loading artists:', err)
      setError(err instanceof Error ? err.message : 'Failed to load artists')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedGenre, selectedLocation, sortBy, sortOrder, limit, loadFavoriteCounts])

  // Load artists on mount and when filters change
  useEffect(() => {
    setPage(1)
    loadArtists(1, true)
  }, [searchQuery, selectedGenre, selectedLocation, sortBy, sortOrder, loadArtists])

  // Load more artists
  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadArtists(nextPage, false)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedGenre("all")
    setSelectedLocation("all")
    setSortBy("rating")
    setSortOrder("desc")
  }

  // Filtered artists for display
  const filteredArtists = useMemo(() => {
    return artists.filter(artist => {
      if (searchQuery && !artist.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !artist.bio.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    })
  }, [artists, searchQuery])

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <Card className="p-6 bg-card border-border text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => loadArtists(1, true)} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Card className="p-4 bg-card border-border">
          <div className="space-y-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground"
                />
              </div>
            )}

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Genre</label>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="All genres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All genres</SelectItem>
                      {genreOptions.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {locationOptions.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Sort by</label>
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [newSortBy, newSortOrder] = value.split('-')
                    setSortBy(newSortBy)
                    setSortOrder(newSortOrder)
                  }}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating-desc">Rating (High to Low)</SelectItem>
                      <SelectItem value="rating-asc">Rating (Low to High)</SelectItem>
                      <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                      <SelectItem value="totalGigs-desc">Most Gigs</SelectItem>
                      <SelectItem value="totalGigs-asc">Least Gigs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {(searchQuery || (selectedGenre && selectedGenre !== "all") || (selectedLocation && selectedLocation !== "all")) && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear Filters
                </Button>
                <span className="text-sm text-muted-foreground">
                  {filteredArtists.length} artist{filteredArtists.length !== 1 ? 's' : ''} found
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Artists Grid */}
      {loading && artists.length === 0 ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 bg-card border-border animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredArtists.map((artist) => (
            <ArtistCard
              key={artist._id}
              artist={artist}
              onSelect={onArtistSelect || (() => {})}
              favoriteCount={favoriteCounts[artist._id]}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            variant="outline"
            disabled={loading}
            className="bg-transparent border-border text-foreground hover:bg-accent"
          >
            {loading ? "Loading..." : "Load More Artists"}
          </Button>
        </div>
      )}

      {/* Loading indicator for load more */}
      {loading && artists.length > 0 && (
        <div className="text-center">
          <p className="text-muted-foreground">Loading more artists...</p>
        </div>
      )}

      {/* No results */}
      {!loading && filteredArtists.length === 0 && (
        <Card className="p-8 bg-card border-border text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No artists found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to find more artists.
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  )
}

// Individual Artist Card Component
interface ArtistCardProps {
  artist: ArtistProfile
  onSelect?: (artist: ArtistProfile) => void
  favoriteCount?: number
}

function ArtistCard({ artist, onSelect, favoriteCount }: ArtistCardProps) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(artist)
    }
  }

  return (
    <Card 
      className="p-4 bg-card border-border hover:bg-accent/5 transition-colors cursor-pointer"
      onClick={handleSelect}
    >
      <div className="flex items-start gap-4">
        <Image
          src="/images/BandFallBack.PNG"
          alt={artist.name}
          width={80}
          height={80}
          className="rounded-lg object-cover"
        />
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{artist.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {artist.genre[0]?.charAt(0).toUpperCase() + artist.genre[0]?.slice(1) || 'Unknown'}
                </Badge>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-foreground">{artist.rating.toFixed(1)}</span>
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
              {favoriteCount ? `${favoriteCount} fans` : '0 fans'}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {artist.priceRange}
            </span>
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
              Available
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>

          {/* Social Media Links */}
          <div className="flex items-center gap-4 pt-2 pb-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Instagram className="w-4 h-4" />
              <a 
                href={`https://instagram.com/${artist.instagram?.replace('@', '') || 'artist'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 hover:underline"
              >
                {artist.instagram || '@artist'}
              </a>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Music className="w-4 h-4" />
              <div className="flex gap-2">
                <a 
                  href={artist.spotify || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  Spotify
                </a>
                <span className="text-muted-foreground">•</span>
                <a 
                  href={artist.appleMusic || '#'}
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
  )
}
