import { Suspense } from 'react'
import { DoorScannerLoader } from '@/components/door-scanner-loader'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DoorPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DoorScannerLoader />
    </Suspense>
  )
}
