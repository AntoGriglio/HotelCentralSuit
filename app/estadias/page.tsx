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

const ITEMS_POR_PAGINA = 10;

export default function ListaEstadias() {
  const [estadias, setEstadias] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroFechaIngreso, setFiltroFechaIngreso] = useState('');
  const [filtroFechaEgreso, setFiltroFechaEgreso] = useState('');
  const [expandirPagos, setExpandirPagos] = useState<Record<string, boolean>>({});
  const [paginaActual, setPaginaActual] = useState(1);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const resEstadias = await fetch('/api/estadias');
      const dataEstadias = await resEstadias.json();
      setEstadias(dataEstadias);

      const resPagos = await fetch('/api/pagos');
      const dataPagos = await resPagos.json();
      setPagos(dataPagos);
    };
    fetchData();
  }, []);

  const estadiasFiltradas = estadias.filter((e) => {
    const coincideEstado = filtroEstado ? e.estado_nombre?.toLowerCase() === filtroEstado.toLowerCase() : true;
    const coincideCliente = filtroCliente ? e.cliente_dni?.toLowerCase().includes(filtroCliente.toLowerCase()) : true;
    const coincideFechaIngreso = filtroFechaIngreso ? e.fecha_ingreso === filtroFechaIngreso : true;
    const coincideFechaEgreso = filtroFechaEgreso ? e.fecha_egreso === filtroFechaEgreso : true;
    return coincideEstado && coincideCliente && coincideFechaIngreso && coincideFechaEgreso;
  });

  const totalPaginas = Math.ceil(estadiasFiltradas.length / ITEMS_POR_PAGINA);
  const estadiasPaginadas = estadiasFiltradas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const obtenerPagosEstadia = (id: string) => pagos.filter((p) => p.estadia_id === id);

  const eliminarEstadia = async (id: string) => {
    if (!confirm('Seguro que querés eliminar esta estadía?')) return;

    const res = await fetch(`/api/estadias/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setEstadias((prev) => prev.filter((e) => e.id !== id));
    } else {
      alert('No se pudo eliminar. Solo pueden eliminarse las que están sin confirmar o anuladas sin pagos.');
    }
  };

  const limpiarFiltros = () => {
    setFiltroCliente('');
    setFiltroFechaIngreso('');
    setFiltroFechaEgreso('');
    setFiltroEstado('');
  };

  const exportarCSV = () => {
    const filas = [
      [
        'Nro Estadía', 'Cliente', 'Habitación', 'Ingreso', 'Egreso', 'Estado', 'Pagos'
      ],
      ...estadiasFiltradas.map((e) => [
        e.nro_estadia,
        e.cliente_dni ?? '—',
        e.habitacion_id ?? '—',
        e.fecha_ingreso,
        e.fecha_egreso,
        e.estado_nombre,
        obtenerPagosEstadia(e.id)
          .map((p) => `${new Date(p.fecha_pago).toLocaleDateString()} - ${p.monto} (${p.descripcion_tipo_pago})`)
          .join(' | ')
      ])
    ];

    const csv = filas.map((f) => f.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'estadias.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPagos = pagos.reduce((acc, p) => acc + Number(p.monto), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Estadías ({estadiasFiltradas.length})</h1>
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => router.push('/estadias/nueva')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nueva estadía
          </button>
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-600">Total de pagos registrados: <strong>${totalPagos.toFixed(2)}</strong></p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <input
          type="text"
          placeholder="Filtrar por cliente (DNI)"
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />

        <input
          type="date"
          value={filtroFechaIngreso}
          onChange={(e) => setFiltroFechaIngreso(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />

        <input
          type="date"
          value={filtroFechaEgreso}
          onChange={(e) => setFiltroFechaEgreso(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Todos los estados</option>
          {Object.keys(coloresEstado).map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>

        <button
          onClick={limpiarFiltros}
          className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Habitación</th>
              <th className="p-2 border">Ingreso</th>
              <th className="p-2 border">Egreso</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estadiasPaginadas.map((e) => (
              <>
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{e.nro_estadia}</td>
                  <td className="p-2 border">{e.cliente_dni ?? '—'}</td>
                  <td className="p-2 border">{e.habitacion_id ?? '—'}</td>
                  <td className="p-2 border">{e.fecha_ingreso}</td>
                  <td className="p-2 border">{e.fecha_egreso}</td>
                  <td className="p-2 border">
                    <span
                      className="px-2 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: coloresEstado[e.estado_nombre?.toLowerCase()] || '#6b7280' }}
                    >
                      {e.estado_nombre}
                    </span>
                  </td>
                  <td className="p-2 border flex flex-col gap-1">
                    <button
                      onClick={() => router.push(`/pagos?nro_estadia=${e.nro_estadia}&estadia_id=${e.id}`)}
                      className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      + Pago
                    </button>
                    <button
                      onClick={() => router.push(`/estadias/editar/${e.id}`)}
                      className="text-sm bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Modificar
                    </button>
                    <button
                      onClick={() => eliminarEstadia(e.id)}
                      className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => setExpandirPagos((prev) => ({ ...prev, [e.id]: !prev[e.id] }))}
                      className="text-sm bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                    >
                      {expandirPagos[e.id] ? 'Ocultar Pagos' : 'Ver Pagos'}
                    </button>
                  </td>
                </tr>
                {expandirPagos[e.id] && (
                  <tr>
                    <td colSpan={7} className="p-2 border bg-gray-50">
                      <strong>Pagos:</strong>
                      <ul className="ml-4 list-disc text-sm">
                        {obtenerPagosEstadia(e.id).map((p) => (
                          <li key={p.id}>
                            {new Date(p.fecha_pago).toLocaleDateString()} - {p.monto} ({p.descripcion_tipo_pago})
                          </li>
                        ))}
                        {obtenerPagosEstadia(e.id).length === 0 && <li>Sin pagos registrados</li>}
                      </ul>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPaginaActual(i + 1)}
              className={`px-3 py-1 rounded ${paginaActual === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}