export interface BonusTier {
  threshold: number
  amount: number
  color: string
  name: string
  label: string
}

export interface BandBonusCalculation {
  bandId: string
  bandName: string
  guarantee: number
  percentage: number
  tiers: BonusTier[]
  currentTier: BonusTier
  currentEarnings: number
}

/**
 * Calculate dynamic bonus tiers for a band based on:
 * - Band's guarantee (even if 0)
 * - Cost of ticket × total tickets sold × band's percentage
 */
export function calculateBandBonusTiers(
  bandGuarantee: number,
  bandPercentage: number,
  ticketPrice: number,
  totalTickets: number,
  ticketsSold: number
): BonusTier[] {
  // Input validation
  if (bandGuarantee < 0 || bandPercentage < 0 || bandPercentage > 100 || ticketPrice < 0 || totalTickets < 0 || ticketsSold < 0) {
    // Return empty array for invalid inputs
    return []
  }

  // Base tier is always the guarantee
  const baseTier: BonusTier = {
    threshold: 0,
    amount: bandGuarantee,
    color: "bg-gray-500",
    name: "Guarantee",
    label: `Guaranteed: $${bandGuarantee}`
  }

  // Calculate potential earnings at different ticket sale thresholds
  const potentialEarnings = (tickets: number) => {
    return bandGuarantee + (ticketPrice * tickets * (bandPercentage / 100))
  }

  // Define tier thresholds (you can adjust these)
  const tierThresholds = [25, 50, 75, 100]
  
  const tiers: BonusTier[] = [baseTier]
  
  tierThresholds.forEach((threshold, index) => {
    if (threshold <= totalTickets) {
      const earnings = potentialEarnings(threshold)
      const color = index === 0 ? "bg-yellow-500" : 
                   index === 1 ? "bg-green-500" : 
                   index === 2 ? "bg-blue-500" : "bg-purple-500"
      
      tiers.push({
        threshold,
        amount: Math.round(earnings),
        color,
        name: `Tier ${index + 1}`,
        label: `${threshold}+ tickets = $${Math.round(earnings)}`
      })
    }
  })

  return tiers
}

/**
 * Get the current tier for a band based on tickets sold
 */
export function getCurrentBandTier(
  tiers: BonusTier[],
  ticketsSold: number
): BonusTier {
  // Single pass to find the highest qualifying tier
  let currentTier = tiers[0] // Start with guarantee tier
  
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (ticketsSold >= tiers[i].threshold) {
      currentTier = tiers[i]
      break
    }
  }
  
  return currentTier
}

/**
 * Calculate current earnings for a band
 */
export function calculateCurrentBandEarnings(
  bandGuarantee: number,
  bandPercentage: number,
  ticketPrice: number,
  ticketsSold: number
): number {
  // Input validation
  if (bandGuarantee < 0 || bandPercentage < 0 || bandPercentage > 100 || ticketPrice < 0 || ticketsSold < 0) {
    // Return guarantee as fallback for invalid inputs
    return bandGuarantee
  }
  
  return bandGuarantee + (ticketPrice * ticketsSold * (bandPercentage / 100))
}

/**
 * Calculate all bonus tiers for all bands in an event
 */
export function calculateEventBonusTiers(
  bands: Array<{ id: string; name: string; guarantee: number; percentage: number }>,
  ticketPrice: number,
  totalTickets: number,
  ticketsSold: number
): BandBonusCalculation[] {
  // Input validation
  if (!Array.isArray(bands) || bands.length === 0 || ticketPrice < 0 || totalTickets < 0 || ticketsSold < 0) {
    // Return empty array for invalid inputs
    return []
  }

  return bands.map(band => {
    const tiers = calculateBandBonusTiers(
      band.guarantee,
      band.percentage,
      ticketPrice,
      totalTickets,
      ticketsSold
    )
    
    const currentTier = getCurrentBandTier(tiers, ticketsSold)
    const currentEarnings = calculateCurrentBandEarnings(
      band.guarantee,
      band.percentage,
      ticketPrice,
      ticketsSold
    )

    return {
      bandId: band.id,
      bandName: band.name,
      guarantee: band.guarantee,
      percentage: band.percentage,
      tiers,
      currentTier,
      currentEarnings
    }
  })
}

/**
 * Generate default bonus tiers for gig creation
 * These are static tiers that will be used when creating a new gig
 */
export function generateDefaultBonusTiers(): {
  tier1: { amount: number; threshold: number; color: string };
  tier2: { amount: number; threshold: number; color: string };
  tier3: { amount: number; threshold: number; color: string };
} {
  return {
    tier1: {
      amount: 0,
      threshold: 25,
      color: "bg-yellow-500"
    },
    tier2: {
      amount: 0,
      threshold: 50,
      color: "bg-green-500"
    },
    tier3: {
      amount: 0,
      threshold: 75,
      color: "bg-blue-500"
    }
  };
}
