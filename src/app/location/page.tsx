"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy load the location dashboard for better performance
const LocationDashboard = dynamic(() => import('@/components/location-dashboard/location-dashboard').then(mod => ({ default: mod.LocationDashboard })), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

export default function LocationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LocationDashboard />
    </Suspense>
  )
}
