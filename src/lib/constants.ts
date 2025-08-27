// Shared constants for form options across all dashboards

export const TIME_OPTIONS = [
  { value: "19:00", label: "7:00 PM - Doors Open" },
  { value: "19:30", label: "7:30 PM - First Act" },
  { value: "20:00", label: "8:00 PM" },
  { value: "20:30", label: "8:30 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "21:30", label: "9:30 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "22:30", label: "10:30 PM" },
  { value: "23:00", label: "11:00 PM" },
  { value: "23:30", label: "11:30 PM" },
  { value: "00:00", label: "12:00 AM - Midnight" },
  { value: "00:30", label: "12:30 AM" },
  { value: "01:00", label: "1:00 AM" },
]

export const GENRE_OPTIONS = [
  { value: "jazz", label: "Jazz" },
  { value: "rock", label: "Rock" },
  { value: "electronic", label: "Electronic" },
  { value: "folk", label: "Folk" },
  { value: "blues", label: "Blues" },
  { value: "pop", label: "Pop" },
  { value: "country", label: "Country" },
  { value: "hip-hop", label: "Hip-Hop" },
  { value: "classical", label: "Classical" },
  { value: "reggae", label: "Reggae" }
]

// Helper function for time labels
export const getTimeLabel = (timeValue: string): string => {
  return TIME_OPTIONS.find(option => option.value === timeValue)?.label || timeValue
}

// Step configuration for gig posting forms
export const GIG_STEPS = [
  { id: 1, title: "Event Details", description: "Basic event information" },
  { id: 2, title: "Lineup", description: "Bands and scheduling" },
  { id: 3, title: "Payout", description: "Financial structure" },
  { id: 4, title: "Staff & Requirements", description: "Team and artist needs" },
  { id: 5, title: "Review", description: "Final review and publish" }
]
