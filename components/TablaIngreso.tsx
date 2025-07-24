/* eslint-disable @typescript-eslint/no-explicit-any */
// File: app/reportes/ingresos/page.tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TablaIngresos() {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [datos, setDatos] = useState<any[]>([])

  const generarReporte = async () => {
    if (!desde || !hasta) return alert('Seleccioná ambas fechas')

    const res = await fetch(`/api/reportes/ingresos?desde=${desde}&hasta=${hasta}`)
    const json = await res.json()
    setDatos(json)
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Reporte de Ingresos</h1>

      <div className="flex gap-4 items-end mb-6">
        <div>
          <label className="block text-sm mb-1">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <button onClick={generarReporte} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Generar reporte
        </button>
      </div>

      {datos.length > 0 && (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2">Estadía</th>
              <th className="border px-2">Cliente</th>
              <th className="border px-2">Unidad</th>
              <th className="border px-2">Tipo</th>
              <th className="border px-2">Ingreso</th>
              <th className="border px-2">Egreso</th>
              <th className="border px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="border px-2 text-center">{item.nro_estadia}</td>
                <td className="border px-2">{item.cliente_nombre}</td>
                <td className="border px-2">{item.unidad_nombre}</td>
                <td className="border px-2">{item.tipo_habitacion}</td>
                <td className="border px-2">{format(new Date(item.fecha_ingreso), 'dd/MM/yyyy', { locale: es })}</td>
                <td className="border px-2">{format(new Date(item.fecha_salida), 'dd/MM/yyyy', { locale: es })}</td>
                <td className="border px-2 text-right">${item.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
