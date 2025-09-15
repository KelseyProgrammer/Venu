import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy load the artist dashboard for better performance
const ArtistDashboard = dynamic(() => import('@/components/artist-dashboard').then(mod => ({ default: mod.ArtistDashboard })), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

export default function ArtistPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ArtistDashboard />
    </Suspense>
  )
}
