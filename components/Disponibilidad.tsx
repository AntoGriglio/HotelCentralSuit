/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatearMoneda } from '@/lib/formato';

export default function Disponibilidad() {
  const router = useRouter();

  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaEgreso, setFechaEgreso] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [tipoHabitacion, setTipoHabitacion] = useState('');
  const [tipos, setTipos] = useState<any[]>([]);
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
const buscar = async () => {
  const params = new URLSearchParams({
    fecha_ingreso: fechaIngreso,
    fecha_egreso: fechaEgreso,
  });

  if (cantidad) params.append('cantidad_personas', cantidad);
  if (tipoHabitacion) params.append('tipo_habitacion_id', tipoHabitacion);

  try {
    const res = await fetch(`/api/disponibilidad?${params.toString()}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error del backend:', errorText);
      setHabitaciones([]);
      return;
    }

    const text = await res.text();
    if (!text) {
      console.error('Respuesta vacía del backend');
      setHabitaciones([]);
      return;
    }

    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      setHabitaciones(data);
    } else {
      console.error('Respuesta inesperada al buscar habitaciones:', data);
      setHabitaciones([]);
    }
  } catch (err) {
    console.error('Error al buscar habitaciones:', err);
    setHabitaciones([]);
  }
};


  const limpiarFiltros = () => {
    setFechaIngreso('');
    setFechaEgreso('');
    setCantidad('');
    setTipoHabitacion('');
    setHabitaciones([]);
  };

  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const res = await fetch('/api/tipos-habitacion');
        const data = await res.json();
        if (Array.isArray(data)) {
          setTipos(data);
        } else {
          console.error('Respuesta inesperada de tipos de habitación:', data);
          setTipos([]);
        }
      } catch (error) {
        console.error('Error al cargar tipos de habitación:', error);
        setTipos([]);
      }
    };

    cargarTipos();
  }, []);

  return (
    <div className="p-6  bg-white  text-[#2C3639]">
      <h1 className="text-3xl font-bold text-[#2C3639] mb-6">Disponibilidad</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input type="date" value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={fechaEgreso} onChange={e => setFechaEgreso(e.target.value)} className="p-2 border rounded" />
        <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Personas" className="p-2 border rounded" />
        <select value={tipoHabitacion} onChange={e => setTipoHabitacion(e.target.value)} className="p-2 border rounded">
          <option value="">Todos los tipos</option>
          {Array.isArray(tipos) && tipos.map(t => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={buscar} className="bg-[#A27B5B] text-white px-4 py-2 rounded hover:bg-[#8b6244]">
          Buscar habitaciones disponibles
        </button>
        <button onClick={limpiarFiltros} className="bg-[#DCD7C9] text-[#2C3639] px-4 py-2 rounded hover:bg-[#c9c4b7]">
          Limpiar filtros
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#DCD7C9] text-[#2C3639]">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Capacidad</th>
              <th className="px-4 py-2">Tipo Habitacion</th>
              <th className="px-4 py-2">Piso</th>
              <th className="px-4 py-2">Número</th>
              <th className="px-4 py-2">Total Estimado</th>
              <th className="px-4 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {habitaciones.map(({ unidad_habitacional: h , total_estadia, tipo_habitacion: t}) => (
              <tr key={h.id} className="border-b hover:bg-[#F5F5F5]">
                <td className="px-4 py-2">{h.nombre}</td>
                <td className="px-4 py-2">{h.cantidad_normal}</td>
                <td className="px-4 py-2">{t.descripcion}</td>
                <td className="px-4 py-2">{h.piso}</td>
                <td className="px-4 py-2">{h.numero}</td>
                <td className="px-4 py-2">{formatearMoneda(total_estadia)}</td>
                <td className="px-4 py-2">
                  <button
  onClick={() =>
    router.push(`/estadias/nueva?habitacion_id=${h.id}&fecha_ingreso=${fechaIngreso}&fecha_egreso=${fechaEgreso}&cantidad_personas=${cantidad}&tipo_habitacion_id=${t.id}`)
  }

                    className="bg-[#2C3639] text-white px-3 py-1 rounded hover:bg-[#1f272a]"
                  >
                    Reservar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
