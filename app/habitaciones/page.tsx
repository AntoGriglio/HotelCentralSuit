/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ListaUnidadesHabitacionales() {
  const [alquilables, setAlquilables] = useState<any[]>([]);
  const [ocupacionales, setOcupacionales] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUnidades = async () => {
      const res = await fetch('/api/habitaciones');
      const data = await res.json();
      setAlquilables(data.filter((u: any) => u.tipo === 'alquilable'));
      setOcupacionales(data.filter((u: any) => u.tipo === 'ocupacional'));
    };
    fetchUnidades();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Unidades Habitacionales</h1>
        <button
          onClick={() => router.push('/unidades/nueva')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nueva unidad
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Unidades Alquilables</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Capacidad mínima</th>
              <th className="p-2 border">Capacidad media</th>
              <th className="p-2 border">Capacidad máxima</th>
              <th className="p-2 border">Estado</th>
            </tr>
          </thead>
          <tbody>
            {alquilables.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-2 border">{u.nombre}</td>
                <td className="p-2 border">{u.capacidad_minima}</td>
                <td className="p-2 border">{u.capacidad_media}</td>
                <td className="p-2 border">{u.capacidad_maxima}</td>
                <td className="p-2 border">{u.estado_limpieza}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Unidades Ocupacionales</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Última limpieza</th>
              <th className="p-2 border">Responsable</th>
              <th className="p-2 border">Mantenimiento</th>
              <th className="p-2 border">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {ocupacionales.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-2 border">{u.nombre}</td>
                <td className="p-2 border">{u.ultima_limpieza}</td>
                <td className="p-2 border">{u.responsable_limpieza}</td>
                <td className="p-2 border">{u.mantenimiento_por}</td>
                <td className="p-2 border">{u.observaciones_mantenimiento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
