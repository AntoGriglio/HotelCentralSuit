/* eslint-disable @typescript-eslint/no-unused-vars */
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={() => router.push('/clientes/nuevo')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nuevo cliente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">DNI</th>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <>
                <tr key={cliente.dni} className="hover:bg-gray-50">
                  <td className="p-2 border">{cliente.dni}</td>
                  <td className="p-2 border">{cliente.nombre_completo}</td>
                  <td className="p-2 border">{cliente.email}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => setExpandirEstadias((prev) => ({ ...prev, [cliente.dni]: !prev[cliente.dni] }))}
                      className="text-sm bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                    >
                      {expandirEstadias[cliente.dni] ? 'Ocultar Estadías' : 'Ver Estadías'}
                    </button>
                  </td>
                </tr>
                {expandirEstadias[cliente.dni] && (
                  <tr>
                    <td colSpan={4} className="p-2 border bg-gray-50">
                      <strong>Estadías:</strong>
                      <ul className="ml-4 list-disc text-sm">
                        {obtenerEstadiasCliente(cliente.dni).map((e) => (
                          <li key={e.id}>
                            #{e.nro_estadia} - {e.fecha_ingreso} a {e.fecha_egreso} - {e.estado_nombre}
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
