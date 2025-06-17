
import Disponibilidad from '@/components/Disponibilidad'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<p className="p-4">Cargando página...</p>}>
      <Disponibilidad />
    </Suspense>
  )
}
