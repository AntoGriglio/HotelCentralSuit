// app/api/pagos/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pago, estadia, tipo_pago } from '@/db/schema'; // ← agregamos tipo_pago acá
import { eq } from 'drizzle-orm';
import { obtenerEstadosPorNombre } from '@/lib/estadoHelpers';


const TIPOS_PAGO = {
  RESERVA: '20938997-7fd2-4e74-9862-819b36a52312',
  SALDO_TOTAL: 'ID_DEL_TIPO_SALDO_TOTAL',
};

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.estadia_id || !data.tipo_pago_id || !data.fecha_pago || isNaN(data.monto)) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Registrar el pago
    await db.insert(pago).values({
      estadia_id: data.estadia_id,
      tipo_pago_id: data.tipo_pago_id,
      fecha_pago: new Date(data.fecha_pago),
      comprobante_pago: data.comprobante_pago || null,
      monto: Number(data.monto),
    });

    // Cargar estados de forma dinámica
    const ESTADOS = await obtenerEstadosPorNombre();

    let nuevoEstado: string | null = null;

    if (data.tipo_pago_id === TIPOS_PAGO.RESERVA) {
      nuevoEstado = ESTADOS['reservado'];
    } else if (data.tipo_pago_id === TIPOS_PAGO.SALDO_TOTAL) {
      nuevoEstado = ESTADOS['pagado'];
    }

    if (nuevoEstado) {
      await db.update(estadia)
        .set({ estado_id: nuevoEstado })
        .where(eq(estadia.id, data.estadia_id));
    }

    return NextResponse.json({ message: 'Pago registrado correctamente' });
  } catch (error) {
    console.error('[ERROR POST /api/pagos]', error);
    return NextResponse.json({ error: 'Error al registrar el pago' }, { status: 500 });
  }
}
export async function GET() {
  try {
    const result = await db
      .select({
        id: pago.id,
        estadia_id: pago.estadia_id,
        monto: pago.monto,
        fecha_pago: pago.fecha_pago,
        comprobante_pago: pago.comprobante_pago,
        tipo_pago_id: pago.tipo_pago_id,
        // Agregá esto si querés la descripción del tipo
        descripcion_tipo_pago: tipo_pago.descripcion,
      })
      .from(pago)
      .leftJoin(tipo_pago, eq(pago.tipo_pago_id, tipo_pago.id));

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ERROR GET /api/pagos]', error);
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 });
  }
}

