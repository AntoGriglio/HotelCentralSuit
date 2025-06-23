/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function RegistrarEstadia() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reciboRef = useRef<HTMLDivElement>(null)

  const [dni, setDni] = useState('')
  const [cliente, setCliente] = useState<any>(null)
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [canales, setCanales] = useState<any[]>([])
  const [estados, setEstados] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({ dni: '', nombre_completo: '', email: '', telefono: '' })
  const [cantidadNoches, setCantidadNoches] = useState<number>(0)

  const [estadia, setEstadia] = useState({
    cantidadPersonas: '', fechaIngreso: '', fechaEgreso: '', cochera: false,
    desayuno: false, pension_media: false, pension_completa: false, ropaBlanca: false,all_inclusive: false,
    precioPorNoche: '', porcentajeReserva: '', montoReserva: '', total: '',
    estado: '', habitacionId: '', observaciones: '', canalId: '', estadoId: '',
  })

function calcularPrecioPorCantidad(precioBase: number, cantidadNormal: number, cantidadPersonas: number): number {
  const diferencia = cantidadPersonas - cantidadNormal;
  const ajuste = diferencia * 0.10; // 10% más o menos por persona
  const precioFinal = precioBase * (1 + ajuste);
  return Math.max(precioFinal, 0); // evitar precios negativos
}

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
  }, [searchParams])

  useEffect(() => {
    fetch('/api/unidades').then(res => res.json()).then(data => {
      setHabitaciones(data)
    }).catch(console.error)

    fetch('/api/canales').then(res => res.json()).then(setCanales).catch(console.error)
    fetch('/api/estados').then(res => res.json()).then(setEstados).catch(console.error)
  }, [])

  useEffect(() => {
    const precio = parseFloat(estadia.precioPorNoche)
    const porcentaje = parseFloat(estadia.porcentajeReserva)
    const fechaIngreso = new Date(estadia.fechaIngreso)
    const fechaEgreso = new Date(estadia.fechaEgreso)
    const diferenciaEnMs = fechaEgreso.getTime() - fechaIngreso.getTime()
    const noches = Math.ceil(diferenciaEnMs / (1000 * 60 * 60 * 24))
    setCantidadNoches(noches)

    if (!isNaN(precio) && noches > 0) {
      const totalCalculado = noches * precio
      const montoReservaCalculado = !isNaN(porcentaje) ? (totalCalculado * porcentaje) / 100 : 0

      setEstadia(prev => ({
        ...prev,
        montoReserva: montoReservaCalculado.toFixed(2),
        total: totalCalculado.toFixed(2),
      }))
    }
  }, [estadia.fechaIngreso, estadia.fechaEgreso, estadia.precioPorNoche, estadia.porcentajeReserva])

  useEffect(() => {
    // filtrar habitaciones disponibles por fechas
    if (estadia.fechaIngreso && estadia.fechaEgreso) {
     fetch(`/api/disponibilidad?fecha_ingreso=${estadia.fechaIngreso}&fecha_egreso=${estadia.fechaEgreso}&cantidad_personas=${estadia.cantidadPersonas}`)
        .then(res => res.json())
        .then(data => {
        console.log('habitaciones disponibles', data); // ← 👈 Aca ponelo
        setHabitaciones(data);
      })
        .catch(console.error)
    }
  }, [estadia.fechaIngreso, estadia.fechaEgreso])

  useEffect(() => {
    const estadoAuto = cliente ? 'pendiente' : 'sin confirmar'
    const encontrado = estados.find(e => e.nombre.toLowerCase() === estadoAuto)
    if (encontrado) {
      setEstadia(prev => ({ ...prev, estadoId: encontrado.id }))
    }
  }, [cliente, estados])
useEffect(() => {
  async function calcularConExtras() {
    if (!estadia.habitacionId || !estadia.cantidadPersonas || !estadia.fechaIngreso || !estadia.fechaEgreso) return;

    const habitacion = habitaciones.find(h => h.unidad_habitacional?.id === estadia.habitacionId);
    if (!habitacion || !habitacion.unidad_habitacional) return;

    const precioBase = habitacion.precio ?? habitacion.unidad_habitacional.precio;
    const cantidadNormal = parseInt(habitacion.unidad_habitacional.cantidad_normal);
    const cantidadActual = parseInt(estadia.cantidadPersonas);

    if (isNaN(precioBase) || isNaN(cantidadNormal) || isNaN(cantidadActual)) return;

    // Ajuste por cantidad de personas
    const diferencia = cantidadActual - cantidadNormal;
    let precioFinal = precioBase * (1 + diferencia * 0.1);

    // 🔥 Obtener precios de ítems seleccionados
    try {
      const res = await fetch('/api/precios');
      const items = await res.json();

      const getPrecio = (nombre: string) =>
        items.find((i: any) => i.item.toLowerCase() === nombre.toLowerCase())?.precio_actual || 0;

      const extras =
        (estadia.desayuno ? getPrecio('Desayuno buffet') : 0) +
        (estadia.pension_media ? getPrecio('Media Pension') : 0) +
        (estadia.pension_completa ? getPrecio('Pension Completa') : 0) +
        (estadia.all_inclusive ? getPrecio('All inclusive') : 0) +
        (estadia.cochera ? getPrecio('Cochera') : 0) +
        (estadia.ropaBlanca ? getPrecio('Ropa Blanca') : 0);

      precioFinal += extras;

      const fechaIngreso = new Date(estadia.fechaIngreso);
      const fechaEgreso = new Date(estadia.fechaEgreso);
      const noches = Math.ceil((fechaEgreso.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24));

      if (noches <= 0) return;

      const total = noches * precioFinal;
      const porcentajeReserva = estadia.porcentajeReserva ? parseFloat(estadia.porcentajeReserva) : 30;
      const montoReserva = (total * porcentajeReserva) / 100;

      setCantidadNoches(noches);
      setEstadia(prev => ({
        ...prev,
        precioPorNoche: precioFinal.toFixed(2),
        total: total.toFixed(2),
        montoReserva: montoReserva.toFixed(2),
        porcentajeReserva: porcentajeReserva.toString()
      }));
    } catch (err) {
      console.error('❌ Error obteniendo precios de extras', err);
    }
  }

  calcularConExtras();
}, [
  estadia.habitacionId,
  estadia.cantidadPersonas,
  estadia.fechaIngreso,
  estadia.fechaEgreso,
  habitaciones,
  estadia.desayuno,
  estadia.pension_media,
  estadia.pension_completa,
  estadia.all_inclusive,
  estadia.cochera,
  estadia.ropaBlanca
]);

  const buscarCliente = async () => {
    try {
      const res = await fetch(`/api/clientes?dni=${dni}`)
      if (res.ok) {
        const data = await res.json()
        setCliente(data)
        setMensaje('')
      } else {
        setCliente(null)
        setNuevoCliente(prev => ({ ...prev, dni }))
        setMostrarModal(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const registrarNuevoCliente = async () => {
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente),
      })
      if (res.ok) {
        const data = await res.json()
        setCliente(data)
        setDni(data.dni)
        setMostrarModal(false)
        setMensaje('Cliente registrado y asignado correctamente.')
        await buscarCliente() // <== Vuelve a buscar luego del registro
      } else {
        setMensaje('Error al registrar cliente.')
      }
    } catch (error) {
      console.error(error)
      setMensaje('Error al registrar cliente.')
    }
  }

  const generarPDF = async () => {
    if (!cliente || !habitaciones.length) return

    const habitacion = habitaciones.find(h => h.id === estadia.habitacionId)
    const canal = canales.find(c => c.id === estadia.canalId)
    const estado = estados.find(e => e.id === estadia.estadoId)

    const logo = '/central-suites-bg1.png' 


    const reciboHTML = `
      <div style="background:#fff;font-family:sans-serif;padding:2rem;width:800px;color:#2c3639">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem">
          <img src="${logo}" alt="Logo" style="height:60px"/>
          <h2 style="text-align:right">Comprobante de Reserva</h2>
        </div>
        <p><strong>Cliente:</strong> ${cliente.nombre_completo} (${cliente.dni})</p>
        <p><strong>Habitación:</strong> ${habitacion?.numero || ''}</p>
        <p><strong>Ingreso:</strong> ${estadia.fechaIngreso}</p>
        <p><strong>Egreso:</strong> ${estadia.fechaEgreso}</p>
        <p><strong>Cantidad de personas:</strong> ${estadia.cantidadPersonas}</p>
        <p><strong>Total:</strong> $${estadia.total}</p>
        <p><strong>Reserva:</strong> $${estadia.montoReserva}</p>
        <p><strong>Incluye:</strong> ${estadia.desayuno ? 'Desayuno ' : ''}${estadia.pension_media ? 'Almuerzo ' : ''}${estadia.pension_completa ? 'Cena ' : ''}${estadia.cochera ? 'Cochera ' : ''}${estadia.ropaBlanca ? 'Ropa Blanca' : ''}</p>
        <p><strong>Canal:</strong> ${canal?.descripcion || ''}</p>
        <p><strong>Estado:</strong> ${estado?.nombre || ''}</p>
        <p><strong>Observaciones:</strong> ${estadia.observaciones || '—'}</p>
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
      pdf.save(`reserva_${cliente?.dni || 'nueva'}.pdf`)
    } catch (err) {
      console.error('Error al generar PDF:', err)
    } finally {
      document.body.removeChild(contenedor)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const estadoSeleccionado = estados.find(e => e.id === estadia.estadoId)

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
      pension_media: estadia.pension_media,
      pension_completa: estadia.pension_completa,
      all_inclusive: estadia.all_inclusive,
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
      await generarPDF()
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
           <input type="number" placeholder="Cantidad de personas" value={estadia.cantidadPersonas} onChange={(e) => setEstadia({ ...estadia, cantidadPersonas: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="date" value={estadia.fechaIngreso} onChange={(e) => setEstadia({ ...estadia, fechaIngreso: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input type="date" value={estadia.fechaEgreso} onChange={(e) => setEstadia({ ...estadia, fechaEgreso: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <select value={estadia.habitacionId} onChange={(e) => setEstadia({ ...estadia, habitacionId: e.target.value })} required className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
            <option value="">Seleccionar habitación</option>
           {habitaciones
  .filter(h => h.unidad_habitacional && h.unidad_habitacional.id)
  .map(h => (
    <option
      key={h.unidad_habitacional.id}
      value={h.unidad_habitacional.id}
    >
      {h.unidad_habitacional.nombre} - Piso {h.unidad_habitacional.piso} - Capacidad {h.unidad_habitacional.cantidad_normal}
    </option>
))}


          </select>

          <select value={estadia.canalId} onChange={(e) => setEstadia({ ...estadia, canalId: e.target.value })} required className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
            <option value="">Seleccionar canal</option>
            {canales.map((c) => (
              <option key={c.id} value={c.id}>{c.descripcion}</option>
            ))}
          </select>

        <div className="relative">
  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C3639] font-semibold">$</span>
  <input
    type="number"
    placeholder="Precio por noche"
    value={estadia.precioPorNoche}
    onChange={(e) => setEstadia({ ...estadia, precioPorNoche: e.target.value })}
    className="w-full p-2 pl-6 border border-[#A27B5B] rounded text-[#2C3639]"
  />
</div>

<div className="relative">
  <input
    type="number"
    placeholder="Porcentaje de reserva"
    value={estadia.porcentajeReserva}
    onChange={(e) => setEstadia({ ...estadia, porcentajeReserva: e.target.value })}
    className="w-full p-2 pr-6 border border-[#A27B5B] rounded text-[#2C3639]"
  />
  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2C3639] font-semibold">%</span>
</div>

<div className="relative">
  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C3639] font-semibold">$</span>
  <input
    type="number"
    placeholder="Monto de reserva"
    value={estadia.montoReserva}
    onChange={(e) => setEstadia({ ...estadia, montoReserva: e.target.value })}
    className="w-full p-2 pl-6 border border-[#A27B5B] rounded text-[#2C3639]"
  />
</div>

<div className="relative">
  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C3639] font-semibold">$</span>
  <input
    type="number"
    placeholder="Total"
    value={estadia.total}
    onChange={(e) => setEstadia({ ...estadia, total: e.target.value })}
    className="w-full p-2 pl-6 border border-[#A27B5B] rounded text-[#2C3639]"
  />
</div>


         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[#2C3639]">
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={estadia.desayuno}
      onChange={(e) =>
        setEstadia((prev) => ({
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
        setEstadia((prev) => ({
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
        setEstadia((prev) => ({
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
        setEstadia((prev) => ({
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

      <div ref={reciboRef} style={{ display: 'none', padding: '24px', fontSize: '14px', color: '#000' }}>
        <h2 style={{ textAlign: 'center', fontSize: '20px', marginBottom: '16px' }}>Comprobante de Reserva</h2>
        <p><strong>Cliente:</strong> {cliente?.nombre_completo} ({cliente?.dni})</p>
        <p><strong>Habitación:</strong> {habitaciones.find(h => h.id === estadia.habitacionId)?.numero}</p>
        <p><strong>Ingreso:</strong> {estadia.fechaIngreso}</p>
        <p><strong>Egreso:</strong> {estadia.fechaEgreso}</p>
        <p><strong>Cantidad de personas:</strong> {estadia.cantidadPersonas}</p>
        <p><strong>Precio por noche:</strong> ${estadia.precioPorNoche}</p>
        <p><strong>Total:</strong> ${estadia.total}</p>
        <p><strong>Monto de reserva:</strong> ${estadia.montoReserva}</p>
        <p><strong>Incluye:</strong> {estadia.desayuno ? 'Desayuno, ' : ''}{estadia.pension_media ? 'Almuerzo, ' : ''}{estadia.pension_completa ? 'Cena, ' : ''}{estadia.cochera ? 'Cochera, ' : ''}{estadia.ropaBlanca ? 'Ropa blanca' : ''}</p>
        <p><strong>Canal:</strong> {canales.find(c => c.id === estadia.canalId)?.descripcion}</p>
        <p><strong>Estado:</strong> {estados.find(e => e.id === estadia.estadoId)?.nombre}</p>
        <p><strong>Observaciones:</strong> {estadia.observaciones || '—'}</p>
      </div>
    </div>
  )
}
