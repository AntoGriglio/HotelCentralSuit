import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pago, estadia, tipo_pago } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { obtenerEstadosPorNombre } from '@/lib/estadoHelpers';
import { getSupabaseSession } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {

      const {  session} = await getSupabaseSession(req);
    
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
      }
    const data = await req.json();
  const usuarioId = session.user.id;

    if (!data.estadia_id || !data.tipo_pago_id || !data.fecha_pago || isNaN(data.monto)) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      // Establecer el usuario_id en la sesión local para que funcione el trigger
      await tx.execute(sql.raw(`SET LOCAL "jwt.claims.usuario_id" = '${usuarioId}'`));

      // Insertar el pago
      await tx.insert(pago).values({
        estadia_id: data.estadia_id,
        tipo_pago_id: data.tipo_pago_id,
        fecha_pago: new Date(data.fecha_pago),
        comprobante_pago: data.comprobante_pago || null,
        forma_pago_id:data.forma_pago_id,
        monto: Number(data.monto),
      });

      // Obtener datos de la estadía
      const [estadiaData] = await tx
        .select()
        .from(estadia)
        .where(eq(estadia.id, data.estadia_id))
        .limit(1);

      if (!estadiaData) {
        throw new Error('Estadía no encontrada');
      }

      // Obtener pagos previos
      const pagosPrevios = await tx
        .select({ monto: pago.monto })
        .from(pago)
        .where(eq(pago.estadia_id, data.estadia_id));

      const sumaPagos = pagosPrevios.reduce((acc, p) => acc + Number(p.monto), 0);
      const totalEstadia = Number(estadiaData.total);
      const pendiente = totalEstadia - sumaPagos;

      const ESTADOS = await obtenerEstadosPorNombre();
      const estadoPagado = ESTADOS['pagado'];
      const estadoReservado = ESTADOS['reservado'];

      // Actualizar estado si corresponde
      const nuevoEstado = pendiente <= 0 ? estadoPagado : estadoReservado;

      if (!nuevoEstado) {
        throw new Error('Estado correspondiente no definido');
      }

      await tx.update(estadia)
        .set({ estado_id: nuevoEstado })
        .where(eq(estadia.id, data.estadia_id));
    });

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
