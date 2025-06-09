/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EditarEstadia({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [estadia, setEstadia] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [dni, setDni] = useState('');
  const [habitaciones, setHabitaciones] = useState([]);
  const [canales, setCanales] = useState([]);
  const [estados, setEstados] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetch(`/api/estadias/${params.id}`)
      .then((res) => res.json())
      .then(setEstadia)
      .catch(console.error);

    fetch('/api/habitaciones').then((r) => r.json()).then(setHabitaciones);
    fetch('/api/canales').then((r) => r.json()).then(setCanales);
    fetch('/api/estados').then((r) => r.json()).then(setEstados);
  }, [params.id]);

  useEffect(() => {
    if (estadia?.cliente_dni) {
      fetch(`/api/clientes/${estadia.cliente_dni}`)
        .then((res) => res.json())
        .then(setCliente)
        .catch(() => setCliente(null));
    }
  }, [estadia]);

  const buscarCliente = async () => {
    const res = await fetch(`/api/clientes/${dni}`);
    if (res.ok) {
      const data = await res.json();
      setCliente(data);
      setMensaje('');
    } else {
      setCliente(null);
      setMensaje('Cliente no encontrado. Redirigiendo...');
      setTimeout(() => router.push('/clientes'), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    };

    const res = await fetch(`/api/estadias/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    });

    if (res.ok) {
      router.push('/estadias');
    } else {
      const err = await res.json();
      setMensaje(err.error || 'Error al actualizar estadía');
    }
  };

  if (!estadia) return <p className="p-4">Cargando estadía...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editar Estadía</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <input type="text" placeholder="DNI del cliente" value={dni} onChange={(e) => setDni(e.target.value)} className="border p-2 rounded" />
          <button type="button" onClick={buscarCliente} className="bg-blue-600 text-white px-3 py-1 rounded">Buscar Cliente</button>
        </div>
        {cliente && <p className="text-sm text-gray-700">Cliente: {cliente.nombre_completo} ({cliente.email})</p>}

        <select value={estadia.habitacion_id} onChange={(e) => setEstadia({ ...estadia, habitacion_id: e.target.value })}>
          <option value="">Seleccionar habitación</option>
          {habitaciones.map((h: any) => (
            <option key={h.id} value={h.id}>{h.numero} - Piso {h.piso}</option>
          ))}
        </select>

        <select value={estadia.canal_id} onChange={(e) => setEstadia({ ...estadia, canal_id: e.target.value })}>
          <option value="">Seleccionar canal</option>
          {canales.map((c: any) => (
            <option key={c.id} value={c.id}>{c.descripcion}</option>
          ))}
        </select>

        <input type="number" value={estadia.cantidad_personas} onChange={(e) => setEstadia({ ...estadia, cantidad_personas: e.target.value })} placeholder="Cantidad personas" />
        <input type="date" value={estadia.fecha_ingreso} onChange={(e) => setEstadia({ ...estadia, fecha_ingreso: e.target.value })} />
        <input type="date" value={estadia.fecha_egreso} onChange={(e) => setEstadia({ ...estadia, fecha_egreso: e.target.value })} />
        <input type="number" value={estadia.precio_por_noche} onChange={(e) => setEstadia({ ...estadia, precio_por_noche: e.target.value })} placeholder="Precio por noche" />
        <input type="number" value={estadia.porcentaje_reserva} onChange={(e) => setEstadia({ ...estadia, porcentaje_reserva: e.target.value })} placeholder="% Reserva" />
        <input type="number" value={estadia.monto_reserva} onChange={(e) => setEstadia({ ...estadia, monto_reserva: e.target.value })} placeholder="Monto Reserva" />
        <input type="number" value={estadia.total} onChange={(e) => setEstadia({ ...estadia, total: e.target.value })} placeholder="Total" />

        <select value={estadia.estado_id} onChange={(e) => setEstadia({ ...estadia, estado_id: e.target.value })}>
          <option value="">Seleccionar estado</option>
          {estados.map((estado: any) => (
            <option key={estado.id} value={estado.id}>{estado.nombre}</option>
          ))}
        </select>

        <label><input type="checkbox" checked={estadia.cochera} onChange={(e) => setEstadia({ ...estadia, cochera: e.target.checked })} /> Cochera</label>
        <label><input type="checkbox" checked={estadia.desayuno} onChange={(e) => setEstadia({ ...estadia, desayuno: e.target.checked })} /> Desayuno</label>
        <label><input type="checkbox" checked={estadia.almuerzo} onChange={(e) => setEstadia({ ...estadia, almuerzo: e.target.checked })} /> Almuerzo</label>
        <label><input type="checkbox" checked={estadia.cena} onChange={(e) => setEstadia({ ...estadia, cena: e.target.checked })} /> Cena</label>
        <label><input type="checkbox" checked={estadia.ropa_blanca} onChange={(e) => setEstadia({ ...estadia, ropa_blanca: e.target.checked })} /> Ropa Blanca</label>

        <textarea value={estadia.observaciones} onChange={(e) => setEstadia({ ...estadia, observaciones: e.target.value })} placeholder="Observaciones" className="p-2 border rounded"></textarea>

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Guardar cambios</button>
      </form>

      {mensaje && <p className="text-red-600 mt-2">{mensaje}</p>}
    </div>
  );
}
