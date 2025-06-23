
import EditarUnidadHabitacionalPage from '@/components/EditarUnidad'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<p className="p-4">Cargando página...</p>}>
      <EditarUnidadHabitacionalPage />
    </Suspense>
  )
}
