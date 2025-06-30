/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { format, startOfMonth, addDays, subMonths, addMonths, endOfMonth } from 'date-fns'

export default function TablaDisponibilidad() {
  const [data, setData] = useState<any[]>([])
  const [diasDelMes, setDiasDelMes] = useState<string[]>([])
  const [fechaBase, setFechaBase] = useState<Date>(startOfMonth(new Date()))

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
    <div className="overflow-x-auto text-sm bg-white text-[#2C3639]">
      <div className="flex justify-between items-center mb-2  text-[#2C3639]">
        <button
          onClick={() => setFechaBase(subMonths(fechaBase, 1))}
          className="px-2 py-1 rounded hover:bg-gray-300  text-[#2C3639]"
        >
          ◀️ Mes anterior
        </button>

        <p className="font-semibold text-center text-white">{format(fechaBase, 'MMMM yyyy')}</p>

        <button
          onClick={() => setFechaBase(addMonths(fechaBase, 1))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300  text-[#2C3639]"
        >
          Mes siguiente ▶️
        </button>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className=" sticky top-0 z-10  text-[#2C3639]">
              <th className="border px-2 py-1 text-left">Habitación</th>
              {diasDelMes.map((dia) => (
                <th key={dia} className="border px-2 py-1 text-center whitespace-nowrap  text-[#2C3639]">
                  {format(new Date(dia), 'dd')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((hab) => (
              <tr key={hab.habitacion_id}>
                <td className="border px-2 py-1 font-semibold text-white
                ">
                  {hab.numero || hab.nombre || 'Hab'}
                </td>
                {diasDelMes.map((dia) => {
                  const estado = hab.disponibilidad[dia]
                  const color =
                    estado === 'reservado'
                      ? 'bg-red-400'
                      : estado === 'pendiente'
                      ? 'bg-yellow-300'
                      : 'bg-green-300'
                  return (
                    <td
                      key={hab.habitacion_id + dia}
                      className={`border px-2 py-1 text-center ${color}`}
                      title={estado || 'Disponible'}
                    ></td>
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
