 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const coloresEstado: Record<string, string> = {
  'sin confirmar': '#9ca3af',
  'pendiente': '#facc15',
  'reservado': '#3b82f6',
  'pagado': '#22c55e',
  'anulada': '#ef4444',
  'cancelada': '#f97316',
  'cancelada pendiente': '#eab308',
};

export default function ListaClientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [estadias, setEstadias] = useState<any[]>([]);
  const [expandirEstadias, setExpandirEstadias] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const resClientes = await fetch('/api/clientes');
      const dataClientes = await resClientes.json();
      setClientes(dataClientes);

      const resEstadias = await fetch('/api/estadias');
      const dataEstadias = await resEstadias.json();
      setEstadias(dataEstadias);
    };
    fetchData();
  }, []);

  const obtenerEstadiasCliente = (dni: string) => estadias.filter((e) => e.cliente_dni === dni);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C3639]">Clientes</h1>
        <button
          onClick={() => router.push('/clientes/nuevo')}
          className="bg-[#2C3639] text-white px-4 py-2 rounded hover:bg-[#1f272a]"
        >
          + Nuevo cliente
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#2C3639] text-white">
            <tr>
              <th className="px-4 py-3">DNI</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <>
                <tr key={cliente.dni} className="border-b hover:bg-[#DCD7C9]">
                  <td className="px-4 py-2">{cliente.dni}</td>
                  <td className="px-4 py-2">{cliente.nombre_completo}</td>
                  <td className="px-4 py-2">{cliente.email}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setExpandirEstadias((prev) => ({ ...prev, [cliente.dni]: !prev[cliente.dni] }))}
                      className="text-sm bg-[#A27B5B] text-white px-3 py-1 rounded hover:bg-[#8b6244]"
                    >
                      {expandirEstadias[cliente.dni] ? 'Ocultar Estadías' : 'Ver Estadías'}
                    </button>
                  </td>
                </tr>
                {expandirEstadias[cliente.dni] && (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 bg-[#F5F5F5] text-[#2C3639]">
                      <strong>Estadías:</strong>
                      <ul className="ml-4 list-disc text-sm">
                        {obtenerEstadiasCliente(cliente.dni).map((e) => (
                          <li key={e.id}>
                            #{e.nro_estadia} - {e.fecha_ingreso} a {e.fecha_egreso} -
                            <span
                              className="ml-2 inline-block px-2 py-1 rounded text-white text-xs"
                              style={{ backgroundColor: coloresEstado[e.estado_nombre?.toLowerCase()] || '#6b7280' }}
                            >
                              {e.estado_nombre}
                            </span>
                          </li>
                        ))}
                        {obtenerEstadiasCliente(cliente.dni).length === 0 && <li>Sin estadías registradas</li>}
                      </ul>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
