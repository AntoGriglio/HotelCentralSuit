
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, DollarSign, ChevronDown, ChevronUp, Download, Users } from 'lucide-react';
import { formatearMoneda } from '@/lib/formato';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const coloresEstado: Record<string, string> = {
  'sin confirmar': '#9ca3af',
  'pendiente': '#facc15',
  'reservado': '#3b82f6',
  'pagado': '#22c55e',
  'anulada': '#ef4444',
  'cancelada': '#f97316',
  'cancelada pendiente': '#eab308',
};



export default function ListaEstadias() {

  const [estadias, setEstadias] = useState<any[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroNombreCliente, setFiltroNombreCliente] = useState('');
  const [filtroIngresoDesde, setFiltroIngresoDesde] = useState('');
  const [filtroIngresoHasta, setFiltroIngresoHasta] = useState('');
  const [filtroEgresoDesde, setFiltroEgresoDesde] = useState('');
  const [filtroEgresoHasta, setFiltroEgresoHasta] = useState('');
  const [expandirPagos, setExpandirPagos] = useState<Record<string, boolean>>({});
  const [paginaActual, setPaginaActual] = useState(1);

  const router = useRouter();
const [filtroNumeroEstadia, setFiltroNumeroEstadia] = useState('');
const [filtroNombreHabitacion, setFiltroNombreHabitacion] = useState('');
const sectionTitleStyle = {
  fontWeight: 'bold',
  textDecoration: 'underline',
  marginTop: '20px',
  marginBottom: '6px',
} as const

const itemStyle = {
  margin: '2px 0',
  borderBottom: '1px solid #000',
  paddingBottom: '2px',
} as const

const paragraphStyle = {
  fontSize: '10pt',
  marginBottom: '6px',
} as const
const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-AR')
}
const planillaRef = useRef<HTMLDivElement>(null)
const ITEMS_POR_PAGINA = 10;
const calcularNoches = (ingreso: string, egreso: string) => {
  const fechaIngreso = new Date(ingreso)
  const fechaEgreso = new Date(egreso)
  const diff = Math.ceil((fechaEgreso.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}
  useEffect(() => {
    const fetchData = async () => {
      const resEstadias = await fetch('/api/estadias');
      const dataEstadias = await resEstadias.json();
      setEstadias(dataEstadias);
    };
    fetchData();
  }, []);

  const estadiasFiltradas = estadias.filter((e) => {
  if (e.estado_nombre?.toLowerCase() !== 'sin confirmar') return false;
     const coincideCliente = filtroCliente
  ? (e.cliente_dni?.toLowerCase().includes(filtroCliente.toLowerCase()) ||
     e.cliente_nombre?.toLowerCase().includes(filtroCliente.toLowerCase()))
  : true;

const coincideNombreCliente = filtroNombreCliente
  ? e.cliente_nombre?.toLowerCase().includes(filtroNombreCliente.toLowerCase())
  : true;

const coincideNumeroEstadia = filtroNumeroEstadia
  ? e.nro_estadia?.toString().includes(filtroNumeroEstadia)
  : true;

const coincideNombreHabitacion = filtroNombreHabitacion
  ? e.habitacion_nombre?.toLowerCase().includes(filtroNombreHabitacion.toLowerCase())
  : true;

    const fechaIngresoValida = filtroIngresoDesde || filtroIngresoHasta
      ? (!filtroIngresoDesde || new Date(e.fecha_ingreso) >= new Date(filtroIngresoDesde)) &&
        (!filtroIngresoHasta || new Date(e.fecha_ingreso) <= new Date(filtroIngresoHasta))
      : true;

    const fechaEgresoValida = filtroEgresoDesde || filtroEgresoHasta
      ? (!filtroEgresoDesde || new Date(e.fecha_egreso) >= new Date(filtroEgresoDesde)) &&
        (!filtroEgresoHasta || new Date(e.fecha_egreso) <= new Date(filtroEgresoHasta))
      : true;

    const soloUnoActivo = !(filtroIngresoDesde || filtroIngresoHasta) || !(filtroEgresoDesde || filtroEgresoHasta);
// ⚠️ DIV oculto donde se va a renderizar la planilla para capturar




return coincideCliente && coincideNombreCliente && coincideNumeroEstadia && coincideNombreHabitacion && soloUnoActivo && fechaIngresoValida && fechaEgresoValida;
 });

  const totalPaginas = Math.ceil(estadiasFiltradas.length / ITEMS_POR_PAGINA);
  const estadiasPaginadas = estadiasFiltradas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

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
  return (
    <div className="p-6 bg-white text-[#2C3639] bg-white text-[#2C3639]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C3639]">Estadías</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/estadias/nueva')}
            className="bg-[#2C3639] text-white px-4 py-2 rounded hover:bg-[#1f272a] transition"
          >
            + Nueva estadía
          </button>
        </div>
      </div>

   <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 text-[#2C3639]">
  {/* Fila 1 */}
  <input
    type="text"
    placeholder="DNI"
    value={filtroCliente}
    onChange={(e) => setFiltroCliente(e.target.value)}
    className="p-2 border rounded"
  />
  <input
    type="text"
    placeholder="Nombre cliente"
    value={filtroNombreCliente}
    onChange={(e) => setFiltroNombreCliente(e.target.value)}
    className="p-2 border rounded"
  />
  <input
    type="text"
    placeholder="N° Estadía"
    className="p-2 border rounded"
    value={filtroNumeroEstadia}
    onChange={(e) => setFiltroNumeroEstadia(e.target.value)}
  />
  <input
    type="text"
    placeholder="Habitación"
    className="p-2 border rounded"
    value={filtroNombreHabitacion}
    onChange={(e) => setFiltroNombreHabitacion(e.target.value)}
  />
  <button
    onClick={limpiarFiltros}
    className="bg-[#DCD7C9] px-4 py-2 rounded hover:bg-[#c9c4b7]"
  >
    Limpiar
  </button>
</div>

{/* Fila 2: Fechas en una nueva línea */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div>
    <label className="block text-sm mb-1">Ingreso</label>
    <div className="flex gap-2">
      <input
        type="date"
        value={filtroIngresoDesde}
        onChange={(e) => {
          setFiltroIngresoDesde(e.target.value);
          setFiltroEgresoDesde('');
          setFiltroEgresoHasta('');
        }}
        className="p-2 border rounded w-full"
        placeholder="Ingreso desde"
        title="Ingreso desde"
      />
      <input
        type="date"
        value={filtroIngresoHasta}
        onChange={(e) => {
          setFiltroIngresoHasta(e.target.value);
          setFiltroEgresoDesde('');
          setFiltroEgresoHasta('');
        }}
        className="p-2 border rounded w-full"
        placeholder="Ingreso hasta"
        title="Ingreso hasta"
      />
    </div>
  </div>

  <div>
    <label className="block text-sm mb-1">Egreso</label>
    <div className="flex gap-2">
      <input
        type="date"
        value={filtroEgresoDesde}
        onChange={(e) => {
          setFiltroEgresoDesde(e.target.value);
          setFiltroIngresoDesde('');
          setFiltroIngresoHasta('');
        }}
        className="p-2 border rounded w-full"
        placeholder="Egreso desde"
        title="Egreso desde"
      />
      <input
        type="date"
        value={filtroEgresoHasta}
        onChange={(e) => {
          setFiltroEgresoHasta(e.target.value);
          setFiltroIngresoDesde('');
          setFiltroIngresoHasta('');
        }}
        className="p-2 border rounded w-full"
        placeholder="Egreso hasta"
        title="Egreso hasta"
      />
    </div>
  </div>
</div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#2C3639] text-white">
            <tr>
              <th className="px-4 py-3">N°</th>
              <th className="px-4 py-3">Carga</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Habitación</th>
              <th className="px-4 py-3">Ingreso</th>
              <th className="px-4 py-3">Egreso</th>
              <th className="px-4 py-3">Noches</th>
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
        <td className="px-4 py-2">{formatearFecha(e.fecha_creacion)}</td>
      <td className="px-4 py-2">{e.nombre}, Teléfono: {e.telefono ?? '—'}</td>
      <td className="px-4 py-2">{e.habitacion_nombre}</td>
     <td className="px-4 py-2">{formatearFecha(e.fecha_ingreso)}</td>
<td className="px-4 py-2">{formatearFecha(e.fecha_egreso)}</td>
      <td className="px-4 py-2">{calcularNoches(e.fecha_ingreso, e.fecha_egreso)}</td>
      <td className="px-4 py-2 text-left align-middle whitespace-nowrap">
        <div className="w-full text-left pl-1">{formatearMoneda(e.total)}</div>
      </td>
      <td className="px-4 py-2">
        <span
          className="inline-block min-w-[150px] text-center px-3 py-1 rounded-md text-white text-sm font-medium"
          style={{ backgroundColor: coloresEstado[e.estado_nombre?.toLowerCase()] || '#6b7280' }}
        >
          {e.estado_nombre}
        </span>
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => router.push(`/estadias/editar?id=${e.id}`)}
            title="Modificar"
            className="w-9 h-9 flex items-center justify-center rounded bg-[#A27B5B] hover:bg-[#8b6244] text-white"
          >
            <Pencil size={16} />
          </button>

          {(e.estado_nombre?.toLowerCase() === 'sin confirmar' || e.estado_nombre?.toLowerCase() === 'pendiente') && (
            <button
              onClick={() => eliminarEstadia(e.id)}
              title="Eliminar"
              className="w-9 h-9 flex items-center justify-center rounded bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
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
    
</div>)}