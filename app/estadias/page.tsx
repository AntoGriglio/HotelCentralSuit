/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, DollarSign, ChevronDown, ChevronUp, Download, Users } from 'lucide-react';
import { formatearMoneda } from '@/lib/formato';

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
  const [filtroIngresoDesde, setFiltroIngresoDesde] = useState('');
  const [filtroIngresoHasta, setFiltroIngresoHasta] = useState('');
  const [filtroEgresoDesde, setFiltroEgresoDesde] = useState('');
  const [filtroEgresoHasta, setFiltroEgresoHasta] = useState('');
  const [expandirPagos, setExpandirPagos] = useState<Record<string, boolean>>({});
  const [paginaActual, setPaginaActual] = useState(1);

const [huespedes, setHuespedes] = useState<any[]>([]);
const [expandirHuespedes, setExpandirHuespedes] = useState<Record<string, boolean>>({});
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
useEffect(() => {
  const fetchHuespedes = async () => {
    const res = await fetch('/api/huespedes');
    const data = await res.json();
    setHuespedes(data);
  };
  fetchHuespedes();
}, []);

const obtenerHuespedesEstadia = (id: string) => huespedes.filter((h: any) => h.estadia_id === id);
  const estadiasFiltradas = estadias.filter((e) => {
    const coincideEstado = filtroEstado ? e.estado_nombre?.toLowerCase() === filtroEstado.toLowerCase() : true;
    const coincideCliente = filtroCliente ? e.cliente_dni?.toLowerCase().includes(filtroCliente.toLowerCase()) : true;

    const fechaIngresoValida = filtroIngresoDesde || filtroIngresoHasta
      ? (!filtroIngresoDesde || new Date(e.fecha_ingreso) >= new Date(filtroIngresoDesde)) &&
        (!filtroIngresoHasta || new Date(e.fecha_ingreso) <= new Date(filtroIngresoHasta))
      : true;

    const fechaEgresoValida = filtroEgresoDesde || filtroEgresoHasta
      ? (!filtroEgresoDesde || new Date(e.fecha_egreso) >= new Date(filtroEgresoDesde)) &&
        (!filtroEgresoHasta || new Date(e.fecha_egreso) <= new Date(filtroEgresoHasta))
      : true;

    const soloUnoActivo = !(filtroIngresoDesde || filtroIngresoHasta) || !(filtroEgresoDesde || filtroEgresoHasta);

    return coincideEstado && coincideCliente && soloUnoActivo && fechaIngresoValida && fechaEgresoValida;
  });

  const totalPaginas = Math.ceil(estadiasFiltradas.length / ITEMS_POR_PAGINA);
  const estadiasPaginadas = estadiasFiltradas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const obtenerPagosEstadia = (id: string) => pagos.filter((p: any) => p.estadia_id === id);

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
    setFiltroEstado('');
    setFiltroIngresoDesde('');
    setFiltroIngresoHasta('');
    setFiltroEgresoDesde('');
    setFiltroEgresoHasta('');
    setPaginaActual(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPagos = pagos.reduce((acc, p) => acc + Number(p.monto), 0);

  const exportarCSV = () => {
    const encabezado = 'ID,Cliente,Habitación,Ingreso,Egreso,Estado,Pagos';
    const filas = estadiasFiltradas.map((e) => {
      const pagosEstadia = obtenerPagosEstadia(e.id)
        .map((p: any) => `${new Date(p.fecha_pago).toLocaleDateString()} $${p.monto} (${p.descripcion_tipo_pago})`)
        .join(' | ');
      return `${e.nro_estadia},${e.cliente_dni},${e.habitacion_nombre},${e.fecha_ingreso},${e.fecha_egreso},${e.estado_nombre},${pagosEstadia}`;
    });
    const contenido = [encabezado, ...filas].join('\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'estadias_completo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-white text-[#2C3639]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C3639]">Estadías</h1>
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            className="bg-[#A27B5B] text-white px-4 py-2 rounded hover:bg-[#8b6244] transition"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => router.push('/estadias/nueva')}
            className="bg-[#2C3639] text-white px-4 py-2 rounded hover:bg-[#1f272a] transition"
          >
            + Nueva estadía
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <input type="text" placeholder="DNI" value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)} className="p-2 border rounded" />

        <div className="col-span-2">
          <label className="block text-sm text-[#2C3639] mb-1">Ingreso</label>
          <div className="flex gap-2">
            <input type="date" value={filtroIngresoDesde} onChange={(e) => { setFiltroIngresoDesde(e.target.value); setFiltroEgresoDesde(''); setFiltroEgresoHasta(''); }} className="p-2 border rounded w-full" placeholder="Ingreso desde" title="Ingreso desde" />
            <input type="date" value={filtroIngresoHasta} onChange={(e) => { setFiltroIngresoHasta(e.target.value); setFiltroEgresoDesde(''); setFiltroEgresoHasta(''); }} className="p-2 border rounded w-full" placeholder="Ingreso hasta" title="Ingreso hasta" />
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-[#2C3639] mb-1">Egreso</label>
          <div className="flex gap-2">
            <input type="date" value={filtroEgresoDesde} onChange={(e) => { setFiltroEgresoDesde(e.target.value); setFiltroIngresoDesde(''); setFiltroIngresoHasta(''); }} className="p-2 border rounded w-full" placeholder="Egreso desde" title="Egreso desde" />
            <input type="date" value={filtroEgresoHasta} onChange={(e) => { setFiltroEgresoHasta(e.target.value); setFiltroIngresoDesde(''); setFiltroIngresoHasta(''); }} className="p-2 border rounded w-full" placeholder="Egreso hasta" title="Egreso hasta" />
          </div>
        </div>

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
              <th className="px-4 py-3">Carga</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Habitación</th>
              <th className="px-4 py-3">Ingreso</th>
              <th className="px-4 py-3">Egreso</th>
              <th className="px-4 py-3">Saldo Pendiente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estadiasPaginadas.map((e) => (
              <tr key={e.id} className="border-b hover:bg-[#2C3639]/10">
                <td className="px-4 py-2">{e.nro_estadia}</td>
                <td className="px-4 py-2">
  {new Date(e.fecha_creacion).toISOString().slice(0, 10)}
</td>

                <td className="px-4 py-2">{e.cliente_dni ?? '—'}</td>
                <td className="px-4 py-2">{e.habitacion_nombre}</td>
                <td className="px-4 py-2">{e.fecha_ingreso}</td>
                <td className="px-4 py-2">{e.fecha_egreso}</td>
             <td className="px-4 py-2 text-left align-middle whitespace-nowrap">
  <div className="w-full text-left pl-1">{formatearMoneda(e.saldo_pendiente)}</div>
</td>
<td className="px-4 py-2 text-left align-middle whitespace-nowrap">
  <div className="w-full text-left pl-1">{formatearMoneda(e.total)}</div>
</td>

                <td className="px-4 py-2">
                  <span className="inline-block min-w-[150px] text-center px-3 py-1 rounded-md text-white text-sm font-medium" style={{ backgroundColor: coloresEstado[e.estado_nombre?.toLowerCase()] || '#6b7280' }}>
                    {e.estado_nombre}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 flex-wrap">
                    {['pendiente', 'reservado'].includes(e.estado_nombre?.toLowerCase()) && (
  <button onClick={() => router.push(`/pagos?nro_estadia=${e.nro_estadia}&estadia_id=${e.id}`)} title="Agregar pago" className="bg-[#3F4E4F] text-white p-2 rounded hover:bg-[#2C3639]">
    <DollarSign size={16} />
  </button>
)}

                    <button onClick={() => router.push(`/estadias/editar?id=${e.id}`)} title="Modificar" className="bg-[#A27B5B] text-white p-2 rounded hover:bg-[#8b6244]">
                      <Pencil size={16} />
                    </button>
                    {(e.estado_nombre?.toLowerCase() === 'sin confirmar' || e.estado_nombre?.toLowerCase() === 'pendiente') && (
                      <button onClick={() => eliminarEstadia(e.id)} title="Eliminar" className="bg-red-600 text-white p-2 rounded hover:bg-red-700">
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button onClick={() => setExpandirPagos((prev) => ({ ...prev, [e.id]: !prev[e.id] }))} title="Ver pagos" className="bg-[#DCD7C9] text-[#2C3639] p-2 rounded hover:bg-[#c9c4b7]">
                      {expandirPagos[e.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  {['reservado', 'pagado'].includes(e.estado_nombre?.toLowerCase()) && (
  <>
    <button
      onClick={() => router.push(`/huesped/nuevo?nro_estadia=${e.nro_estadia}&estadia_id=${e.id}`)}
      title="Agregar huéspedes"
      className="bg-[#4B5563] text-white p-2 rounded hover:bg-[#374151]"
    >
      <Users size={16} />
    </button>
    <button
      onClick={() => setExpandirHuespedes((prev) => ({ ...prev, [e.id]: !prev[e.id] }))}
      title="Ver huéspedes"
      className="bg-[#E5E7EB] text-[#1F2937] p-2 rounded hover:bg-[#D1D5DB]"
    >
      {expandirHuespedes[e.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  </>
)}
{expandirHuespedes[e.id] && (
  <div className="mt-2 text-sm text-[#2C3639] bg-[#f3f4f6] rounded p-2">
    <strong>Huéspedes:</strong>
    <ul className="ml-4 list-disc">
      {obtenerHuespedesEstadia(e.id).map((h) => (
        <li key={h.id}>
          {h.nombre_completo} - DNI: {h.dni} {h.fecha_nacimiento && ` - Nac.: ${new Date(h.fecha_nacimiento).toLocaleDateString()}`}
        </li>
      ))}
      {obtenerHuespedesEstadia(e.id).length === 0 && <li>Sin huéspedes registrados</li>}
    </ul>
  </div>
)}

                  {expandirPagos[e.id] && (
                    <div className="mt-2 text-sm text-[#2C3639] bg-[#f3f4f6] rounded p-2">
                      <strong>Pagos:</strong>
                      <ul className="ml-4 list-disc">
                        {obtenerPagosEstadia(e.id).map((p) => (
  <li key={p.id} className="flex items-center justify-between">
    <span>
      {new Date(p.fecha_pago).toLocaleDateString()} - {formatearMoneda(p.monto)} ({p.descripcion_tipo_pago})
    </span>
    {p.comprobante_pago && (
      <a
        href={p.comprobante_pago}
        target="_blank"
        rel="noopener noreferrer"
        title="Descargar comprobante"
        className="ml-2 text-[#374e4e] hover:text-[#2C3639] transition"
      >
        <Download size={18} />
      </a>
    )}
  </li>
))}

                        {obtenerPagosEstadia(e.id).length === 0 && <li>Sin pagos registrados</li>}
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
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
