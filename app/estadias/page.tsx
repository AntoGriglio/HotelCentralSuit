
/* eslint-disable @next/next/no-img-element */

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

  const [planillaData, setPlanillaData] = useState<any | null>(null)
  const [estadias, setEstadias] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroNombreCliente, setFiltroNombreCliente] = useState('');
  const [filtroIngresoDesde, setFiltroIngresoDesde] = useState('');
  const [filtroIngresoHasta, setFiltroIngresoHasta] = useState('');
  const [filtroEgresoDesde, setFiltroEgresoDesde] = useState('');
  const [filtroEgresoHasta, setFiltroEgresoHasta] = useState('');
  const [expandirPagos, setExpandirPagos] = useState<Record<string, boolean>>({});
  const [paginaActual, setPaginaActual] = useState(1);

const [huespedes, setHuespedes] = useState<any[]>([]);
const [expandirHuespedes, setExpandirHuespedes] = useState<Record<string, boolean>>({});
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
const generarPlanillaPDF = async (estadiaId: string, nroEstadia: number) => {
  const res = await fetch(`/api/planilla?id=${estadiaId}`)
  const data = await res.json()
  setPlanillaData(data)

  setTimeout(async () => {
    if (!planillaRef.current) return
    const canvas = await html2canvas(planillaRef.current)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0)
    pdf.save(`planilla_estadia_${nroEstadia}.pdf`)
    setPlanillaData(null) // limpiar para la próxima
  }, 300) // espera que renderice el DOM
}
const obtenerHuespedesEstadia = (id: string) => huespedes.filter((h: any) => h.estadia_id === id);
  const estadiasFiltradas = estadias.filter((e) => {
  if (e.estado_nombre?.toLowerCase() === 'sin confirmar') return false;

  const coincideEstado = filtroEstado
    ? e.estado_nombre?.toLowerCase() === filtroEstado.toLowerCase()
    : true;
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




return coincideEstado && coincideCliente && coincideNombreCliente && coincideNumeroEstadia && coincideNombreHabitacion && soloUnoActivo && fechaIngresoValida && fechaEgresoValida;
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
    <div className="p-6 bg-white text-[#2C3639] bg-white text-[#2C3639]">
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
  <select
  value={filtroEstado}
  onChange={(e) => setFiltroEstado(e.target.value)}
  className="p-2 border rounded"
>
  <option value="">Todos los estados</option>
  {Object.keys(coloresEstado)
    .filter((estado) => estado.toLowerCase() !== 'sin confirmar')
    .map((estado) => (
      <option key={estado} value={estado}>{estado}</option>
    ))}
</select>

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
              <th className="px-4 py-3">Cliente</th>
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
  {estadiasPaginadas.length === 0 ? (
    <tr>
      <td colSpan={11} className="text-center py-6 text-gray-500">
        No se encontraron estadías con los filtros aplicados.
      </td>
    </tr>
  ) : (
    estadiasPaginadas.map((e) => (
      <tr key={e.id} className="border-b hover:bg-[#2C3639]/10">
                <td className="px-4 py-2">{e.nro_estadia}</td>
                <td className="px-4 py-2">{formatearFecha(e.fecha_creacion)}</td>
                <td className="px-4 py-2">{e.cliente_nombre}, DNI:{e.cliente_dni ?? '—'}</td>

                <td className="px-4 py-2">{e.habitacion_nombre}</td>
<td className="px-4 py-2">{formatearFecha(e.fecha_ingreso)}</td>
<td className="px-4 py-2">{formatearFecha(e.fecha_egreso)}</td>
                <td className="px-4 py-2">{calcularNoches(e.fecha_ingreso, e.fecha_egreso)}</td>

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
    <>
      <button
        onClick={() => router.push(`/pagos?nro_estadia=${e.nro_estadia}&estadia_id=${e.id}`)}
        title="Agregar pago"
        className="w-9 h-9 flex items-center justify-center rounded bg-[#3F4E4F] hover:bg-[#2C3639] text-white"
      >
        <DollarSign size={16} />
      </button>
    </>
  )}

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

  <button
    onClick={() => setExpandirPagos((prev) => ({ ...prev, [e.id]: !prev[e.id] }))}
    title="Ver pagos"
    className="w-9 h-9 flex items-center justify-center rounded bg-[#DCD7C9] hover:bg-[#c9c4b7] text-[#2C3639]"
  >
    {expandirPagos[e.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  </button>

<button
  onClick={() => generarPlanillaPDF(e.id, e.nro_estadia)}
  title="Descargar planilla"
  className="w-9 h-9 flex items-center justify-center rounded bg-green-600 hover:bg-green-700 text-white"
>
  <Download size={16} />
</button>


  {['reservado', 'pagado'].includes(e.estado_nombre?.toLowerCase()) && (
    <>
      <button
        onClick={() => router.push(`/huesped/nuevo?nro_estadia=${e.nro_estadia}&estadia_id=${e.id}`)}
        title="Agregar huéspedes"
        className="w-9 h-9 flex items-center justify-center rounded bg-[#4B5563] hover:bg-[#374151] text-white"
      >
        <Users size={16} />
      </button>

      <button
        onClick={() => setExpandirHuespedes((prev) => ({ ...prev, [e.id]: !prev[e.id] }))}
        title="Ver huéspedes"
        className="w-9 h-9 flex items-center justify-center rounded bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#1F2937]"
      >
        {expandirHuespedes[e.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <button
        onClick={() => router.push(`/vehiculo/nuevo?estadia_id=${e.id}&nro_estadia=${e.nro_estadia}`)}
        title="Ingresar vehículo"
        className="w-9 h-9 flex items-center justify-center rounded bg-[#A27B5B] hover:bg-[#8b6244] text-white"
      >
        🚗
      </button>
    </>
  )}
</div>
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
    ))
  )}
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
      {planillaData && (
  <div
    ref={planillaRef}
    style={{
      position: 'absolute',
      top: '-9999px',
      left: '-9999px',
      width: '800px',
      padding: '30px',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.4',
    }}
  >
    {/* Header con logo y datos de la estadía */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <img src="/logo.png" alt="logo" style={{ height: '80px' }} />
      <div style={{ width: '60%', fontSize: '10.5pt' }}>
        <div style={itemStyle}><strong>Habitación Nº:</strong> {planillaData.unidad?.nombre}</div>
        <div style={itemStyle}><strong>Tipo:</strong> {planillaData.tipo_habitacion?.nombre}</div>
        <div style={itemStyle}><strong>Check in:</strong> {planillaData.estadia.fecha_ingreso}</div>
        <div style={itemStyle}><strong>Check out:</strong> {planillaData.estadia.fecha_egreso}</div>
      </div>
    </div>

    {/* Datos del cliente */}
    <div style={sectionTitleStyle}>DATOS DEL TITULAR</div>
    <div style={itemStyle}><strong>Nombre y apellido:</strong> {planillaData.cliente?.nombre_completo}</div>
    <div style={itemStyle}><strong>Teléfono:</strong> {planillaData.cliente?.telefono} &nbsp;&nbsp;&nbsp; <strong>DNI:</strong> {planillaData.cliente?.dni}</div>
    <div style={itemStyle}><strong>Localidad:</strong> {planillaData.cliente?.localidad} &nbsp;&nbsp;&nbsp; <strong>E-mail:</strong> {planillaData.cliente?.email}</div>
    <div style={itemStyle}><strong>Dirección:</strong></div>
    <div style={itemStyle}><strong>Provincia:</strong> {planillaData.cliente?.provincia} &nbsp;&nbsp;&nbsp; <strong>Fecha de nacimiento:</strong></div>
    <div style={itemStyle}><strong>Nacionalidad:</strong> Argentina</div>
    <div style={itemStyle}><strong>Patente/marca/modelo/color:</strong> {planillaData.vehiculo ? `${planillaData.vehiculo.patente} / ${planillaData.vehiculo.marca} / ${planillaData.vehiculo.modelo} / ${planillaData.vehiculo.color}` : ''}</div>
    <div style={itemStyle}><strong>Dietas:</strong></div>

    {/* Acompañantes */}
    <div style={sectionTitleStyle}>ACOMPAÑANTES</div>
    {planillaData.huespedes.length > 0 ? (
      planillaData.huespedes.map((a: any, i: number) => (
        <div key={i} style={itemStyle}>{a.nombre_completo} - DNI: {a.dni}</div>
      ))
    ) : (
      <div style={itemStyle}>—</div>
    )}

    {/* Condiciones */}
    <div style={sectionTitleStyle}>CONDICIONES</div>
    <p style={paragraphStyle}>
      El huésped declara haber recibido y aceptado las políticas generales de “Central Suites” al momento del ingreso. El horario de check-in es a partir de las 14 hs y el horario de check-out es hasta las 10 hs, siendo fundamental respetar estos plazos para garantizar el buen funcionamiento del servicio. El ingreso de personas no registradas en el establecimiento está estrictamente prohibido por razones de seguridad y control, de lo contrario el valor de la ocupación será cargado a la cuenta del cliente. Asimismo, está terminantemente prohibido fumar en las habitaciones y en las áreas comunes cerradas. No se permiten mascotas o cualquier otro animal en el interior del hotel.
    </p>
    <p style={paragraphStyle}>
      El huésped será responsable de cualquier daño, rotura o pérdida ocasionada en la habitación, el mobiliario o los elementos provistos durante su estadía, debiendo abonar el costo correspondiente en caso de ser necesario. “Central Suites” no se hace responsable por objetos personales o de valor no declarados y guardados en recepción.
    </p>
    <p style={paragraphStyle}>
      Los pedidos de early check-in o late check-out podrán ser considerados según disponibilidad, estos servicios tienen un costo adicional, y se podrán efectuar siempre que se realicen con previo aviso y hayan sido autorizados por administración.
    </p>
    <p style={paragraphStyle}>
      El pago total de la estadía deberá efectuarse al momento del ingreso, sin excepción. En caso de retiro anticipado, no se realizará devolución por las noches no utilizadas. No se permiten ruidos molestos, con el fin de preservar el descanso de todos los huéspedes.
    </p>

    {/* Firma */}
    <div style={{ marginTop: '40px' }}>
      FIRMA: ________________________________________________________________
    </div>
  </div>
)}


    </div>
  );
}


