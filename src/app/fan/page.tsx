import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy load — also handles auth redirect internally
const FanDashboard = dynamic(
  () => import('@/components/fan-dashboard').then(mod => ({ default: mod.FanDashboard })),
  { loading: () => <LoadingSpinner />, ssr: false }
)

export default function FanPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FanDashboard />
    </Suspense>
  )
}
