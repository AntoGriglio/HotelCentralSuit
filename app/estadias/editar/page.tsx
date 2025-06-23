import EditarEstadia from '@/components/EditarEstadia'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Cargando...</div>}>
      <EditarEstadia />
    </Suspense>
  )
}
