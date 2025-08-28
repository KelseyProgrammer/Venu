"use client"

import { Button } from "@/components/ui/button"

interface GenreFiltersProps {
  selectedGenre: string
  onGenreChange: (genre: string) => void
}

const GENRES = [
  "All Genres",
  "Jazz", 
  "Rock", 
  "Electronic", 
  "Folk", 
  "Blues"
] as const

export function GenreFilters({ selectedGenre, onGenreChange }: GenreFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {GENRES.map((genre) => (
        <Button
          key={genre}
          variant={selectedGenre === genre ? "purple" : "outline"}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => onGenreChange(genre)}
        >
          {genre}
        </Button>
      ))}
    </div>
  )
}
