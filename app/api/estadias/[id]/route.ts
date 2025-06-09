import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { estadia } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { obtenerEstadosPorNombre } from '@/lib/estadoHelpers';

// GET /api/estadias/:id → traer una sola estadía
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const result = await db
      .select()
      .from(estadia)
      .where(eq(estadia.id, params.id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('[ERROR GET /api/estadias/:id]', error);
    return NextResponse.json({ error: 'Error al obtener la estadía' }, { status: 500 });
  }
}

// PUT /api/estadias/:id → actualizar estadía
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();

  try {
    await db.update(estadia)
      .set({
        cliente_dni: data.cliente_dni,
        habitacion_id: data.habitacion_id,
        cantidad_personas: Number(data.cantidad_personas),
        fecha_ingreso: data.fecha_ingreso,
        fecha_egreso: data.fecha_egreso,
        cochera: Boolean(data.cochera),
        desayuno: Boolean(data.desayuno),
        almuerzo: Boolean(data.almuerzo),
        cena: Boolean(data.cena),
        ropa_blanca: Boolean(data.ropa_blanca),
        precio_por_noche: parseFloat(data.precio_por_noche),
        porcentaje_reserva: parseFloat(data.porcentaje_reserva),
        monto_reserva: parseFloat(data.monto_reserva),
        total: parseFloat(data.total),
        estado_id: data.estado_id,
        observaciones: data.observaciones || '',
        canal_id: data.canal_id,
      })
      .where(eq(estadia.id, params.id));

    return NextResponse.json({ message: 'Estadía actualizada correctamente' });
  } catch (error) {
    console.error('[ERROR PUT /api/estadias/:id]', error);
    return NextResponse.json({ error: 'Error al actualizar estadía' }, { status: 500 });
  }
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const result = await db.select().from(estadia).where(eq(estadia.id, params.id)).limit(1);
    const actual = result[0];
    if (!actual) return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 });

    const ESTADOS = await obtenerEstadosPorNombre();
    const estadoActual = actual.estado_id;

    const estadoCancelada = ESTADOS['cancelada'];
    if (!estadoCancelada) {
      return NextResponse.json({ error: 'No se encontró el estado "cancelada"' }, { status: 500 });
    }
if (!estadoActual) {
  return NextResponse.json({ error: 'La estadía no tiene un estado definido' }, { status: 400 });
}

    const puedeCancelar = [ESTADOS['sin confirmar'], ESTADOS['pendiente']].includes(estadoActual);
    if (!puedeCancelar) {
      return NextResponse.json({ error: 'Solo se pueden cancelar estadías sin confirmar o pendientes.' }, { status: 400 });
    }

    await db.update(estadia)
      .set({ estado_id: estadoCancelada })
      .where(eq(estadia.id, params.id));

    return NextResponse.json({ message: 'Estadía cancelada correctamente' });
  } catch (error) {
    console.error('[ERROR DELETE /api/estadias/:id]', error);
    return NextResponse.json({ error: 'Error al cancelar estadía' }, { status: 500 });
  }
}
