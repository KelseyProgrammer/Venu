export interface Band {
  id?: string
  name: string
  genre: string
  setTime: string
  percentage: number
  email: string
}

export interface Requirement {
  id: string
  text: string
  checked: boolean
}

export interface Gig {
  id?: string
  _id?: string
  eventName: string
  eventDate: string
  eventTime: string
  eventGenre: string
  ticketCapacity: number
  ticketPrice: number // Price per ticket for bonus tier calculations
  ticketsSold?: number
  selectedLocation?: string
  selectedPromoter?: string
  promoterEmail?: string
  promoterPercentage?: number
  selectedDoorPerson: string
  doorPersonEmail: string
  requirements: Requirement[]
  bands: Band[]
  guarantee: number
  numberOfBands: number // New field for total expected bands
  image?: string
  status?: 'draft' | 'posted' | 'live' | 'completed'
  rating?: number
  tags?: string[]
  bonusTiers?: {
    tier1: { amount: number; threshold: number; color: string }
    tier2: { amount: number; threshold: number; color: string }
    tier3: { amount: number; threshold: number; color: string }
  }
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface PostedGig extends Gig {
  id: string
  status: 'draft' | 'posted' | 'live' | 'completed'
  createdAt: Date
  updatedAt: Date
}
