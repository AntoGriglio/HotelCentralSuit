/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { format, startOfMonth, addDays, subMonths, addMonths, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TablaDisponibilidad() {
  const [data, setData] = useState<any[]>([])
  const [diasDelMes, setDiasDelMes] = useState<string[]>([])
  const [fechaBase, setFechaBase] = useState<Date>(startOfMonth(new Date()))
  const [tiposHabitacion, setTiposHabitacion] = useState<any[]>([])
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('')

  const dataOrdenada = [...data].sort((a, b) => {
    const numA = Number(a.numero || a.nombre || 0)
    const numB = Number(b.numero || b.nombre || 0)
    return numA - numB
  })

  useEffect(() => {
    const fetchTipos = async () => {
      const res = await axios.get('/api/tipos-habitacion')
      setTiposHabitacion(res.data)
    }
    fetchTipos()
  }, [])

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
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="tipo" className="text-sm font-medium text-[#2C3639]">
            Filtrar por tipo:
          </label>
          <select
            id="tipo"
            className="border px-2 py-1 rounded"
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
          >
            <option value="">Todas</option>
            {tiposHabitacion.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFechaBase(subMonths(fechaBase, 1))}
            className="px-2 py-1 rounded hover:bg-gray-300 text-[#2C3639]"
          >
            ◀️ Mes anterior
          </button>
          <p className="font-semibold text-center">
            {format(fechaBase, 'MMMM yyyy', { locale: es })}
          </p>
          <button
            onClick={() => setFechaBase(addMonths(fechaBase, 1))}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-[#2C3639]"
          >
            Mes siguiente ▶️
          </button>
        </div>
      </div>

      <div className="overflow-auto max-h-[70vh] w-full border rounded">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th className="border px-2 py-1 text-left w-[100px] min-w-[100px] sticky left-0 bg-white z-20">
                Habitación
              </th>
              {diasDelMes.map((dia) => (
                <th key={dia}>{format(new Date(dia + 'T00:00'), 'dd')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataOrdenada
              .filter((hab) => !tipoSeleccionado || hab.tipo_habitacion_id === tipoSeleccionado)
              .map((hab) => (
                <tr key={hab.habitacion_id}>
                  <td className="border px-2 py-1 font-semibold sticky left-0 bg-white z-10 w-[100px] min-w-[100px]">
                    {hab.numero || hab.nombre || 'Hab'}
                  </td>
{diasDelMes.map((dia) => {
  const estadiasDelDia = hab.estadias.filter(
    (e: any) => dia >= e.ingreso && dia <= e.egreso
  )

  const tieneIngreso = hab.estadias.some((e: any) => e.ingreso === dia)
  const tieneEgreso = hab.estadias.some((e: any) => e.egreso === dia)

  const baseEstado = estadiasDelDia[0]?.estado
  const baseColor =
    baseEstado === 'reservado' || baseEstado === 'pagado'
      ? '#ef4444'
      : baseEstado === 'pendiente'
      ? '#fde047'
      : baseEstado
      ? '#86efac'
      : 'transparen'

  const bloqueadoEseDia = hab.bloqueos?.some(
    (b: any) => dia >= b.desde && dia <= b.hasta
  )

  return (
    <td
      key={`${hab.habitacion_id}-${dia}`}
      className="relative border p-0 min-w-[40px] w-[40px] h-[32px]"
    >
      {(tieneIngreso || tieneEgreso) ? (
        <div className="flex w-full h-full">
          {tieneIngreso && (
            <div
              title="Ingreso"
              className="absolute top-0 right-0 h-full w-1/2 pointer-events-none z-10"
              style={{ backgroundColor: baseColor, opacity: 1 }}
            />
          )}
          {tieneEgreso && (
            <div
              title="Egreso"
              className="absolute top-0 left-0 h-full w-1/2 pointer-events-none z-10"
              style={{ backgroundColor: baseColor, opacity: 0.5 }}
            />
          )}
        </div>
      ) : baseEstado ? (
        <div className="w-full h-full" style={{ backgroundColor: baseColor }} />
      ) : bloqueadoEseDia ? (
        <div className="w-full h-full bg-blue-400 opacity-80" title="Bloqueado" />
      ) : (
        <div className="w-full h-full bg-[#bbf7d0]" title="Disponible" />
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
