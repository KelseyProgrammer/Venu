// Standardized venue data for consistent use across all dashboards
export const VENUE_DATA = {
  "sarbez": {
    name: "Sarbez",
    address: "115 Anastasia Blvd, St. Augustine, FL 32080",
    image: "/images/SARBEZ.jpg",
    description: "Popular beachside venue with great atmosphere and outdoor seating. Perfect for artists looking to connect with the local beach community."
  },
  "muggys": {
    name: "Muggy's Bar",
    address: "213 W King St, St. Augustine, FL 32084",
    image: "/images/MUGS.jpeg",
    description: "Intimate downtown bar with excellent acoustics and a loyal local following. Great for artists wanting to build a fanbase in the historic district."
  },
  "alfreds": {
    name: "Alfred's Bar",
    address: "222 West King Street, St. Augustine, FL 32084",
    image: "/images/Alfreds.jpg",
    description: "Cozy cellar venue with intimate atmosphere and excellent sound system. Perfect for acoustic and folk artists seeking an intimate setting."
  }
}

// Helper function to get venue display name
export function getVenueDisplayName(venueKey: string): string {
  return VENUE_DATA[venueKey as keyof typeof VENUE_DATA]?.name || venueKey
}

// Helper function to get venue address
export function getVenueAddress(venueKey: string): string {
  return VENUE_DATA[venueKey as keyof typeof VENUE_DATA]?.address || venueKey
}

// Helper function to get venue image
export function getVenueImage(venueKey: string): string {
  return VENUE_DATA[venueKey as keyof typeof VENUE_DATA]?.image || "/images/venu-logo.png"
}

// Helper function to get venue description
export function getVenueDescription(venueKey: string): string {
  return VENUE_DATA[venueKey as keyof typeof VENUE_DATA]?.description || ""
} 