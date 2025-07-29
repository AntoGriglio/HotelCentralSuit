
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Actualizado: RegistrarPago.tsx con soporte para subir comprobante (imagen o PDF) a Supabase

'use client';
 
import { useEffect, useState, useRef, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabaseClient';
import { formatearMoneda } from '@/lib/formato';
import InputMoneda from './inputMoneda';
import Loader from './loader';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
export default function RegistrarPago() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reciboRef = useRef<HTMLDivElement | null>(null);
  const supabase = createPagesBrowserClient()
  const estadiaIdFromUrl = searchParams.get('estadia_id');
  const [estadias, setEstadias] = useState<any[]>([]);
  const [tiposPago, setTiposPago] = useState<any[]>([]);
  const [formasPago, setFormasPago] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [pendiente, setPendiente] = useState<number | null>(null);
  const [montoReserva, setMontoReserva] = useState<number | null>(null);
  const [clienteNombre, setClienteNombre] = useState('');
  const [habitacionNumero, setHabitacionNumero] = useState('');
const [clienteEmail, setClienteEmail] = useState('');

  const [pago, setPago] = useState({
    estadiaId: '',
    tipoPagoId: '',
    formaPagoId: '',
    monto: '',
    comprobantePago: null as File | null,
    fechaPago: new Date().toISOString().split('T')[0],
  });

  const [pagosEstadia, setPagosEstadia] = useState<any[]>([]);
const [cargando, setCargando] = useState(true)

useEffect(() => {
  const datosCompletos = 
    mensaje.includes('Pago registrado') &&
    clienteNombre.trim().length > 0 &&
    habitacionNumero.toString().trim().length > 0 &&
    pago.monto.toString().trim().length > 0;

  if (datosCompletos) {
    generarPDF();
  } else {
  }
}, [mensaje, clienteNombre, habitacionNumero, pago.monto]);

useEffect(() => {
  const fetchData = async () => {
    const [resEstadias, resTipos, resFormas] = await Promise.all([
      fetch('/api/estadias'),
      fetch('/api/tipos-pago'),
      fetch('/api/formas-pago')
    ]);

    const dataEstadias = await resEstadias.json();
    const dataTipos = await resTipos.json();
    const dataFormas = await resFormas.json();

    setEstadias(dataEstadias);
    setTiposPago(dataTipos);
    setFormasPago(dataFormas);

    if (estadiaIdFromUrl) {
      setPago(prev => ({ ...prev, estadiaId: estadiaIdFromUrl }));

      // 👉 Buscar la estadía correspondiente
      const estadiaSeleccionada = dataEstadias.find((e: any) => e.id === estadiaIdFromUrl);
      if (estadiaSeleccionada) {
        // 👉 Setear número de habitación directamente
        setHabitacionNumero(estadiaSeleccionada.habitacion_numero || '');

        // 👉 Buscar cliente por DNI
        const clienteDNI = estadiaSeleccionada.cliente_dni;

        try {
          const resCliente = await fetch(`/api/clientes?dni=${clienteDNI}`);
         
          const dataCliente = await resCliente.json();
          setClienteNombre(dataCliente?.nombre_completo || `Cliente DNI: ${clienteDNI}`);
setClienteEmail(dataCliente?.email || '');

        } catch (error) {
          console.error('Error buscando cliente:', error);
          setClienteNombre(`Cliente DNI: ${clienteDNI}`);
        }
      }

      await cargarPagos(estadiaIdFromUrl, dataEstadias);
      setCargando(false)

    }
  };

  fetchData();
}, [estadiaIdFromUrl]);


  const cargarPagos = async (estadiaId: string, listaEstadias?: any[]) => {
    const res = await fetch('/api/pagos');
    const data = await res.json();
    const pagos = data.filter((p: any) => p.estadia_id === estadiaId);
    setPagosEstadia(pagos);
    calcularPendienteYReserva(estadiaId, listaEstadias, pagos);
  };

  const calcularPendienteYReserva = (id: string, lista?: any[], pagos?: any[]) => {
    const listaEstadias = lista || estadias;
    const pagosUsar = pagos || pagosEstadia;
    const est = listaEstadias.find((e: any) => e.id === id);
    if (!est) return;

    const total = parseFloat(est.total || 0);
    const reserva = parseFloat(est.monto_reserva || 0);
    const suma = pagosUsar.reduce((acc: number, p: any) => acc + parseFloat(p.monto || 0), 0);

    setPendiente(total - suma);
    setMontoReserva(reserva);
  };

  const handleTipoPagoChange = (tipoPagoId: string) => {
    const estadiaSeleccionada = estadias.find(e => e.id === pago.estadiaId);
    const tipoReserva = tiposPago.find(tp => tp.descripcion === 'Reserva');
    const tipoSaldo = tiposPago.find(tp => tp.descripcion.includes('Saldo'));
    const yaTieneReserva = pagosEstadia.some((p: any) => p.tipo_pago_id === tipoReserva?.id);

    let nuevoMonto = pago.monto;

    if (tipoReserva && tipoPagoId === tipoReserva.id && !yaTieneReserva && estadiaSeleccionada?.monto_reserva) {
      nuevoMonto = estadiaSeleccionada.monto_reserva;
    }

    if (yaTieneReserva && tipoSaldo) {
      tipoPagoId = tipoSaldo.id;
      nuevoMonto = pendiente?.toFixed(2) || '';
    }

    setPago({ ...pago, tipoPagoId, monto: nuevoMonto });
  };
const generarPDF = async () => {
  if (!clienteNombre || !habitacionNumero || !pago.monto) return

  const tipoPagoDesc = tiposPago.find(tp => tp.id === pago.tipoPagoId)?.descripcion || ''
  const formaPagoDesc = formasPago.find(fp => fp.id === pago.formaPagoId)?.descripcion || ''
  const estadiaSeleccionada = estadias.find(e => e.id === pago.estadiaId)
  if (!estadiaSeleccionada) return

  const fechaIngreso = new Date(estadiaSeleccionada.fecha_ingreso).toLocaleDateString('es-AR')
  const fechaEgreso = new Date(estadiaSeleccionada.fecha_egreso).toLocaleDateString('es-AR')

  const conceptoTexto = tipoPagoDesc.includes('Reserva')
    ? `Reserva de estadía desde ${fechaIngreso} hasta ${fechaEgreso}`
    : `Pago correspondiente a estadía desde ${fechaIngreso} hasta ${fechaEgreso}`

  const fechaPagoFormateada = new Date(pago.fechaPago).toLocaleDateString('es-AR')
  const montoFormateado = `$${parseFloat(pago.monto).toFixed(2)}`

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 50
  const lineSpacing = 30
  let y = margin

  // 🟡 Borde
  pdf.setDrawColor('#2C3639')
  pdf.setLineWidth(2)
  pdf.rect(margin - 20, margin - 20, pageWidth - 2 * (margin - 20), 720)

  // 🟡 Logo
  const logo = new Image()
  logo.src = '/logo.png' // asegurate que esté en /public/logo.png
  await new Promise(resolve => {
    logo.onload = () => {
      pdf.addImage(logo, 'PNG', margin, y, 60, 60)
      resolve(null)
    }
  })

  // 🟡 Hotel y Título
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text('Central Suites Hotel', margin + 70, y + 25)
  pdf.setFontSize(16)
  pdf.text('COMPROBANTE DE PAGO', pageWidth - margin, y + 25, { align: 'right' })

  y += 70

  // 🟡 Fecha
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(12)
  pdf.text(`Fecha de emisión: ${fechaPagoFormateada}`, pageWidth - margin, y, { align: 'right' })

  y += lineSpacing

  const datos = [
    ['Recibí de:', clienteNombre],
    ['Habitación:', habitacionNumero],
    ['La suma de:', montoFormateado],
    ['Forma de pago:', formaPagoDesc],
    ['En concepto de:', conceptoTexto],
  ]

  datos.forEach(([label, valor]) => {
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${label}`, margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${valor}`, margin + 140, y)
    y += lineSpacing
  })

  y += 20
  pdf.setLineWidth(0.5)
  pdf.setDrawColor(150)
  pdf.line(margin, y, pageWidth - margin, y)
  y += lineSpacing


  // 🟡 Guardar y enviar
  const nombreArchivo = `comprobante_${clienteNombre.replaceAll(' ', '_')}_${pago.fechaPago}.pdf`
  pdf.save(nombreArchivo)

  const blob = pdf.output('blob')
  const formData = new FormData()
  formData.append('to', clienteEmail)
  formData.append('pdf', blob, 'comprobante_pago.pdf')

  await fetch('/api/enviar-comprobante', {
    method: 'POST',
    body: formData,
  })
}
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setCargando(true)

  try {
    const montoIngresado = parseFloat(pago.monto || '0');

    let comprobanteURL = '';
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      alert('Debés iniciar sesión para subir archivos.')
      throw new Error('Sesión no iniciada')
    }
    if (pago.comprobantePago) {
      const archivo = pago.comprobantePago;
      const extension = archivo.name.split('.').pop();
      const nombreArchivo = `comprobante_${Date.now()}.${extension}`;

      const { data, error } = await supabase.storage
        .from('comprobantes-pago')
        .upload(nombreArchivo, archivo, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error || !data) {
        console.error('❌ Error al subir comprobante:', error);
        setMensaje('Error al subir comprobante (ver consola)');
        return;
      }

      const { data: urlData } = supabase
        .storage
        .from('comprobantes-pago')
        .getPublicUrl(data.path);

      if (!urlData.publicUrl) {
        setMensaje('No se pudo obtener URL pública del comprobante');
        return;
      }

      comprobanteURL = urlData.publicUrl;
    }

    // Enviar el pago a la API
    const res = await fetch('/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estadia_id: pago.estadiaId,
        tipo_pago_id: pago.tipoPagoId,
        forma_pago_id: pago.formaPagoId,
        monto: montoIngresado,
        comprobante_pago: comprobanteURL,
        fecha_pago: pago.fechaPago
      }),
     credentials: 'include', 
    });

  if (res.ok) {
  setMensaje('✅ Pago registrado correctamente');
  await cargarPagos(pago.estadiaId);
  setTimeout(() => {
    router.push('/estadias');
  }, 1500);

    } else {
      const error = await res.json();
      setMensaje(error.error || '❌ Error al registrar el pago');
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    setMensaje('❌ Error inesperado');
  } finally {
    setCargando(false);
  }
};

if (cargando) return <Loader/>

  return (
    <div className="min-h-screen bg-[#3F4E4F] flex flex-col items-center p-6">
      <div ref={reciboRef} className="w-full max-w-xl bg-[#DCD7C9] p-8 rounded-2xl shadow-lg font-sans">
                <button
  type="button"
  onClick={() => router.back()}
  className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
>
  ← Atrás
</button>

        <h1 className="text-2xl font-bold mb-4 text-center text-[#2C3639]">Registrar Pago</h1>
        {clienteNombre && (
          <p className="text-center mb-2 text-[#2C3639] font-semibold">
            Cliente: {clienteNombre} — Habitación: {habitacionNumero}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {pendiente !== null && (
            <p className="text-[#2C3639] font-semibold">
              Saldo pendiente: {formatearMoneda(pendiente.toFixed(2))}
            </p>
          )}

          <label className="block">
            <span className="text-[#2C3639]">Tipo de pago</span>
            <select
              required
              value={pago.tipoPagoId}
              onChange={(e) => handleTipoPagoChange(e.target.value)}
              className="w-full mt-1 p-2 border border-[#A27B5B] rounded text-[#2C3639]"
            >
              <option value="">Seleccione tipo</option>
              {tiposPago.map(tp => {
                const descripcion = tp.descripcion.toLowerCase();
                const yaTieneReserva = pagosEstadia.some(p => p.tipo_pago_id === tp.id && descripcion === 'Reserva');
                if (yaTieneReserva || descripcion === 'Saldo') {
                  return <option key={tp.id} value={tp.id}>{tp.descripcion}</option>;
                }
                return descripcion !== 'Saldo' ? <option key={tp.id} value={tp.id}>{tp.descripcion}</option> : null;
              })}
            </select>
          </label>

          <label className="block">
            <span className="text-[#2C3639]">Forma de pago</span>
            <select
              required
              value={pago.formaPagoId}
              onChange={(e) => setPago({ ...pago, formaPagoId: e.target.value })}
              className="w-full mt-1 p-2 border border-[#A27B5B] rounded text-[#2C3639]"
            >
              <option value="">Seleccione forma</option>
              {formasPago.map(fp => (
                <option key={fp.id} value={fp.id}>{fp.descripcion}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[#2C3639]">Monto</span>
            <InputMoneda
  valorInicial={pago.monto}
 onCambio={(nuevoValor) => setPago({ ...pago, monto: nuevoValor.toString() })}

  className="w-full mt-1 p-2 border border-[#A27B5B] rounded text-[#2C3639]"
/>

          </label>

          <label className="block">
            <span className="text-[#2C3639]">Comprobante</span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setPago({ ...pago, comprobantePago: e.target.files?.[0] || null })}
              className="w-full mt-1 p-2 border border-[#A27B5B] rounded text-[#2C3639] bg-white"
            />
          </label>

          <label className="block">
            <span className="text-[#2C3639]">Fecha de pago</span>
            <input
              type="date"
              required
              value={pago.fechaPago}
              onChange={(e) => setPago({ ...pago, fechaPago: e.target.value })}
              className="w-full mt-1 p-2 border border-[#A27B5B] rounded text-[#2C3639]"
            />
          </label>

          <button
            type="submit"
            className="w-full py-2 bg-[#2C3639] text-white rounded hover:bg-[#1f272a]"
          >
            Registrar Pago
          </button>

          {mensaje && <p className="mt-2 text-center text-green-700">{mensaje}</p>}
        </form>
      </div>
    </div>
  );
}
