
import NuevaUnidad from '@/components/NuevaUnidad'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<p className="p-4">Cargando página...</p>}>
      <NuevaUnidad />
    </Suspense>
  )
}
