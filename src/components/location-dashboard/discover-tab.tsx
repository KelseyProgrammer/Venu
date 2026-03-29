"use client"

import { ArtistListing } from "../artist-listing"

export function DiscoverTab() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Discover Local Artists</h2>
      </div>
      <ArtistListing
        showSearch={true}
        showFilters={true}
        limit={12}
        onArtistSelect={(artist) => {
          console.log('Selected artist for booking:', artist)
        }}
      />
    </div>
  )
}
