/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import InputMoneda from './inputMoneda'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function EditarEstadia() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const router = useRouter()
  const [mostrarModal, setMostrarModal] = useState(false)
  const [estadia, setEstadia] = useState<any>({
    cantidad_personas: '',
    fecha_ingreso: '',
    fecha_egreso: '',
    precio_por_noche: '',
    porcentaje_reserva: '30',
    monto_reserva: '',
    total: '',
    habitacion_id: '',
    canal_id: '',
    observaciones: '',
    cochera: false,
    desayuno: false,
    pension_media: false,
    pension_completa: false,
    all_inclusive: false,
    ropa_blanca: false,
    estado_id: '',
  })
const [habitacionesCargadas, setHabitacionesCargadas] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ dni: '', nombre_completo: '', email: '', telefono: '' })
 
  const [cliente, setCliente] = useState<any>(null)
  const [dni, setDni] = useState('')
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [canales, setCanales] = useState<any[]>([])
  const [estados, setEstados] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
 const [cantidadNoches, setCantidadNoches] = useState<number>(0)
 const [precioEditado, setPrecioEditado] = useState(false)
 const clienteCargadoRef = useRef(false);
 const [estadiaCargada, setEstadiaCargada] = useState(false)


useEffect(() => {
  if (!id) return;

  fetch(`/api/estadias?id=${id}`)
    .then(res => res.json())
   .then(data => {
  setEstadia({
    ...data,
    cantidad_personas: data.cantidad_personas ?? '',
    fecha_ingreso: data.fecha_ingreso ?? '',
    fecha_egreso: data.fecha_egreso ?? '',
    precio_por_noche: data.precio_por_noche?.toString() ?? '0',
    porcentaje_reserva: data.porcentaje_reserva?.toString() ?? '30',
    monto_reserva: data.monto_reserva?.toString() ?? '',
    total: data.total?.toString() ?? '',
    habitacion_id: data.habitacion_id ?? '',
    canal_id: data.canal_id ?? '',
    observaciones: data.observaciones ?? '',
    cochera: data.cochera ?? false,
    desayuno: data.desayuno ?? false,
    pension_media: data.pension_media ?? false,
    pension_completa: data.pension_completa ?? false,
    all_inclusive: data.all_inclusive ?? false,
    ropa_blanca: data.ropa_blanca ?? false,
    estado_id: data.estado_id ?? '',
  });
  setEstadiaCargada(true); // ✅ NUEVO


    })
    .catch(console.error);

fetch('/api/unidades')
  .then(res => res.json())
  .then(data => {
    setHabitaciones(data);
    setHabitacionesCargadas(true);
  });


  fetch('/api/canales')
    .then(res => res.json())
    .then(setCanales);

  fetch('/api/estados')
    .then(res => res.json())
    .then(setEstados);
}, [id]);

useEffect(() => {
  const precio = parseFloat(estadia.precio_por_noche);
  const porcentaje = parseFloat(estadia.porcentaje_reserva);
  const fechaIngreso = new Date(estadia.fecha_ingreso);
  const fechaEgreso = new Date(estadia.fecha_egreso);

  if (isNaN(fechaIngreso.getTime()) || isNaN(fechaEgreso.getTime())) {
    console.log('❌ Fechas inválidas', { fechaIngreso, fechaEgreso });
    return;
  }

  const noches = Math.ceil((fechaEgreso.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24));

  console.log('🕒 Cálculo simple:', {
    precio,
    porcentaje,
    fechaIngreso,
    fechaEgreso,
    noches,
  });

  if (!isNaN(precio) && noches > 0) {
    const totalCalculado = noches * precio;
    const montoReservaCalculado = !isNaN(porcentaje) ? (totalCalculado * porcentaje) / 100 : 0;

    console.log('💰 Total simple:', totalCalculado);
    console.log('💵 Reserva simple:', montoReservaCalculado);

    setEstadia((prev: any) => ({
      ...prev,
      total: totalCalculado.toFixed(2),
      monto_reserva: montoReservaCalculado.toFixed(2),
    }));
  }
}, [estadia.fecha_egreso, estadia.fecha_ingreso, estadia.porcentaje_reserva, estadia.precio_por_noche]);
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
useEffect(() => {
  if (!estadia.cliente_dni || clienteCargadoRef.current) return;

  fetch(`/api/clientes?dni=${estadia.cliente_dni}`)
    .then(res => res.json())
    .then((data) => {
      setCliente(data);
      clienteCargadoRef.current = true; // ← marca que ya cargó
    })
    .catch(() => setCliente(null));
}, [estadia.cliente_dni]);
useEffect(() => {
  clienteCargadoRef.current = false;
}, [id])

  useEffect(() => {
    const estadoAuto = cliente ? 'pendiente' : 'sin confirmar'
    const encontrado = estados.find(e => e.nombre.toLowerCase() === estadoAuto)
    if (encontrado) {
      setEstadia((prev: any) => ({ ...prev, estado_id: encontrado.id }))
    }
  }, [cliente, estados])
useEffect(() => {
  async function calcularConExtras() {
    if (
      !estadiaCargada || // ✅ NUEVO: asegura que los datos estén listos
      !estadia.habitacion_id ||
      !estadia.cantidad_personas ||
      !estadia.fecha_ingreso ||
      !estadia.fecha_egreso
    ) return;

    const habitacion = habitaciones.find(h => String(h.id) === String(estadia.habitacion_id));
    if (!habitacion || !habitacion.unidad_habitacional) return;

    const precioBase = habitacion.precio ?? habitacion.unidad_habitacional.precio ?? 0;
    const cantidadNormal = parseInt(habitacion.unidad_habitacional.cantidad_normal ?? '0');
    const cantidadActual = parseInt(estadia.cantidad_personas ?? '0');

    if (isNaN(precioBase) || isNaN(cantidadNormal) || isNaN(cantidadActual)) return;

    const diferencia = cantidadActual - cantidadNormal;
    const precioAjustadoBase = precioBase * (1 + diferencia * 0.1);

    let extrasTotal = 0;

    try {
      const res = await fetch('/api/precios');
      const items = await res.json();

      const getPrecio = (nombre: string) =>
        items.find((i: any) => i.item.toLowerCase() === nombre.toLowerCase())?.precio_actual || 0;

      extrasTotal += estadia.desayuno ? getPrecio('Desayuno buffet') : 0;
      extrasTotal += estadia.pension_media ? getPrecio('Media Pension') : 0;
      extrasTotal += estadia.pension_completa ? getPrecio('Pension Completa') : 0;
      extrasTotal += estadia.all_inclusive ? getPrecio('All inclusive') : 0;
      extrasTotal += estadia.cochera ? getPrecio('Cochera') : 0;
      extrasTotal += estadia.ropa_blanca ? getPrecio('Ropa Blanca') : 0;

      const precioFinalPorNoche = precioAjustadoBase + (extrasTotal * cantidadActual);

      const fechaIngreso = new Date(estadia.fecha_ingreso);
      const fechaEgreso = new Date(estadia.fecha_egreso);
      const noches = Math.ceil((fechaEgreso.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24));
      if (noches <= 0) return;

      const total = noches * precioFinalPorNoche;
      const porcentajeReserva = estadia.porcentaje_reserva ? parseFloat(estadia.porcentaje_reserva) : 30;
      const montoReserva = (total * porcentajeReserva) / 100;

      setCantidadNoches(noches);
      setEstadia((prev: any) => ({
        ...prev,
        precio_por_noche: precioFinalPorNoche.toFixed(2),
        total: total.toFixed(2),
        monto_reserva: montoReserva.toFixed(2),
        porcentaje_reserva: porcentajeReserva.toString()
      }));
    } catch (err) {
      console.error('❌ Error obteniendo precios de extras', err);
    }
  }

  calcularConExtras();
}, [
  estadiaCargada, // ✅ NUEVO
  estadia.habitacion_id,
  estadia.cantidad_personas,
  estadia.fecha_ingreso,
  estadia.fecha_egreso,
  estadia.desayuno,
  estadia.pension_media,
  estadia.pension_completa,
  estadia.all_inclusive,
  estadia.cochera,
  estadia.ropa_blanca,
  estadia.porcentaje_reserva,
  habitacionesCargadas
]);
  const generarPDF = async () => {
    if (!cliente || !habitaciones) return

   const habitacion = habitaciones.find(h => h.unidad_habitacional?.id === estadia.habitacionId)

    const logo = '/logo.png'

const formatoPesos = (valor: string | number) => {
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor
  return isNaN(numero) ? '—' : `$${numero.toLocaleString('es-AR')}`
}

const reciboHTML = `
  <div style="width: 800px; padding: 2rem; font-family: sans-serif; color: #2C3639; border: 2px solid #2C3639; border-radius: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div style="display: flex; flex-direction: column; align-items: start;">
        <img src="${logo}" alt="Logo" style="height: 70px; margin-bottom: 5px;" />
        <span style="font-weight: bold; font-size: 18px;">Central Suites Hotel</span>
      </div>
      <h2 style="text-align: right; font-size: 20px;">Comprobante de Reserva</h2>
    </div>

    <div style="border-top: 1px solid #ccc; padding-top: 1rem;">
      <p><strong>Cliente:</strong> ${cliente.nombre_completo} (${cliente.dni})</p>
      <p><strong>Habitación:</strong> ${habitacion?.unidad_habitacional?.nombre || '—'} - Piso ${habitacion?.unidad_habitacional?.piso ?? '—'} - Capacidad ${habitacion?.unidad_habitacional?.cantidad_normal ?? '—'}</p>

      <p><strong>Ingreso:</strong> ${estadia.fecha_ingreso}</p>
      <p><strong>Egreso:</strong> ${estadia.fecha_egreso}</p>
      <p><strong>Noches:</strong> ${cantidadNoches}</p>
      <p><strong>Cantidad de personas:</strong> ${estadia.cantidad_personas}</p>
    </div>

    <div style="margin-top: 1rem; border-top: 1px solid #ccc; padding-top: 1rem;">
      <p><strong>Total:</strong> ${formatoPesos(estadia.total)}</p>
      <p><strong>Reserva:</strong> ${formatoPesos(estadia.monto_reserva)}</p>
    </div>

    <div style="margin-top: 1rem; border-top: 1px solid #ccc; padding-top: 1rem;">
      <p><strong>Incluye:</strong> 
        ${estadia.desayuno ? 'Desayuno ' : ''}
        ${estadia.pension_media ? 'Media Pensión ' : ''}
        ${estadia.pension_completa ? 'Pensión Completa ' : ''}
        ${estadia.all_inclusive ? 'All Inclusive ' : ''}
        ${estadia.cochera ? 'Cochera ' : ''}
        ${estadia.ropa_blanca ? 'Ropa Blanca' : ''}
      </p>
      <p><strong>Observaciones:</strong> ${estadia.observaciones || '—'}</p>
    </div>

    <div style="margin-top: 1.5rem; border-top: 1px dashed #999; padding-top: 1rem;">
      <p style="font-weight: bold; font-size: 16px; margin-bottom: 0.5rem;">Cuenta para transferir reserva:</p>
      <p><strong>Cta:</strong> 2648/0 - Banco Roela</p>
      <p><strong>CBU:</strong> 2470005610000000264801</p>
      <p><strong>Empresa:</strong> IDLG SA</p>
    </div>
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
      // Generar Blob del PDF
const blob = pdf.output('blob')

// Enviarlo al endpoint con FormData
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

const dataToSend = {
  cliente_dni: cliente?.dni || null,
  cantidad_personas: parseInt(estadia.cantidad_personas),
  fecha_ingreso: estadia.fecha_ingreso,
  fecha_egreso: estadia.fecha_egreso,
  cochera: estadia.cochera,
  desayuno: estadia.desayuno,
  pension_media: estadia.pension_media,
  pension_completa: estadia.pension_completa,
  all_inclusive: estadia.all_inclusive,
  ropa_blanca: estadia.ropa_blanca,
  precio_por_noche: parseFloat(estadia.precio_por_noche),
  porcentaje_reserva: parseFloat(estadia.porcentaje_reserva),
  monto_reserva: parseFloat(estadia.monto_reserva),
  total: parseFloat(estadia.total),
  habitacion_id: estadia.habitacion_id || null,
  canal_id: estadia.canal_id || null,
  estado_id: estadia.estado_id || null,
  observaciones: estadia.observaciones,
}


    const res = await fetch(`/api/estadias?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    })

    if (res.ok) {
    await generarPDF()
  router.push('/estadias')
    } else {
      const err = await res.json()
      setMensaje(err.error || 'Error al actualizar estadía')
    }
  }

  if (!estadia) return <p className="p-4">Cargando estadía...</p>
  return (<div className="min-h-screen bg-[#3F4E4F] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-[#DCD7C9] p-8 rounded-2xl shadow-lg font-sans">
        <button type="button" onClick={() => router.back()} className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
          ← Atrás
        </button>

        <h1 className="text-2xl font-bold mb-6 text-[#2C3639]">Editar Estadía</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input type="text" placeholder="DNI del cliente" value={dni} onChange={(e) => setDni(e.target.value)} className="p-2 border border-[#A27B5B] rounded w-full text-[#2C3639]" />
            <button type="button" onClick={buscarCliente} className="bg-[#A27B5B] text-white px-4 py-2 rounded hover:bg-[#8e664e]">Buscar Cliente</button>
          </div>

          {cliente && (
            <p className="text-sm text-green-700">Cliente: {cliente.nombre_completo} ({cliente.email})</p>
          )}
<label className="block text-[#2C3639] mb-1">Habitacion</label>
          <select value={String(estadia.habitacion_id || '')} onChange={(e) => setEstadia({ ...estadia, habitacion_id: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
            <option value="">Seleccionar habitación</option>
            {habitaciones.map(h => (
              <option key={h.id} value={String(h.id)}>{h.numero} - Piso {h.piso}</option>
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
        
          <input type="number" placeholder="% Reserva" value={estadia.porcentaje_reserva} onChange={(e) => setEstadia({ ...estadia, porcentaje_reserva: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
        
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
  checked={estadia.ropa_blanca}
  onChange={(e) => setEstadia({ ...estadia, ropa_blanca: e.target.checked })}
/>
Ropa Blanca
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

