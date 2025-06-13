/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function EditarEstadia() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const router = useRouter()

  const [estadia, setEstadia] = useState<any>(null)
  const [cliente, setCliente] = useState<any>(null)
  const [dni, setDni] = useState('')
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [canales, setCanales] = useState<any[]>([])
  const [estados, setEstados] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (!id) return

    fetch(`/api/estadias?id=${id}`)
      .then(res => res.json())
      .then(setEstadia)
      .catch(console.error)

    fetch('/api/unidades')
      .then(res => res.json())
      .then(setHabitaciones)

    fetch('/api/canales')
      .then(res => res.json())
      .then(setCanales)

    fetch('/api/estados')
      .then(res => res.json())
      .then(setEstados)
  }, [id])

  useEffect(() => {
    if (estadia?.cliente_dni) {
      fetch(`/api/clientes?dni=${estadia.cliente_dni}`)
        .then(res => res.json())
        .then(setCliente)
        .catch(() => setCliente(null))
    }
  }, [estadia])

  const buscarCliente = async () => {
    const res = await fetch(`/api/clientes?dni=${dni}`)
    if (res.ok) {
      const data = await res.json()
      setCliente(data)
      setMensaje('')
    } else {
      setCliente(null)
      setMensaje('Cliente no encontrado. Redirigiendo...')
      setTimeout(() => router.push('/clientes'), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const dataToSend = {
      cliente_dni: cliente?.dni || null,
      cantidad_personas: parseInt(estadia.cantidad_personas),
      fecha_ingreso: estadia.fecha_ingreso,
      fecha_egreso: estadia.fecha_egreso,
      cochera: estadia.cochera,
      desayuno: estadia.desayuno,
      almuerzo: estadia.almuerzo,
      cena: estadia.cena,
      ropa_blanca: estadia.ropa_blanca,
      precio_por_noche: parseFloat(estadia.precio_por_noche),
      porcentaje_reserva: parseFloat(estadia.porcentaje_reserva),
      monto_reserva: parseFloat(estadia.monto_reserva),
      total: parseFloat(estadia.total),
      habitacion_id: estadia.habitacion_id,
      observaciones: estadia.observaciones,
      canal_id: estadia.canal_id,
      estado_id: estadia.estado_id,
    }

    const res = await fetch(`/api/estadias?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    })

    if (res.ok) {
      router.push('/estadias')
    } else {
      const err = await res.json()
      setMensaje(err.error || 'Error al actualizar estadía')
    }
  }

  if (!estadia) return <p className="p-4">Cargando estadía...</p>

  return (
    <div className="min-h-screen bg-[#3F4E4F] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-[#DCD7C9] p-8 rounded-2xl shadow-lg font-sans">
        <h1 className="text-2xl font-bold mb-6 text-[#2C3639]">Editar Estadía</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="DNI del cliente"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="p-2 border border-[#A27B5B] rounded w-full text-[#2C3639]"
            />
            <button
              type="button"
              onClick={buscarCliente}
              className="bg-[#A27B5B] text-white px-4 py-2 rounded hover:bg-[#8e664e]"
            >
              Buscar Cliente
            </button>
          </div>

          {cliente && (
            <p className="text-sm text-green-700">
              Cliente: {cliente.nombre_completo} ({cliente.email})
            </p>
          )}

          <select
            value={String(estadia.habitacion_id || '')}
            onChange={(e) => setEstadia({ ...estadia, habitacion_id: e.target.value })}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          >
            <option value="">Seleccionar habitación</option>
            {habitaciones.map(h => (
              <option key={h.id} value={String(h.id)}>{h.numero} - Piso {h.piso}</option>
            ))}
          </select>

          <select
            value={String(estadia.canal_id || '')}
            onChange={(e) => setEstadia({ ...estadia, canal_id: e.target.value })}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          >
            <option value="">Seleccionar canal</option>
            {canales.map(c => (
              <option key={c.id} value={String(c.id)}>{c.descripcion}</option>
            ))}
          </select>

          <input type="number" placeholder="Cantidad personas" value={estadia.cantidad_personas} onChange={(e) => setEstadia({ ...estadia, cantidad_personas: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="date" value={estadia.fecha_ingreso} onChange={(e) => setEstadia({ ...estadia, fecha_ingreso: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="date" value={estadia.fecha_egreso} onChange={(e) => setEstadia({ ...estadia, fecha_egreso: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="number" placeholder="Precio por noche" value={estadia.precio_por_noche} onChange={(e) => setEstadia({ ...estadia, precio_por_noche: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="number" placeholder="% Reserva" value={estadia.porcentaje_reserva} onChange={(e) => setEstadia({ ...estadia, porcentaje_reserva: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="number" placeholder="Monto Reserva" value={estadia.monto_reserva} onChange={(e) => setEstadia({ ...estadia, monto_reserva: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="number" placeholder="Total" value={estadia.total} onChange={(e) => setEstadia({ ...estadia, total: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />

          <select value={String(estadia.estado_id || '')} onChange={(e) => setEstadia({ ...estadia, estado_id: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
            <option value="">Seleccionar estado</option>
            {estados.map(e => (
              <option key={e.id} value={String(e.id)}>{e.nombre}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[#2C3639]">
            <label><input type="checkbox" checked={estadia.cochera} onChange={(e) => setEstadia({ ...estadia, cochera: e.target.checked })} /> Cochera</label>
            <label><input type="checkbox" checked={estadia.desayuno} onChange={(e) => setEstadia({ ...estadia, desayuno: e.target.checked })} /> Desayuno</label>
            <label><input type="checkbox" checked={estadia.almuerzo} onChange={(e) => setEstadia({ ...estadia, almuerzo: e.target.checked })} /> Almuerzo</label>
            <label><input type="checkbox" checked={estadia.cena} onChange={(e) => setEstadia({ ...estadia, cena: e.target.checked })} /> Cena</label>
            <label><input type="checkbox" checked={estadia.ropa_blanca} onChange={(e) => setEstadia({ ...estadia, ropa_blanca: e.target.checked })} /> Ropa Blanca</label>
          </div>

          <textarea placeholder="Observaciones" value={estadia.observaciones} onChange={(e) => setEstadia({ ...estadia, observaciones: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"></textarea>

          <button type="submit" className="w-full py-3 bg-[#A27B5B] text-white rounded-lg font-semibold hover:bg-[#8e664e]">
            Guardar Cambios
          </button>
        </form>

        {mensaje && <p className="mt-4 text-center text-red-600">{mensaje}</p>}
      </div>
    </div>
  )
}
