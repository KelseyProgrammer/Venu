export interface Promoter {
  id: string;
  name: string;
  email: string;
  payoutPercentage: string;
}

export interface DoorPerson {
  id: string;
  name: string;
  email: string;
}

export interface Band {
  id: string;
  name: string;
  genre: string;
  setTime: string;
  percentage: string;
  email: string;
}

export interface Requirement {
  id: string;
  text: string;
  checked: boolean;
}

export interface Event {
  id: number;
  artist: string;
  date: string;
  time: string;
  genre: string;
  ticketsSold: number;
  totalTickets: number;
  guarantee: number;
  currentEarnings: number;
  status: string;
  applications: number;
  image: string;
  expectedBands: number;
  confirmedBands: number;
}

export interface ArtistApplication {
  id: string;
  artist: string;
  genre: string;
  rating: number;
  followers: string;
  bio: string;
  image: string;
}

export interface LocalArtist {
  id: string;
  artist: string;
  genre: string;
  rating: number;
  followers: string;
  bio: string;
  image: string;
  location: string;
  priceRange: string;
  availability: string;
  instagram: string;
  spotify: string;
  appleMusic: string;
}

export interface MockPromoter {
  id: string;
  name: string;
  location: string;
  type: string;
  eventsCount: number;
  revenue: string;
  image: string;
}
