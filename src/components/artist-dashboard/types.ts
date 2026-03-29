// Shared types for artist dashboard sub-components

export interface Gig {
  id: number
  location: string
  address: string
  date: string
  time: string
  genre: string
  guarantee: number
  ticketPrice: number
  tier1: { amount: number; threshold: number; color: string }
  tier2: { amount: number; threshold: number; color: string }
  tier3: { amount: number; threshold: number; color: string }
  ticketsSold: number
  totalTickets: number
  rating: number
  requirements: string[]
  image: string
  bands: Array<{
    id: string
    name: string
    genre: string
    setTime: string
    percentage: number
    email: string
    guarantee: number
  }>
}

export interface Booking {
  id: number
  location: string
  date: string
  time: string
  status: "confirmed" | "pending" | "completed" | "awaiting-confirmation"
  ticketsSold: number
  totalTickets: number
  earnings: number
  image: string
  gigId?: string
  eventName?: string
  genre?: string
  artistSetTime?: string
  artistPercentage?: number
  artistGuarantee?: number
  isPast?: boolean
  confirmedBands?: number
  expectedBands?: number
}
