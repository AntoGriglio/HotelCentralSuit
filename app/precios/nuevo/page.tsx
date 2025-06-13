import ActualizarPrecios from '@/components/ActualizarPrecios'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<p className="p-4">Cargando precio...</p>}>
      <ActualizarPrecios />
    </Suspense>
  )
}
