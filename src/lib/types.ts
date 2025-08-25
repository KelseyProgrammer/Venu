export interface Band {
  id: string
  name: string
  genre: string
  setTime: string
  percentage: string
  email: string
}

export interface Requirement {
  id: string
  text: string
  checked: boolean
}

export interface Gig {
  eventName: string
  eventDate: string
  eventTime: string
  eventGenre: string
  ticketCapacity: string
  selectedLocation?: string
  selectedPromoter?: string
  promoterEmail?: string
  promoterPercentage?: string
  selectedDoorPerson: string
  doorPersonEmail: string
  requirements: Requirement[]
  bands: Band[]
  guarantee: string
  numberOfBands: number // New field for total expected bands
}

export interface PostedGig extends Gig {
  id: string
  status: 'draft' | 'posted' | 'live' | 'completed'
  createdAt: Date
  updatedAt: Date
}
