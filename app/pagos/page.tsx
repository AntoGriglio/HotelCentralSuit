/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';


export default function RegistrarPago() {
  const router = useRouter();

  const [estadias, setEstadias] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);

  const [pago, setPago] = useState({
    estadiaId: '',
    tipoPagoId: '',
    monto: '',
    comprobantePago: '',
    fechaPago: new Date().toISOString().split('T')[0],
  });

  const [mensaje, setMensaje] = useState('');
  const searchParams = useSearchParams();
  const estadiaIdFromUrl = searchParams.get('estadia_id');

  useEffect(() => {
    const fetchData = async () => {
      const resEstadias = await fetch('/api/estadias');
      const dataEstadias = await resEstadias.json();
      setEstadias(dataEstadias);

      const resTipos = await fetch('/api/tipos-pago');
      const dataTipos = await resTipos.json();
      setTiposPago(dataTipos);
      if (estadiaIdFromUrl) {
  setPago((prev) => ({ ...prev, estadiaId: estadiaIdFromUrl }));
}

    };

    fetchData();
  }, [estadiaIdFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estadia_id: pago.estadiaId,
        tipo_pago_id: pago.tipoPagoId,
        monto: parseFloat(pago.monto),
        comprobante_pago: pago.comprobantePago,
        fecha_pago: new Date(pago.fechaPago),
      }),
    });

    if (res.ok) {
      setMensaje('Pago registrado con éxito');
      router.push('/dashboard');
    } else {
      const error = await res.json();
      setMensaje(error.error || 'Error al registrar el pago');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Registrar Pago</h1>
      <form onSubmit={handleSubmit}>
        <label>Estadía</label>
        <select
          value={pago.estadiaId}
          onChange={(e) => setPago({ ...pago, estadiaId: e.target.value })}
          required
        >
          <option value="">Seleccione una estadía</option>
          {estadias.map((e: any) => (
            <option key={e.id} value={e.id}>
              #{e.nro_estadia} - {e.cliente_dni}
            </option>
          ))}
        </select>

        <label>Tipo de pago</label>
        <select
          value={pago.tipoPagoId}
          onChange={(e) => setPago({ ...pago, tipoPagoId: e.target.value })}
          required
        >
          <option value="">Seleccione tipo de pago</option>
          {tiposPago.map((t: any) => (
            <option key={t.id} value={t.id}>
              {t.descripcion}
            </option>
          ))}
        </select>

        <label>Monto</label>
        <input
          type="number"
          step="0.01"
          value={pago.monto}
          onChange={(e) => setPago({ ...pago, monto: e.target.value })}
          required
        />

        <label>Comprobante</label>
        <input
          type="text"
          value={pago.comprobantePago}
          onChange={(e) => setPago({ ...pago, comprobantePago: e.target.value })}
        />

        <label>Fecha de pago</label>
        <input
          type="date"
          value={pago.fechaPago}
          onChange={(e) => setPago({ ...pago, fechaPago: e.target.value })}
          required
        />

        <button type="submit">Registrar Pago</button>
      </form>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
    </div>
  );
}
