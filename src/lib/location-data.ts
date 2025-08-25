// Standardized location data for consistent use across all dashboards
export const LOCATION_DATA = {
  "sarbez": {
    name: "Sarbez",
    address: "115 Anastasia Blvd, St. Augustine, FL 32080",
    image: "/images/SARBEZ.jpg",
    description: "Popular beachside location with great atmosphere and outdoor seating. Perfect for artists looking to connect with the local beach community."
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
    description: "Cozy cellar location with intimate atmosphere and excellent sound system. Perfect for acoustic and folk artists seeking an intimate setting."
  }
}

// Helper function to get location display name
export function getLocationDisplayName(locationKey: string): string {
  return LOCATION_DATA[locationKey as keyof typeof LOCATION_DATA]?.name || locationKey
}

// Helper function to get location address
export function getLocationAddress(locationKey: string): string {
  return LOCATION_DATA[locationKey as keyof typeof LOCATION_DATA]?.address || locationKey
}

// Helper function to get location image
export function getLocationImage(locationKey: string): string {
  return LOCATION_DATA[locationKey as keyof typeof LOCATION_DATA]?.image || "/images/venu-logo.png"
}

// Helper function to get location description
export function getLocationDescription(locationKey: string): string {
  return LOCATION_DATA[locationKey as keyof typeof LOCATION_DATA]?.description || ""
} 