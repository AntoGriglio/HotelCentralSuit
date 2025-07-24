// File: app/reportes/page.tsx
'use client'

import { useState } from 'react'
import TablaDisponibilidad from '@/components/TablaDisponibilidad'
import TablaIngresos from '@/components/TablaIngreso'
import TablaEgresos from '@/components/TablaEgresos'

export default function ReportesPage() {
  const [vista, setVista] = useState<'disponibilidad' | 'ingresos' | 'egresos'>('disponibilidad')

  return (
    <main className="p-4 bg-white text-black">
      <h1 className="text-xl font-bold mb-4">Reportes</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setVista('disponibilidad')} className={`px-4 py-2 rounded ${vista === 'disponibilidad' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          Disponibilidad
        </button>
        <button onClick={() => setVista('ingresos')} className={`px-4 py-2 rounded ${vista === 'ingresos' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          Ingresos
        </button>
        <button onClick={() => setVista('egresos')} className={`px-4 py-2 rounded ${vista === 'egresos' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          Egresos
        </button>
      </div>

      {vista === 'disponibilidad' && <TablaDisponibilidad />}
      {vista === 'ingresos' && <TablaIngresos />}
      {vista === 'egresos' && <TablaEgresos />}
    </main>
  )
}
