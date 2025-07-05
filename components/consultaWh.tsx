/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { formatearMoneda } from '@/lib/formato'
import Loader from './loader'

export default function Consulta() {
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    nombre: '',
    fechaIngreso: '',
    fechaEgreso: '',
    cantidad: '',
    tipoHabitacion: '',
  })

  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])

  const [showModal, setShowModal] = useState(false)
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<any>(null)

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await fetch('/api/tipos-habitacion')
        const data = await res.json()
        setTipos(data)
      } finally {
        setLoading(false)
      }
    }
    fetchTipos()
  }, [])

  const buscar = async () => {
    setLoading(true)

    const params = new URLSearchParams({
      fecha_ingreso: form.fechaIngreso,
      fecha_egreso: form.fechaEgreso,
      cantidad_personas: form.cantidad,
      tipo_habitacion_id: form.tipoHabitacion,
    })

    const res = await fetch(`/api/disponibilidad?${params}`)
    const data = await res.json()

    const habitacionesConTipo = data.map((h: any) => {
      const tipo = tipos.find((t: any) => t.id === h.unidad_habitacional.tipo_habitacion_id)
      return {
        ...h,
        tipo_habitacion_nombre: tipo?.nombre || 'Sin tipo',
      }
    })

    const habitacionesUnicas: any[] = []
    const tiposIncluidos = new Set()

    for (const h of habitacionesConTipo) {
      const tipoId = h.unidad_habitacional.tipo_habitacion_id
      if (!tiposIncluidos.has(tipoId)) {
        habitacionesUnicas.push(h)
        tiposIncluidos.add(tipoId)
      }
    }

    setHabitaciones(habitacionesUnicas)
    setLoading(false)
  }

  const calcularNoches = (inicio: string, fin: string): number => {
    const d1 = new Date(inicio)
    const d2 = new Date(fin)
    const diff = d2.getTime() - d1.getTime()
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0)
  }

  const abrirModal = (h: any) => {
    setHabitacionSeleccionada(h)
    setShowModal(true)
  }

  const confirmarConsulta = async () => {
    if (!habitacionSeleccionada) return

    const h = habitacionSeleccionada
    const noches = calcularNoches(form.fechaIngreso, form.fechaEgreso)
    const estadoRes = await fetch('/api/estados')
    const estados = await estadoRes.json()
    const estado = estados.find((e: { nombre: string }) => e.nombre.toLowerCase() === 'sin confirmar')

    const precioPorNoche = h.total_estadia
      ? h.total_estadia / noches
      : h.precio_habitacion
        ? h.precio_habitacion * parseInt(form.cantidad)
        : 0

    const totalEstadia = noches * precioPorNoche
    const montoReserva = totalEstadia * 0.3

    const payload = {
      nombre_consulta: form.nombre,
      fecha_ingreso: form.fechaIngreso,
      fecha_egreso: form.fechaEgreso,
      cantidad_personas: parseInt(form.cantidad),
      habitacion_id: h.unidad_habitacional.id,
      estado_id: estado.id,
      total: parseFloat(totalEstadia.toFixed(2)),
      precio_por_noche: parseFloat(precioPorNoche.toFixed(2)),
      monto_reserva: parseFloat(montoReserva.toFixed(2)),
      porcentaje_reserva: 30,
      tipo_habitacion_id: h.unidad_habitacional.tipo_habitacion_id
    }

    console.log(payload)

    await fetch('/api/estadias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const texto = `Hola! Soy ${form.nombre}, consulto por disponibilidad:
- Tipo de habitación: ${h.tipo_habitacion_nombre}
- Ingreso: ${form.fechaIngreso}
- Egreso: ${form.fechaEgreso}
- Personas: ${form.cantidad}
- Estimado: ${formatearMoneda(totalEstadia)}
- Señal (30%): ${formatearMoneda(montoReserva)}
`

    window.open(`https://wa.me/5493541774444?text=${encodeURIComponent(texto)}`, '_blank')
    setShowModal(false)
    setHabitacionSeleccionada(null)
  }

  if (loading) return <Loader />

  return (
    <section className="py-16 px-6 bg-[#d9d9d9]">
      <h3 className="text-2xl font-semibold text-center mb-6 text-[#2C3639]">Consultá disponibilidad</h3>

      <div className="max-w-4xl mx-auto grid gap-4 mb-6 md:grid-cols-4">
        <input type="text" placeholder="Tu nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="p-2 border rounded" />
        <input type="date" value={form.fechaIngreso} onChange={e => setForm({ ...form, fechaIngreso: e.target.value })} className="p-2 border rounded" />
        <input type="date" value={form.fechaEgreso} onChange={e => setForm({ ...form, fechaEgreso: e.target.value })} className="p-2 border rounded" />
        <input type="number" value={form.cantidad} placeholder="Personas" onChange={e => setForm({ ...form, cantidad: e.target.value })} className="p-2 border rounded" />
        <select value={form.tipoHabitacion} onChange={e => setForm({ ...form, tipoHabitacion: e.target.value })} className="p-2 border rounded md:col-span-2">
          <option value="">Todos los tipos</option>
          {tipos.map((t: any) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
        <button onClick={buscar} className="bg-[#A27B5B] text-white px-4 py-2 rounded hover:bg-[#8e664e] md:col-span-2">Buscar</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habitaciones.map((h: any) => (
          <div key={h.unidad_habitacional.id} className="bg-white rounded-lg shadow p-4">
            <Image
              src={`/${h.tipo_habitacion_nombre.replace(/\s+/g, '-')}.PNG`}
              width={300}
              height={200}
              alt={h.tipo_habitacion_nombre}
              className="rounded mb-2 object-cover"
            />
            <h4 className="text-lg font-bold">{h.tipo_habitacion_nombre}</h4>
            <p>Capacidad: {h.unidad_habitacional.cantidad_normal}</p>
            <p className="mt-2 font-semibold">Total estimado: {formatearMoneda(h.total_estadia || h.precio_habitacion * parseInt(form.cantidad))}</p>
            <button onClick={() => abrirModal(h)} className="mt-3 w-full bg-[#2C3639] text-white py-2 rounded hover:bg-[#1f272a]">
              Consultar
            </button>
          </div>
        ))}
      </div>

      {showModal && habitacionSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirmar consulta</h2>
            <p><strong>Tipo:</strong> {habitacionSeleccionada.tipo_habitacion_nombre}</p>
            <p><strong>Ingreso:</strong> {form.fechaIngreso}</p>
            <p><strong>Egreso:</strong> {form.fechaEgreso}</p>
            <p><strong>Personas:</strong> {form.cantidad}</p>

            {(() => {
              const noches = calcularNoches(form.fechaIngreso, form.fechaEgreso)
              const precioPorNoche = habitacionSeleccionada.total_estadia
                ? habitacionSeleccionada.total_estadia / noches
                : habitacionSeleccionada.precio_habitacion * parseInt(form.cantidad)
              const total = noches * precioPorNoche
              const senal = total * 0.3

              return (
                <>
                  <p><strong>Precio estimado:</strong> {formatearMoneda(total)}</p>
                  <p><strong>Seña 30%:</strong> {formatearMoneda(senal)}</p>
                </>
              )
            })()}

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
              <button onClick={confirmarConsulta} className="px-4 py-2 bg-[#2C3639] text-white rounded hover:bg-[#1f272a]">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
