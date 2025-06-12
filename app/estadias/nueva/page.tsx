/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

export default function RegistrarEstadia() {
  const router = useRouter()

  const [dni, setDni] = useState('')
  const [cliente, setCliente] = useState<any>(null)
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [canales, setCanales] = useState<any[]>([])
  const [estados, setEstados] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({
    dni: '',
    nombre_completo: '',
    email: '',
    telefono: ''
  })

  const [estadia, setEstadia] = useState({
    cantidadPersonas: '',
    fechaIngreso: '',
    fechaEgreso: '',
    cochera: false,
    desayuno: false,
    almuerzo: false,
    cena: false,
    ropaBlanca: false,
    precioPorNoche: '',
    porcentajeReserva: '',
    montoReserva: '',
    total: '',
    estado: '',
    habitacionId: '',
    observaciones: '',
    canalId: '',
    estadoId: '',
  })


const searchParams = useSearchParams()

useEffect(() => {
  const habitacion_id = searchParams.get('habitacion_id')
  const fecha_ingreso = searchParams.get('fecha_ingreso')
  const fecha_egreso = searchParams.get('fecha_egreso')
  const cantidad = searchParams.get('cantidad_personas')

  setEstadia(prev => ({
    ...prev,
    habitacionId: habitacion_id || prev.habitacionId,
    fechaIngreso: fecha_ingreso || prev.fechaIngreso,
    fechaEgreso: fecha_egreso || prev.fechaEgreso,
    cantidadPersonas: cantidad || prev.cantidadPersonas,
  }))
}, [])
useEffect(() => {
  const precio = parseFloat(estadia.precioPorNoche)
  const porcentaje = parseFloat(estadia.porcentajeReserva)
  const fechaIngreso = new Date(estadia.fechaIngreso)
  const fechaEgreso = new Date(estadia.fechaEgreso)

  if (!isNaN(precio) && estadia.fechaIngreso && estadia.fechaEgreso) {
    const diferenciaEnMs = fechaEgreso.getTime() - fechaIngreso.getTime()
    const noches = Math.ceil(diferenciaEnMs / (1000 * 60 * 60 * 24))

    if (noches > 0) {
      const totalCalculado = noches * precio
      const montoReservaCalculado = !isNaN(porcentaje)
        ? (totalCalculado * porcentaje) / 100
        : 0

      setEstadia(prev => ({
        ...prev,
        montoReserva: montoReservaCalculado.toFixed(2),
        total: totalCalculado.toFixed(2),
      }))
    }
  }
}, [
  estadia.fechaIngreso,
  estadia.fechaEgreso,
  estadia.precioPorNoche,
  estadia.porcentajeReserva
])

  useEffect(() => {
    fetch('/api/unidades').then(res => res.json()).then(setHabitaciones).catch(console.error)
    fetch('/api/canales').then(res => res.json()).then(setCanales).catch(console.error)
    fetch('/api/estados').then(res => res.json()).then(setEstados).catch(console.error)

    const precio = parseFloat(estadia.precioPorNoche)
    const porcentaje = parseFloat(estadia.porcentajeReserva)
    const fechaIngreso = new Date(estadia.fechaIngreso)
    const fechaEgreso = new Date(estadia.fechaEgreso)

    const diferenciaEnMs = fechaEgreso.getTime() - fechaIngreso.getTime()
    const noches = Math.ceil(diferenciaEnMs / (1000 * 60 * 60 * 24))

    if (!isNaN(precio) && noches > 0) {
      const totalCalculado = noches * precio
      const montoReservaCalculado = !isNaN(porcentaje)
        ? (totalCalculado * porcentaje) / 100
        : 0

      setEstadia(prev => ({
        ...prev,
        montoReserva: montoReservaCalculado.toFixed(2),
        total: totalCalculado.toFixed(2),
      }))
    }
  }, [estadia.fechaIngreso, estadia.fechaEgreso, estadia.precioPorNoche, estadia.porcentajeReserva])

  const buscarCliente = async () => {
    try {
      const res = await fetch(`/api/clientes/${dni}`)
      if (res.ok) {
        const data = await res.json()
        setCliente(data)
        setMensaje('')
      } else {
        setCliente(null)
        setNuevoCliente((prev) => ({ ...prev, dni }))
        setMostrarModal(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const registrarNuevoCliente = async () => {
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente),
      })
      if (res.ok) {
        const data = await res.json()
        setCliente(data)
        setMostrarModal(false)
        setMensaje('Cliente registrado y asignado correctamente.')
      } else {
        setMensaje('Error al registrar cliente.')
      }
    } catch (error) {
      console.error(error)
      setMensaje('Error al registrar cliente.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const estadoSeleccionado = estados.find((e) => e.id === estadia.estadoId)

    if (estadoSeleccionado?.nombre !== 'sin confirmar' && !cliente) {
      setMensaje('Debes asignar un cliente si el estado no es "sin confirmar".')
      return
    }

    const dataToSend = {
      cliente_dni: cliente?.dni || null,
      cantidad_personas: parseInt(estadia.cantidadPersonas),
      fecha_ingreso: estadia.fechaIngreso,
      fecha_egreso: estadia.fechaEgreso,
      cochera: estadia.cochera,
      desayuno: estadia.desayuno,
      almuerzo: estadia.almuerzo,
      cena: estadia.cena,
      ropa_blanca: estadia.ropaBlanca,
      precio_por_noche: parseFloat(estadia.precioPorNoche),
      porcentaje_reserva: parseFloat(estadia.porcentajeReserva),
      monto_reserva: parseFloat(estadia.montoReserva),
      total: parseFloat(estadia.total),
      habitacion_id: estadia.habitacionId,
      observaciones: estadia.observaciones,
      canal_id: estadia.canalId,
      estado_id: estadia.estadoId,
    }

    const res = await fetch('/api/estadias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    })

    if (res.ok) {
      setMensaje('Estadía registrada con éxito')
      router.push('/dashboard')
    } else {
      const error = await res.json()
      setMensaje(error.error || 'Error al registrar estadía')
    }
  }

  const estadoSeleccionado = estados.find((e) => e.id === estadia.estadoId)

  return (
    <div className="min-h-screen bg-[#3F4E4F] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-[#DCD7C9] p-8 rounded-2xl shadow-lg font-sans">
        <h1 className="text-3xl font-bold mb-6 text-[#2C3639]">Registrar Estadía</h1>

        {estadoSeleccionado?.nombre !== 'sin confirmar' && (
          <div className="mb-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="DNI del cliente"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="p-2 rounded border border-[#A27B5B] w-full text-[#2C3639]"
            />
            <button type="button" onClick={buscarCliente} className="bg-[#A27B5B] text-white px-4 py-2 rounded hover:bg-[#8e664e]">
              Buscar Cliente
            </button>
          </div>
        )}

        {cliente && estadoSeleccionado?.nombre !== 'sin confirmar' && (
          <p className="mb-4 text-sm text-green-700">Cliente: {cliente.nombre_completo} ({cliente.email})</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={estadia.habitacionId} onChange={(e) => setEstadia({ ...estadia, habitacionId: e.target.value })} required className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
            <option value="">Seleccionar habitación</option>
            {habitaciones.map((h) => (
              <option key={h.id} value={h.id}>{h.numero} - Piso {h.piso} - Capacidad {h.capacidad_max}</option>
            ))}
          </select>

          <select value={estadia.canalId} onChange={(e) => setEstadia({ ...estadia, canalId: e.target.value })} required className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
            <option value="">Seleccionar canal</option>
            {canales.map((c) => (
              <option key={c.id} value={c.id}>{c.descripcion}</option>
            ))}
          </select>

          <input type="number" placeholder="Cantidad de personas" value={estadia.cantidadPersonas} onChange={(e) => setEstadia({ ...estadia, cantidadPersonas: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="date" value={estadia.fechaIngreso} onChange={(e) => setEstadia({ ...estadia, fechaIngreso: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="date" value={estadia.fechaEgreso} onChange={(e) => setEstadia({ ...estadia, fechaEgreso: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="number" placeholder="Precio por noche" value={estadia.precioPorNoche} onChange={(e) => setEstadia({ ...estadia, precioPorNoche: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="number" placeholder="Porcentaje de reserva" value={estadia.porcentajeReserva} onChange={(e) => setEstadia({ ...estadia, porcentajeReserva: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="number" placeholder="Monto de reserva" value={estadia.montoReserva} onChange={(e) => setEstadia({ ...estadia, montoReserva: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="number" placeholder="Total" value={estadia.total} onChange={(e) => setEstadia({ ...estadia, total: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />

          <select value={estadia.estadoId} onChange={(e) => setEstadia({ ...estadia, estadoId: e.target.value })} required className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
            <option value="">Seleccionar estado</option>
            {estados.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[#2C3639]">
            <label className="flex items-center gap-2"><input type="checkbox" checked={estadia.cochera} onChange={(e) => setEstadia({ ...estadia, cochera: e.target.checked })} /> Cochera</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={estadia.desayuno} onChange={(e) => setEstadia({ ...estadia, desayuno: e.target.checked })} /> Desayuno</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={estadia.almuerzo} onChange={(e) => setEstadia({ ...estadia, almuerzo: e.target.checked })} /> Almuerzo</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={estadia.cena} onChange={(e) => setEstadia({ ...estadia, cena: e.target.checked })} /> Cena</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={estadia.ropaBlanca} onChange={(e) => setEstadia({ ...estadia, ropaBlanca: e.target.checked })} /> Ropa Blanca</label>
          </div>

          <textarea placeholder="Observaciones" value={estadia.observaciones} onChange={(e) => setEstadia({ ...estadia, observaciones: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"></textarea>

          <button type="submit" className="w-full py-3 bg-[#A27B5B] text-white rounded-lg font-semibold hover:bg-[#8e664e] transition">
            Registrar Estadía
          </button>
        </form>

        {mensaje && <p className="mt-4 text-center text-red-600">{mensaje}</p>}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#DCD7C9] p-6 rounded-lg w-full max-w-md text-[#2C3639]">
            <h2 className="text-xl font-bold mb-4">Registrar nuevo cliente</h2>
            <input type="text" placeholder="DNI" value={nuevoCliente.dni} onChange={(e) => setNuevoCliente({ ...nuevoCliente, dni: e.target.value })} className="w-full p-2 mb-2 border border-[#A27B5B] rounded" />
            <input type="text" placeholder="Nombre completo" value={nuevoCliente.nombre_completo} onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre_completo: e.target.value })} className="w-full p-2 mb-2 border border-[#A27B5B] rounded" />
            <input type="email" placeholder="Email" value={nuevoCliente.email} onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })} className="w-full p-2 mb-2 border border-[#A27B5B] rounded" />
            <input type="tel" placeholder="Teléfono" value={nuevoCliente.telefono} onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })} className="w-full p-2 mb-4 border border-[#A27B5B] rounded" />
            <div className="flex justify-between">
              <button onClick={registrarNuevoCliente} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar</button>
              <button onClick={() => setMostrarModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
