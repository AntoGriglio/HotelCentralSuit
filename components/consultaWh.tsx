/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { formatearMoneda } from '@/lib/formato'

export default function Consulta() {
  const [form, setForm] = useState({
    nombre: '',
    fechaIngreso: '',
    fechaEgreso: '',
    cantidad: '',
    tipoHabitacion: '',
  })

  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/tipos-habitacion')
      .then(res => res.json())
      .then(setTipos)
  }, [])

  const buscar = async () => {
    const params = new URLSearchParams({
      fecha_ingreso: form.fechaIngreso,
      fecha_egreso: form.fechaEgreso,
      cantidad_personas: form.cantidad,
      tipo_habitacion_id: form.tipoHabitacion,
    })
    const res = await fetch(`/api/disponibilidad?${params}`)
    const data = await res.json()
    setHabitaciones(data)
  }

  const calcularNoches = (inicio: string, fin: string): number => {
    const d1 = new Date(inicio)
    const d2 = new Date(fin)
    const diff = d2.getTime() - d1.getTime()
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0)
  }

  const consultar = async (h: any) => {
    const estadoRes = await fetch('/api/estados')
    const estados = await estadoRes.json()
    const estado = estados.find((e: { nombre: string }) => e.nombre.toLowerCase() === 'sin confirmar')

    const noches = calcularNoches(form.fechaIngreso, form.fechaEgreso)
    const precioPorNoche = noches > 0 ? h.total_estadia / noches : h.total_estadia
    const montoReserva = h.total_estadia * 0.3

    const payload = {
      nombre_consulta: form.nombre,
      fecha_ingreso: form.fechaIngreso,
      fecha_egreso: form.fechaEgreso,
      cantidad_personas: parseInt(form.cantidad),
      habitacion_id: h.unidad_habitacional.id,
      estado_id: estado.id,
      total_estadia: h.total_estadia,
      precio_por_noche: parseFloat(precioPorNoche.toFixed(2)),
      monto_reserva: parseFloat(montoReserva.toFixed(2)),
      porcentaje_reserva: 30,
    }

    await fetch('/api/estadias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const texto = `Hola! Soy ${form.nombre}, consulto por disponibilidad:
- Habitación: ${h.unidad_habitacional.nombre}
- Ingreso: ${form.fechaIngreso}
- Egreso: ${form.fechaEgreso}
- Personas: ${form.cantidad}
- Estimado: ${formatearMoneda(h.total_estadia)}
- Señal (30%): ${formatearMoneda(montoReserva)}
`

    window.open(`https://wa.me/5493517011639?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <section className="py-16 px-6 bg-[#DCD7C9]">
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
            <Image src="/habitacion1.jpg" width={300} height={200} alt="Hab" className="rounded mb-2 object-cover" />
            <h4 className="text-lg font-bold">{h.unidad_habitacional.nombre}</h4>
            <p>Capacidad: {h.unidad_habitacional.cantidad_normal}</p>
            <p>Piso: {h.unidad_habitacional.piso}</p>
            <p>Número: {h.unidad_habitacional.numero}</p>
            <p className="mt-2 font-semibold">Total: {formatearMoneda(h.total_estadia)}</p>
            <button onClick={() => consultar(h)} className="mt-3 w-full bg-[#2C3639] text-white py-2 rounded hover:bg-[#1f272a]">
              Consultar
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
