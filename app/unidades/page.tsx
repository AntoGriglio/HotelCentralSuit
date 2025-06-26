/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatearMoneda } from '@/lib/formato';

export default function ListaUnidadesHabitacionales() {
  const [alquilables, setAlquilables] = useState<any[]>([]);
  const [ocupacionales, setOcupacionales] = useState<any[]>([]);
  const [vista, setVista] = useState<'alquilable' | 'ocupacional'>('alquilable');
  const router = useRouter();

  useEffect(() => {
    const fetchUnidades = async () => {
      const res = await fetch('/api/unidades');
      const data = await res.json();
      const alquilablesOrdenados = data
        .filter((u: any) => u.tipo === 'Alquilable')
        .sort((a: any, b: any) => a.numero - b.numero);
      setAlquilables(alquilablesOrdenados);
      setOcupacionales(data.filter((u: any) => u.tipo === 'Uso comun'));
    };
    fetchUnidades();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C3639]">Unidades Habitacionales</h1>
        <button
          onClick={() => router.push('/unidades/nuevo')}
          className="bg-[#2C3639] text-white px-4 py-2 rounded hover:bg-[#1f272a]"
        >
          + Nueva unidad
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setVista('alquilable')}
          className={`px-4 py-2 rounded font-semibold ${
            vista === 'alquilable' ? 'bg-[#A27B5B] text-white' : 'bg-[#DCD7C9] text-[#2C3639]'
          }`}
        >
          Alquilables
        </button>
        <button
          onClick={() => setVista('ocupacional')}
          className={`px-4 py-2 rounded font-semibold ${
            vista === 'ocupacional' ? 'bg-[#A27B5B] text-white' : 'bg-[#DCD7C9] text-[#2C3639]'
          }`}
        >
          Uso Común
        </button>
      </div>

      {vista === 'alquilable' ? (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#DCD7C9] text-[#2C3639]">
              <tr>
                <th className="px-4 py-2">Número</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Piso</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Habitaciones</th>
                <th className="px-4 py-2">Baños</th>
                <th className="px-4 py-2">Capacidad mínima</th>
                <th className="px-4 py-2">Capacidad media</th>
                <th className="px-4 py-2">Capacidad máxima</th>
                <th className="px-4 py-2">Precio</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alquilables.map((u) => (
                <tr key={u.id} className="border-b hover:bg-[#F5F5F5]">
                  <td className="px-4 py-2">{u.numero}</td>
                  <td className="px-4 py-2">{u.nombre}</td>
                  <td className="px-4 py-2">{u.piso}</td>
                  <td className="px-4 py-2">{u.tipo_habitacion || '-'}</td>
                  <td className="px-4 py-2">{u.cantidad_habitaciones ?? '-'}</td>
                  <td className="px-4 py-2">{u.cantidad_banios ?? '-'}</td>
                  <td className="px-4 py-2">{u.capacidad_minima}</td>
                  <td className="px-4 py-2">{u.capacidad_normal}</td>
                  <td className="px-4 py-2">{u.capacidad_maxima}</td>
                  <td className="px-4 py-2">
  {u.precio != null ? `${formatearMoneda(u.precio)}` : '-'}
</td>

                  <td className="px-4 py-2">
                    <button
  onClick={() => router.push(`/unidades/editar?id=${u.id}`)}
  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
>
  Editar
</button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#DCD7C9] text-[#2C3639]">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ocupacionales.map((u) => (
                <tr key={u.id} className="border-b hover:bg-[#F5F5F5]">
                  <td className="px-4 py-2">{u.nombre}</td>
                  <td><button
  onClick={() => router.push(`/unidades/editar?id=${u.id}`)}
  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
>
  Editar
</button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
