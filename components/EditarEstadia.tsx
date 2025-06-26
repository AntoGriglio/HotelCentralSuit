/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function EditarEstadia() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const router = useRouter()

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

  const [cliente, setCliente] = useState<any>(null)
  const [dni, setDni] = useState('')
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [canales, setCanales] = useState<any[]>([])
  const [estados, setEstados] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
 const [cantidadNoches, setCantidadNoches] = useState<number>(0)
useEffect(() => {
  if (!id) return;

  fetch(`/api/estadias?id=${id}`)
    .then(res => res.json())
    .then(data => {
      console.log('📥 Datos cargados:', data);

      setEstadia({
        ...data,
        cantidad_personas: data.cantidad_personas ?? '',
        fecha_ingreso: data.fecha_ingreso ?? '',
        fecha_egreso: data.fecha_egreso ?? '',
        precio_por_noche: data.precio_por_noche?.toString() ?? '0', // 🔧 importante
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

  useEffect(() => {
    if (estadia?.cliente_dni) {
      fetch(`/api/clientes?dni=${estadia.cliente_dni}`)
        .then(res => res.json())
        .then(setCliente)
        .catch(() => setCliente(null))
    }
  }, [estadia])

  useEffect(() => {
    const estadoAuto = cliente ? 'pendiente' : 'sin confirmar'
    const encontrado = estados.find(e => e.nombre.toLowerCase() === estadoAuto)
    if (encontrado) {
      setEstadia((prev: any) => ({ ...prev, estado_id: encontrado.id }))
    }
  }, [cliente, estados])

useEffect(() => {
  async function calcularConExtras() {
    console.log('🔍 Ejecutando calcularConExtras...');

    if (
      !estadia.habitacion_id ||
      !estadia.cantidad_personas ||
      !estadia.fecha_ingreso ||
      !estadia.fecha_egreso
    ) {
      console.log('❗ Faltan datos necesarios para calcular');
      return;
    }

    const habitacion = habitaciones.find(h => String(h.id) === String(estadia.habitacion_id));
    if (!habitacion || !habitacion.unidad_habitacional) {
      console.log('🏠 Habitación no encontrada o sin unidad asociada');
      return;
    }

    const precioBase = habitacion.precio ?? habitacion.unidad_habitacional.precio ?? 0;
    const cantidadNormal = parseInt(habitacion.unidad_habitacional.cantidad_normal ?? '0');
    const cantidadActual = parseInt(estadia.cantidad_personas ?? '0');

    if (isNaN(precioBase) || isNaN(cantidadNormal) || isNaN(cantidadActual)) {
      console.log('❌ Error con cantidades o precio base', { precioBase, cantidadNormal, cantidadActual });
      return;
    }

    let precioFinal = precioBase * (1 + (cantidadActual - cantidadNormal) * 0.1);

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
        (estadia.ropa_blanca ? getPrecio('Ropa Blanca') : 0);

      precioFinal += extras;

      const fechaIngreso = new Date(estadia.fecha_ingreso);
      const fechaEgreso = new Date(estadia.fecha_egreso);

      if (isNaN(fechaIngreso.getTime()) || isNaN(fechaEgreso.getTime())) {
        console.log('❌ Fechas inválidas', { fechaIngreso, fechaEgreso });
        return;
      }

      const noches = Math.ceil((fechaEgreso.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24));
      if (noches <= 0) return;

      const total = noches * precioFinal;
      const porcentajeReserva = estadia.porcentaje_reserva ? parseFloat(estadia.porcentaje_reserva) : 30;
      const montoReserva = (total * porcentajeReserva) / 100;

      setCantidadNoches(noches);
      setEstadia((prev: any) => ({
        ...prev,
        precio_por_noche: precioFinal.toFixed(2),
        total: total.toFixed(2),
        monto_reserva: montoReserva.toFixed(2),
        porcentaje_reserva: porcentajeReserva.toString(),
      }));

      console.log('✅ Cálculo con extras completo', {
        noches,
        precioFinal,
        total,
        montoReserva,
      });

    } catch (err) {
      console.error('❌ Error obteniendo precios de extras', err);
    }
  }

   calcularConExtras();
}, [
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
  habitacionesCargadas // ✅ Ahora sí es seguro
]);

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
      pension_media: estadia.pension_media,
      pension_completa: estadia.pension_completa,
      all_inclusive: estadia.all_inclusive,
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

          <select value={String(estadia.habitacion_id || '')} onChange={(e) => setEstadia({ ...estadia, habitacion_id: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
            <option value="">Seleccionar habitación</option>
            {habitaciones.map(h => (
              <option key={h.id} value={String(h.id)}>{h.numero} - Piso {h.piso}</option>
            ))}
          </select>

          <select value={String(estadia.canal_id || '')} onChange={(e) => setEstadia({ ...estadia, canal_id: e.target.value })} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
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
      </div>
    </div>
  )
}

