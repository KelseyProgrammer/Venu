import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy load the promoter dashboard for better performance
const PromoterDashboard = dynamic(() => import('@/components/promoter-dashboard').then(mod => ({ default: mod.PromoterDashboard })), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

export default function PromoterPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PromoterDashboard />
    </Suspense>
  )
} 