/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { format, startOfMonth, addDays, subMonths, addMonths, endOfMonth } from 'date-fns'

export default function TablaDisponibilidad() {
  const [data, setData] = useState<any[]>([])
  const [diasDelMes, setDiasDelMes] = useState<string[]>([])
  const [fechaBase, setFechaBase] = useState<Date>(startOfMonth(new Date()))

  const dataOrdenada = [...data].sort((a, b) => {
    const numA = Number(a.numero || a.nombre || 0)
    const numB = Number(b.numero || b.nombre || 0)
    return numA - numB
  })

  useEffect(() => {
    const fetchData = async () => {
      const fecha = format(fechaBase, 'yyyy-MM')
      try {
        const res = await axios.get(`/api/reportes?mes=${fecha}`)
        setData(res.data)

        const dias: string[] = []
        const inicio = startOfMonth(fechaBase)
        const fin = endOfMonth(fechaBase)
        for (let f = new Date(inicio); f <= fin; f = addDays(f, 1)) {
          dias.push(format(f, 'yyyy-MM-dd'))
        }
        setDiasDelMes(dias)
      } catch (err) {
        console.error('❌ Error cargando disponibilidad:', err)
      }
    }

    fetchData()
  }, [fechaBase])

  return (
    <div className="overflow-x-auto text-sm text-black bg-white">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setFechaBase(subMonths(fechaBase, 1))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ◀️ Mes anterior
        </button>

        <p className="font-semibold text-center">{format(fechaBase, 'MMMM yyyy')}</p>

        <button
          onClick={() => setFechaBase(addMonths(fechaBase, 1))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Mes siguiente ▶️
        </button>
      </div>

      <div className="overflow-auto max-h-[70vh] w-full border rounded">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th className="border px-2 py-1 text-left w-[100px] min-w-[100px] sticky left-0 bg-white z-20">
                Habitación
              </th>
              {diasDelMes.map((dia) => (
                <th
                  key={dia}
                  className="border px-2 py-1 text-center whitespace-nowrap min-w-[40px]"
                >
                  {format(new Date(dia), 'dd')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataOrdenada.map((hab) => (
              <tr key={hab.habitacion_id}>
                <td className="border px-2 py-1 font-semibold sticky left-0 bg-white z-10 w-[100px] min-w-[100px]">
                  {hab.numero || hab.nombre || 'Hab'}
                </td>
                {diasDelMes.map((dia) => {
                  const estado = hab.disponibilidad[dia]
                  const esIngreso = estado?.includes('_ingreso')
                  const esEgreso = estado?.includes('_egreso')
                  const baseEstado = estado?.replace('_egreso', '').replace('_ingreso', '')

                  const color =
                    baseEstado === 'reservado'
                      ? 'bg-red-400'
                      : baseEstado === 'pendiente'
                      ? 'bg-yellow-300'
                      : 'bg-green-300'

                  return (
                    <td
                      key={hab.habitacion_id }
                      className={`relative border px-2 py-1 text-center min-w-[40px] ${color}`}
                    >
                      {esIngreso && (
                        <div
                          title="Ingreso"
                          className="absolute top-0 left-0 h-full w-1/2 pointer-events-none z-10"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }} // blanco translúcido
                        />
                      )}
                      {esEgreso && (
                        <div
                          title="Egreso"
                          className="absolute top-0 right-0 h-full w-1/2 pointer-events-none z-10"
                          style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }} // sombra negra suave
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
