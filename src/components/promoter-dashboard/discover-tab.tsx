"use client"

import { DiscoverTab as LocationDiscoverTab } from "../location-dashboard/discover-tab"
import { AssignedLocation, usePromoterGigs } from "./usePromoterGigs"

interface DiscoverTabProps {
  locations: AssignedLocation[];
}

// Same artist discovery + invite flow as the location dashboard, fed with the
// promoter's gigs so "Invite to Gig" offers their open slots.
export function DiscoverTab({ locations }: DiscoverTabProps) {
  const { gigs } = usePromoterGigs(locations)
  return <LocationDiscoverTab gigs={gigs} />
}
