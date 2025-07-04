
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import InputMoneda from './inputMoneda'

export default function EditarEstadia() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
const [todasHabitacionesDisponibles, setTodasHabitacionesDisponibles] = useState<any[]>([])

  const [estadia, setEstadia] = useState<any>(null)
  const [cliente, setCliente] = useState<any>(null)
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [tiposHabitacion, setTiposHabitacion] = useState<any[]>([])
  const [canales, setCanales] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [cantidadNoches, setCantidadNoches] = useState(0)
  const [precioEditado, setPrecioEditado] = useState(false)
  const [dni, setDni] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({
    dni: '',
    nombre_completo: '',
    email: '',
    telefono: '',
    localidad: ''
  })
const [estados, setEstados] = useState<any[]>([])

useEffect(() => {
  fetch('/api/estados').then(res => res.json()).then(setEstados)
}, [])

// Carga inicial: estadía + cliente + habitaciones
useEffect(() => {
  if (!id) return
  fetch(`/api/estadias?id=${id}`)
    .then(res => res.json())
    .then(async data => {
      console.log(data)
      setEstadia({
        ...data,
        cantidad_personas: data.cantidad_personas?.toString() || '',
        precio_por_noche: data.precio_por_noche?.toString() || '',
        porcentaje_reserva: data.porcentaje_reserva?.toString() || '',
        monto_reserva: data.monto_reserva?.toString() || '',
        total: data.total?.toString() || '',
        fecha_ingreso: data.fecha_ingreso,
        fecha_egreso: data.fecha_egreso,
        habitacion_id: data.habitacion_id || '',
        tipoHabitacionId: data.tipo_habitacion_id || '',
        canal_id: data.canal_id,
        estado_id: data.estado_id,
        desayuno: data.desayuno,
        pension_media: data.pension_media,
        pension_completa: data.pension_completa,
        all_inclusive: data.all_inclusive,
        cochera: data.cochera,
        ropaBlanca: data.ropa_blanca,
        observaciones: data.observaciones || ''
      })

      if (data.cliente_dni) {
        setDni(data.cliente_dni)
        const resCliente = await fetch(`/api/clientes?dni=${data.cliente_dni}`)
        if (resCliente.ok) {
          const clienteData = await resCliente.json()
          setCliente(clienteData)
        }
      }

      const resHab = await fetch('/api/unidades')
      const todasHabitaciones = await resHab.json()

      const habActual = data.habitacion_id
        ? todasHabitaciones.find((h: any) => h.id === data.habitacion_id)
        : null

      if (habActual) {
        setHabitaciones((prev) => {
          const yaIncluida = prev.some(h => h.id === habActual.id)
          return yaIncluida ? prev : [...prev, habActual]
        })
      }
console.log('todas',todasHabitaciones)
      setHabitaciones(todasHabitaciones)
    })
}, [id])

// Carga de canales y tipos
useEffect(() => {
  fetch('/api/canales').then(res => res.json()).then(setCanales)
  fetch('/api/tipos-habitacion').then(res => res.json()).then(setTiposHabitacion)
}, [])

// Consulta disponibilidad + filtro por tipo
useEffect(() => {
  const consultarDisponibilidad = async () => {
    if (!estadia?.fecha_ingreso || !estadia?.fecha_egreso || !estadia?.cantidad_personas) return

    const params = new URLSearchParams({
      fecha_ingreso: estadia.fecha_ingreso,
      fecha_egreso: estadia.fecha_egreso,
      cantidad_personas: estadia.cantidad_personas,
      tipo_habitacion_id: estadia.tipoHabitacionId
    })

    const res = await fetch(`/api/disponibilidad?${params.toString()}`)
    const disponibles = await res.json()

    const habActual = habitaciones.find(h => h.id === estadia.habitacion_id)
    let disponiblesConActual = disponibles

    if (habActual && !disponibles.find((h: any) => h.id === habActual.id)) {
      disponiblesConActual = [...disponibles, habActual]
    }

    setTodasHabitacionesDisponibles(disponiblesConActual)

    const filtradas = disponiblesConActual.filter(
      (h: any) => h.tipo_id === estadia.tipoHabitacionId
    )
console.log('filtradas',filtradas)
    setHabitaciones(filtradas)

    if (!filtradas.find((h: any) => h.id === estadia.habitacion_id)) {
      setEstadia((prev: any) => ({
        ...prev,
        habitacion_id: filtradas[0]?.id || ''
      }))
    }
  }

  consultarDisponibilidad()
}, [
  estadia?.fecha_ingreso,
  estadia?.fecha_egreso,
  estadia?.cantidad_personas,
  estadia?.tipoHabitacionId
])
useEffect(() => {
  const estadoAuto = cliente ? 'pendiente' : 'sin confirmar'
  const encontrado = estados.find(e => e.nombre.toLowerCase() === estadoAuto)
  if (encontrado) {
    setEstadia((prev: any) => ({ ...prev, estado_id: encontrado.id }))
  }
}, [cliente, estados])

// Recalcular precio
useEffect(() => {
  const calcular = async () => {
    if (
      !estadia?.habitacion_id ||
      !estadia?.cantidad_personas ||
      !estadia?.fecha_ingreso ||
      !estadia?.fecha_egreso
    ) return

    const resultado = await obtenerPrecioConExtras(estadia, habitaciones, precioEditado)
    if (!resultado) return

    setCantidadNoches(resultado.noches)
    setEstadia((prev: any) => ({
      ...prev,
      precio_por_noche: resultado.precio_por_noche,
      total: resultado.total,
      monto_reserva: resultado.monto_reserva,
      porcentaje_reserva: resultado.porcentaje_reserva
    }))
  }

  calcular()
}, [
  estadia?.habitacion_id,
  estadia?.cantidad_personas,
  estadia?.fecha_ingreso,
  estadia?.fecha_egreso,
  estadia?.desayuno,
  estadia?.pension_media,
  estadia?.pension_completa,
  estadia?.all_inclusive,
  estadia?.cochera,
  estadia?.ropaBlanca,
  precioEditado,
  habitaciones.length
])

// Cambio manual del tipo habitación
const handleTipoHabitacionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const nuevoTipo = e.target.value
  const porTipo = todasHabitacionesDisponibles.filter(h => h.tipo_id === nuevoTipo)
console.log('portipo', porTipo)
  setHabitaciones(porTipo)
  setEstadia((prev: any) => ({
    ...prev,
    tipoHabitacionId: nuevoTipo,
    habitacion_id: porTipo[0]?.id || ''
  }))
}


const obtenerPrecioConExtras = async (datos: any, habitaciones: any[], precioEditado: boolean) => {
  const habitacion = habitaciones.find(h => h.id === datos.habitacion_id)
  if (!habitacion) return null

  const precioBase = habitacion.precio
  const cantidadNormal = parseInt(habitacion.capacidad_normal)
  const cantidadActual = parseInt(datos.cantidad_personas)
  if (isNaN(precioBase) || isNaN(cantidadNormal) || isNaN(cantidadActual)) return null

  const diferencia = cantidadActual - cantidadNormal
  const precioAjustado = !precioEditado
    ? precioBase * (1 + diferencia * 0.1)
    : parseFloat(datos.precio_por_noche) || 0

  const res = await fetch('/api/precios')
  const items = await res.json()
  const getPrecio = (nombre: string) =>
    items.find((i: any) => i.item.toLowerCase() === nombre.toLowerCase())?.precio_actual || 0

  const extrasSeleccionados = [
    datos.desayuno && getPrecio('Desayuno buffet'),
    datos.pension_media && getPrecio('Media Pension'),
    datos.pension_completa && getPrecio('Pension Completa'),
    datos.all_inclusive && getPrecio('All inclusive'),
    datos.cochera && getPrecio('Cochera'),
    datos.ropaBlanca && getPrecio('Ropa Blanca'),
  ].filter(Boolean)

  const extrasTotal = extrasSeleccionados.reduce((acc, val) => acc + val, 0)
  const precioConExtras = precioAjustado + extrasTotal * cantidadActual

  const fechaIngreso = new Date(datos.fecha_ingreso)
  const fechaEgreso = new Date(datos.fecha_egreso)
  const noches = Math.ceil((fechaEgreso.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24))
  if (noches <= 0) return null

  const total = noches * precioConExtras
  const porcentajeReserva = datos.porcentaje_reserva ? parseFloat(datos.porcentaje_reserva) : 30
  const montoReserva = (total * porcentajeReserva) / 100

  return {
    noches,
    precio_por_noche: precioConExtras.toFixed(2),
    total: total.toFixed(2),
    monto_reserva: montoReserva.toFixed(2),
    porcentaje_reserva: porcentajeReserva.toString()
  }
}


  const buscarCliente = async () => {
    if (!dni) return
    try {
     const res = await fetch(`/api/clientes?dni=${dni}`)
      if (res.ok) {
        const clienteData = await res.json()
        setCliente(clienteData)
        setEstadia((prev: any) => ({ ...prev, cliente_dni: clienteData.dni }))
        setMensaje('')
      } else {
        setCliente(null)
        setMostrarModal(true)
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error)
    }
  }

  const registrarNuevoCliente = async () => {
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente)
      })
      if (res.ok) {
        setCliente(nuevoCliente)
        setEstadia((prev: any) => ({ ...prev, cliente_dni: nuevoCliente.dni }))
        setMostrarModal(false)
        setMensaje('')
      } else {
        const err = await res.json()
        setMensaje(err.message || 'Error al registrar cliente')
      }
    } catch (error) {
      console.error('Error al registrar cliente:', error)
      setMensaje('Error al registrar cliente')
    }
  }

  const generarPDF = async () => {
    if (!estadia || !cliente) return

   const habitacion = habitaciones.find(h => h.id === estadia.habitacion_id)

    const reciboHTML = `
      <div style="font-family: Arial; padding: 30px; max-width: 600px;">
        <h2>Central Suites</h2>
        <p><strong>Cliente:</strong> ${cliente.nombre_completo}</p>
        <p><strong>Email:</strong> ${cliente.email}</p>
        <p><strong>DNI:</strong> ${cliente.dni}</p>
        <p><strong>Habitación:</strong> ${habitacion?.unidad_habitacional?.nombre || ''}</p>
        <p><strong>Ingreso:</strong> ${estadia.fechaIngreso}</p>
        <p><strong>Egreso:</strong> ${estadia.fechaEgreso}</p>
        <p><strong>Noches:</strong> ${cantidadNoches}</p>
        <p><strong>Total:</strong> $${estadia.total}</p>
        <p><strong>Seña:</strong> $${estadia.montoReserva}</p>
        <p><strong>Incluye:</strong> ${[
          estadia.desayuno && 'Desayuno',
          estadia.pension_media && 'Media pensión',
          estadia.pension_completa && 'Pensión completa',
          estadia.all_inclusive && 'All inclusive',
          estadia.cochera && 'Cochera',
          estadia.ropaBlanca && 'Ropa blanca'
        ].filter(Boolean).join(', ')}</p>
      </div>
    `

    const contenedor = document.createElement('div')
    contenedor.innerHTML = reciboHTML
    contenedor.style.position = 'absolute'
    contenedor.style.top = '-9999px'
    document.body.appendChild(contenedor)

    try {
      const canvas = await html2canvas(contenedor)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0)
      pdf.save(`reserva_${cliente.dni}.pdf`)

      const blob = pdf.output('blob')
      const formData = new FormData()
      formData.append('to', cliente.email)
      formData.append('pdf', blob, 'reserva.pdf')

      await fetch('/api/enviar-confirmacion', {
        method: 'POST',
        body: formData,
      })
    } catch (err) {
      console.error('Error al generar PDF:', err)
    } finally {
      document.body.removeChild(contenedor)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estadia) return
    const estadoSeleccionado = estados.find(e => e.id === estadia.estado_id)

    if (estadoSeleccionado?.nombre !== 'sin confirmar' && !cliente) {
      setMensaje('Debes asignar un cliente si el estado no es "sin confirmar".')
      return
    }
    await fetch(`/api/estadias?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(estadia),
    })

    await generarPDF()
    router.push('/estadias')
  }

  const estadoSeleccionado = estados.find((e) => e.id === estadia?.estado_id)
  if (!estadia) return <p className="p-4">Cargando estadía...</p>
  return (<div className="min-h-screen bg-[#3F4E4F] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-[#DCD7C9] p-8 rounded-2xl shadow-lg font-sans">
        <button type="button" onClick={() => router.back()} className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
          ← Atrás
        </button>

        <h1 className="text-2xl font-bold mb-6 text-[#2C3639]">Editar Estadía</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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

<label className="block text-[#2C3639] mb-1">Tipo de habitación</label>
<select
  value={String(estadia.tipoHabitacionId || '')}
  onChange={handleTipoHabitacionChange}
  className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
>
  <option value="">Seleccionar tipo</option>
  {tiposHabitacion.map((tipo: any) => (
    <option key={String(tipo.id)} value={String(tipo.id)}>
      {tipo.nombre}
    </option>
  ))}
</select>

<label className="block text-[#2C3639] mb-1">Habitación</label>
<select
  value={String(estadia.habitacion_id || '')}
  onChange={(e) =>
    setEstadia((prev: any) => ({
      ...prev,
      habitacion_id: e.target.value
    }))
  }
  className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
>
  <option value="">Seleccionar habitación</option>
{habitaciones.map((h) => (
  <option key={h.id} value={String(h.id)}>
    {h.nombre} - Piso {h.piso}
  </option>
))}

</select>


<label className="block text-[#2C3639] mb-1">Canal</label>
          <select value={String(estadia.canal_id || '')} onChange={(e) => setEstadia({ ...estadia, canal_id: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
            <option value="">Seleccionar canal</option>
            {canales.map(c => (
              <option key={c.id} value={String(c.id)}>{c.descripcion}</option>
            ))}
          </select>
           <label className="block text-[#2C3639] mb-1">Cantidad personas</label>   
          <input type="number" placeholder="Cantidad personas" value={estadia.cantidad_personas} onChange={(e) => setEstadia({ ...estadia, cantidad_personas: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
            <label className="block text-[#2C3639] mb-1">Fecha Ingreso</label>            
          <input type="date" value={estadia.fecha_ingreso} onChange={(e) => setEstadia({ ...estadia, fecha_ingreso: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
           <label className="block text-[#2C3639] mb-1">Fecha Egreso</label> 
          <input type="date" value={estadia.fecha_egreso} onChange={(e) => setEstadia({ ...estadia, fecha_egreso: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
           <label className="block text-[#2C3639] mb-1">Precio por noche</label> 
             <InputMoneda
  valorInicial={estadia.precio_por_noche}
  onCambio={(nuevoValor) => {
    setEstadia({ ...estadia, precio_por_noche: nuevoValor.toString() })
  setPrecioEditado(true)
  }}
  className="w-full p-2 pl-6 border border-[#A27B5B] rounded text-[#2C3639]"
/>
           <label className="block text-[#2C3639] mb-1">Porcentaje Reserva</label> 
        
          <input type="number" placeholder="% Reserva" value={estadia.porcentaje_reserva} onChange={(e) => setEstadia({ ...estadia, porcentaje_reserva: e.target.value })}  className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
        
          <label className="block text-[#2C3639] mb-1">Total Reserva</label> 
           <InputMoneda
  valorInicial={estadia.monto_reserva}
  onCambio={(nuevoValor) => {
    setEstadia({ ...estadia, monto_reserva: nuevoValor.toString() })
    setPrecioEditado(true) 
  }}
  className="w-full p-2 pl-6 border border-[#A27B5B] rounded text-[#2C3639]"
/>
         <label className="block text-[#2C3639] mb-1">Total</label> 
 <InputMoneda
  valorInicial={estadia.total}
  onCambio={(nuevoValor) => {
    setEstadia({ ...estadia, total: nuevoValor.toString() })
    setPrecioEditado(true) 
  }}
  className="w-full p-2 pl-6 border border-[#A27B5B] rounded text-[#2C3639]"
/>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-[#2C3639]">
            <label className="flex items-center gap-2">
 <input
      type="checkbox"
      checked={estadia.desayuno}
      onChange={(e) =>
        setEstadia((prev: any) => ({
          ...prev,
          desayuno: e.target.checked,
          pension_media: false,
          pension_completa: false,
          all_inclusive: false,
        }))
      }
    /> Desayuno
  </label>
  
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={estadia.pension_media}
      onChange={(e) =>
        setEstadia((prev: any) => ({
          ...prev,
          desayuno: false,
          pension_media: e.target.checked,
          pension_completa: false,
          all_inclusive: false,
        }))
      }
    /> Media Pensión
  </label>
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={estadia.pension_completa}
      onChange={(e) =>
        setEstadia((prev: any) => ({
          ...prev,
          desayuno: false,
          pension_media: false,
          pension_completa: e.target.checked,
          all_inclusive: false,
        }))
      }
    /> Pensión Completa
  </label>
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={estadia.all_inclusive}
      onChange={(e) =>
        setEstadia((prev: any) => ({
          ...prev,
          desayuno: false,
          pension_media: false,
          pension_completa: false,
          all_inclusive: e.target.checked,
        }))
      }
    /> All Inclusive
  </label>

  {/* ✅ Estos dos no afectan el precio, se mantienen normales */}
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={estadia.cochera}
      onChange={(e) => setEstadia({ ...estadia, cochera: e.target.checked })}
    /> Cochera
  </label>
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={estadia.ropaBlanca}
      onChange={(e) => setEstadia({ ...estadia, ropaBlanca: e.target.checked })}
    /> Ropa Blanca
  </label>
</div>

          <textarea placeholder="Observaciones" value={estadia.observaciones} onChange={(e) => setEstadia({ ...estadia, observaciones: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"></textarea>

          <button type="submit" className="w-full py-3 bg-[#A27B5B] text-white rounded-lg font-semibold hover:bg-[#8e664e]">
            Guardar Cambios
          </button>
        </form>


        {mensaje && <p className="mt-4 text-center text-red-600">{mensaje}</p>}
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
    </div>
    
  )
}

