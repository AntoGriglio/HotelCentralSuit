import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pago, estadia, tipo_pago } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { obtenerEstadosPorNombre } from '@/lib/estadoHelpers';


export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.estadia_id || !data.tipo_pago_id || !data.fecha_pago || isNaN(data.monto)) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Registrar el nuevo pago
    await db.insert(pago).values({
      estadia_id: data.estadia_id,
      tipo_pago_id: data.tipo_pago_id,
      fecha_pago: new Date(data.fecha_pago),
      comprobante_pago: data.comprobante_pago || null,
      monto: Number(data.monto),
    });

    // Buscar los datos de la estadía
    const [estadiaData] = await db
      .select()
      .from(estadia)
      .where(eq(estadia.id, data.estadia_id))
      .limit(1);

    if (!estadiaData) {
      return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 });
    }

    // Buscar pagos anteriores
    const pagosPrevios = await db
      .select({ monto: pago.monto })
      .from(pago)
      .where(eq(pago.estadia_id, data.estadia_id));

    const sumaPagos = pagosPrevios.reduce((acc, p) => acc + Number(p.monto), 0);
    const totalEstadia = Number(estadiaData.total);
    const pendiente = totalEstadia - sumaPagos;

    const ESTADOS = await obtenerEstadosPorNombre();
    const estadoPagado = ESTADOS['pagado'];
    const estadoReservado = ESTADOS['reservado'];

    // Cambiar estado si corresponde
    if (pendiente <= 0) {
      if (!estadoPagado) {
        return NextResponse.json({ error: 'Estado "pagado" no definido' }, { status: 500 });
      }
      await db.update(estadia)
        .set({ estado_id: estadoPagado })
        .where(eq(estadia.id, data.estadia_id));
    } else {
      if (!estadoReservado) {
        return NextResponse.json({ error: 'Estado "reservado" no definido' }, { status: 500 });
      }
      await db.update(estadia)
        .set({ estado_id: estadoReservado })
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
