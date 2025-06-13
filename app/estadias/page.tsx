/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

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

  const fechaIngresoValida = filtroFechaIngreso
    ? new Date(e.fecha_ingreso) >= new Date(filtroFechaIngreso)
    : true;

  const fechaEgresoValida = filtroFechaEgreso
    ? new Date(e.fecha_egreso) <= new Date(filtroFechaEgreso)
    : true;

  return coincideEstado && coincideCliente && fechaIngresoValida && fechaEgresoValida;
});

if (estadiasFiltradas.length === 0) {
  return (
    <div className="text-center text-[#2C3639] mt-6">
      <p className="text-lg">No hay estadías que coincidan con los filtros seleccionados.</p>
    </div>
  );
} 


  const totalPaginas = Math.ceil(estadiasFiltradas.length / ITEMS_POR_PAGINA);
  const estadiasPaginadas = estadiasFiltradas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const obtenerPagosEstadia = (id: string) => pagos.filter((p) => p.estadia_id === id);

  const eliminarEstadia = async (id: string) => {
  if (!confirm('¿Seguro que querés eliminar esta estadía?')) return;

  const res = await fetch(`/api/estadias?id=${id}`, {
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

  const totalPagos = pagos.reduce((acc, p) => acc + Number(p.monto), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C3639]">Estadías</h1>
        <div className="flex gap-2">
          <button className="bg-[#A27B5B] text-white px-4 py-2 rounded hover:bg-[#8b6244] transition">Exportar CSV</button>
          <button onClick={() => router.push('/estadias/nueva')} className="bg-[#2C3639] text-white px-4 py-2 rounded hover:bg-[#1f272a] transition">+ Nueva estadía</button>
        </div>
      </div>

      <p className="mb-4 text-sm text-[#2C3639]">Total pagos registrados: <strong>${totalPagos.toFixed(2)}</strong></p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input type="text" placeholder="DNI" value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={filtroFechaIngreso} onChange={(e) => setFiltroFechaIngreso(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={filtroFechaEgreso} onChange={(e) => setFiltroFechaEgreso(e.target.value)} className="p-2 border rounded" />
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="p-2 border rounded">
          <option value="">Todos los estados</option>
          {Object.keys(coloresEstado).map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
        <button onClick={limpiarFiltros} className="bg-[#DCD7C9] px-4 py-2 rounded hover:bg-[#c9c4b7]">Limpiar</button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#2C3639] text-white">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Habitación</th>
              <th className="px-4 py-3">Ingreso</th>
              <th className="px-4 py-3">Egreso</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estadiasPaginadas.map((e) => (
              <>
                <tr key={e.id} className="border-b hover:bg-[#2C3639]">
                  <td className="px-4 py-2">{e.nro_estadia}</td>
                  <td className="px-4 py-2">{e.cliente_dni ?? '—'}</td>
                  <td className="px-4 py-2">{e.habitacion_numero - e.habitacion_nombre }</td>
                  <td className="px-4 py-2">{e.fecha_ingreso}</td>
                  <td className="px-4 py-2">{e.fecha_egreso}</td>
<td className="px-4 py-2">
  <span className="inline-block min-w-[150px] text-center px-3 py-1 rounded-md text-white text-sm font-medium" style={{ backgroundColor: coloresEstado[e.estado_nombre?.toLowerCase()] || '#6b7280' }}>
    {e.estado_nombre}
  </span>
</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => router.push(`/pagos?nro_estadia=${e.nro_estadia}&estadia_id=${e.id}`)} title="Agregar pago" className="bg-[#3F4E4F] text-white p-2 rounded hover:bg-[#2C3639]">
                        <DollarSign size={16} />
                      </button>
                     <button
  onClick={() => router.push(`/estadias/editar?id=${e.id}`)}
  title="Modificar"
  className="bg-[#A27B5B] text-white p-2 rounded hover:bg-[#8b6244]"
>
  <Pencil size={16} />
</button>

                    {(e.estado_nombre?.toLowerCase() === 'sin confirmar' || e.estado_nombre?.toLowerCase() === 'pendiente') && (
  <button
    onClick={() => eliminarEstadia(e.id)}
    title="Eliminar"
    className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
  >
    <Trash2 size={16} />
  </button>
)}

                      <button onClick={() => setExpandirPagos((prev) => ({ ...prev, [e.id]: !prev[e.id] }))} title="Ver pagos" className="bg-[#DCD7C9] text-[#2C3639] p-2 rounded hover:bg-[#c9c4b7]">
                        {expandirPagos[e.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandirPagos[e.id] && (
                  <tr>
                    <td colSpan={7} className="px-4 py-2 bg-[#2C3639]">
                      <strong>Pagos:</strong>
                      <ul className="ml-4 list-disc text-sm">
                        {obtenerPagosEstadia(e.id).map((p) => (
                          <li key={p.id}>{new Date(p.fecha_pago).toLocaleDateString()} - $:{p.monto} ({p.descripcion_tipo_pago})</li>
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
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button key={i + 1} onClick={() => setPaginaActual(i + 1)} className={`px-3 py-1 rounded-lg ${paginaActual === i + 1 ? 'bg-[#2C3639] text-white' : 'bg-[#DCD7C9] text-black'}`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
