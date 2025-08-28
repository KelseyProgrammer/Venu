export interface Band {
  id: string
  name: string
  genre: string
  setTime: string
  percentage: number
  email: string
  gigId?: string // Foreign key to gig
}

export interface Requirement {
  id: string
  text: string
  checked: boolean
}

export interface Gig {
  id?: string
  eventName: string
  eventDate: string
  eventTime: string
  eventGenre: string
  ticketCapacity: number
  ticketPrice: number // Price per ticket for bonus tier calculations
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
  status?: 'draft' | 'posted' | 'live' | 'completed'
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateGigRequest {
  eventName: string
  eventDate: string
  eventTime: string
  eventGenre: string
  ticketCapacity: number
  ticketPrice: number // Price per ticket for bonus tier calculations
  selectedLocation?: string
  selectedPromoter?: string
  promoterEmail?: string
  promoterPercentage?: number
  selectedDoorPerson: string
  doorPersonEmail: string
  requirements: Requirement[]
  bands: Band[]
  guarantee: number
  numberOfBands: number
}

export interface UpdateGigRequest extends Partial<CreateGigRequest> {
  id: string
}
