import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { estadia, estado_estadia, unidad_habitacional, pago, cliente } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { esTransicionValida } from '@/lib/estadiaEstados';
import { obtenerEstadosPorNombre } from '@/lib/estadoHelpers';
import { getSupabaseSession } from '@/lib/supabaseServer';
import { sql } from 'drizzle-orm'; 
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const result = await db.select().from(estadia).where(eq(estadia.id, id)).limit(1);
      if (result.length === 0) {
        return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 });
      }
      return NextResponse.json(result[0]);
    } else {
      const data = await db
        .select({
          id: estadia.id,
          cliente_dni: estadia.cliente_dni,
          cliente_nombre: cliente.nombre_completo, // ✅ Nuevo campo
          habitacion_id: estadia.habitacion_id,
          cantidad_personas: estadia.cantidad_personas,
          fecha_ingreso: estadia.fecha_ingreso,
          fecha_egreso: estadia.fecha_egreso,
          cochera: estadia.cochera,
          desayuno: estadia.desayuno,
          pension_media: estadia.pension_media,
          pension_completa: estadia.pension_completa,
          all_inclusive: estadia.all_inclusive,
          ropa_blanca: estadia.ropa_blanca,
          precio_por_noche: estadia.precio_por_noche,
          porcentaje_reserva: estadia.porcentaje_reserva,
          monto_reserva: estadia.monto_reserva,
          total: estadia.total,
          observaciones: estadia.observaciones,
          estado: estadia.estado_id,
          estado_nombre: estado_estadia.nombre,
          habitacion_numero: unidad_habitacional.numero,
          habitacion_nombre: unidad_habitacional.nombre,
          fecha_creacion: estadia.fecha_creacion,
          nro_estadia: estadia.nro_estadia,
          tipo_habitacion_id: estadia.tipo_habitacion_id,
          nombre: estadia.nombre,
          telefono: estadia.telefono
        })
        .from(estadia)
        .orderBy(desc(estadia.fecha_creacion))
        .leftJoin(estado_estadia, eq(estadia.estado_id, estado_estadia.id))
        .leftJoin(unidad_habitacional, eq(estadia.habitacion_id, unidad_habitacional.id))
        .leftJoin(cliente, eq(estadia.cliente_dni, cliente.dni)); // ✅ Unión con cliente

      const dataConSaldo = await Promise.all(
        data.map(async (e) => {
          const pagosEstadia = await db
            .select({ monto: pago.monto })
            .from(pago)
            .where(eq(pago.estadia_id, e.id));
          const totalPagado = pagosEstadia.reduce((sum, p) => sum + Number(p.monto), 0);

          return {
            ...e,
            saldo_pendiente: Math.max((e.total || 0) - totalPagado, 0),
          };
        })
      );

      return NextResponse.json(dataConSaldo);
    }
  } catch (error) {
    console.error('[ERROR GET /api/estadias]', error);
    return NextResponse.json({ error: 'Error al obtener estadía(s)' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { session } = await getSupabaseSession(req);

  // 👇 Usuario por defecto si no hay sesión activa
  const usuarioId = session?.user?.id || '846126e6-763d-4988-ba3f-1c5fb698bbba'; // Reemplazá por el UUID real del "usuario genérico"

  try {
    const result = await db.transaction(async (tx) => {
      await tx.execute(
        sql.raw(`SET LOCAL "jwt.claims.usuario_id" = '${usuarioId}'`)
      );

      const insertado = await tx.insert(estadia).values({
        cliente_dni: data.cliente_dni,
        habitacion_id: data.habitacion_id,
        tipo_habitacion_id: data.tipo_habitacion_id,
        cantidad_personas: Number(data.cantidad_personas),
        fecha_ingreso: data.fecha_ingreso,
        fecha_egreso: data.fecha_egreso,
        cochera: Boolean(data.cochera),
        desayuno: Boolean(data.desayuno),
        pension_media: Boolean(data.pension_media),
        pension_completa: Boolean(data.pension_completa),
        all_inclusive: Boolean(data.all_inclusive),
        ropa_blanca: Boolean(data.ropa_blanca),
        precio_por_noche: parseFloat(data.precio_por_noche),
        porcentaje_reserva: parseFloat(data.porcentaje_reserva),
        monto_reserva: parseFloat(data.monto_reserva),
        total: parseFloat(data.total),
        estado_id: data.estado_id,
        canal_id: data.canal_id,
        observaciones: data.observaciones || '',
        nombre: data.nombre || '',
        telefono: data.telefono || '',
      }).returning({ id: estadia.id, nro_estadia: estadia.nro_estadia });

      return insertado[0];
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ERROR POST /api/estadias]', error);
    return NextResponse.json({ error: 'Error al registrar estadía' }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  const {  session} = await getSupabaseSession(req);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
  }

  const usuarioId = session.user.id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const data = await req.json();

  try {
await db.transaction(async (tx) => {
  await tx.execute(
    sql.raw(`SET LOCAL "jwt.claims.usuario_id" = '${usuarioId}'`)
  );
      // 👇 Hacer el update dentro del mismo contexto
      await tx
        .update(estadia)
        .set({
          cliente_dni: data.cliente_dni,
          habitacion_id: data.habitacion_id,
          tipo_habitacion_id: data.tipo_habitacion_id,
          cantidad_personas: Number(data.cantidad_personas),
          fecha_ingreso: data.fecha_ingreso,
          fecha_egreso: data.fecha_egreso,
          cochera: Boolean(data.cochera),
          desayuno: Boolean(data.desayuno),
          pension_media: Boolean(data.pension_media),
          pension_completa: Boolean(data.pension_completa),
          all_inclusive: Boolean(data.all_inclusive),
          ropa_blanca: Boolean(data.ropa_blanca),
          precio_por_noche: parseFloat(data.precio_por_noche),
          porcentaje_reserva: parseFloat(data.porcentaje_reserva),
          monto_reserva: parseFloat(data.monto_reserva),
          total: parseFloat(data.total),
          estado_id: data.estado_id,
          canal_id: data.canal_id,
          observaciones: data.observaciones || '',
        })
        .where(eq(estadia.id, id));
    });

    return NextResponse.json({ message: 'Estadía actualizada correctamente' });
  } catch (error) {
    console.error('[ERROR PUT /api/estadias]', error);
    return NextResponse.json({ error: 'Error al actualizar estadía' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const { estado_nuevo, tieneCliente = false, tienePagoReserva = false, tienePagoTotal = false } = await req.json();

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  try {
    const result = await db.select().from(estadia).where(eq(estadia.id, id)).limit(1);
    const actual = result[0];
    if (!actual) return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 });

    if (!actual.estado_id) {
      return NextResponse.json({ error: 'La estadía no tiene un estado asignado aún.' }, { status: 400 });
    }

    const estadoActual = actual.estado_id;

    if (!esTransicionValida(estadoActual, estado_nuevo, { tieneCliente, tienePagoReserva, tienePagoTotal })) {
      return NextResponse.json({ error: 'Transición de estado inválida' }, { status: 400 });
    }

    await db.update(estadia)
      .set({ estado_id: estado_nuevo })
      .where(eq(estadia.id, id));

    return NextResponse.json({ message: 'Estado actualizado' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  try {
    const result = await db.select().from(estadia).where(eq(estadia.id, id)).limit(1);
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
      .where(eq(estadia.id, id));

    return NextResponse.json({ message: 'Estadía cancelada correctamente' });
  } catch (error) {
    console.error('[ERROR DELETE /api/estadias]', error);
    return NextResponse.json({ error: 'Error al cancelar estadía' }, { status: 500 });
  }
}
