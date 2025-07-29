import { db } from '@/lib/db'
import {
  item_precio,
  precio,
  unidad_habitacional,
  precio_habitacion,
  tipo_habitacion,
  auditoria,
} from '@/db/schema'
import { and, eq, or, isNull, gt, sql } from 'drizzle-orm'
import { getSupabaseSession } from '@/lib/supabaseServer'
import { NextRequest } from 'next/server'

export async function GET() {
  const result = await db
    .select({
      item_id: item_precio.id,
      item: item_precio.nombre,
      precio_actual: precio.monto,
      desde: precio.desde,
      hasta: precio.hasta,
    })
    .from(item_precio)
    .leftJoin(precio, and(
      eq(item_precio.id, precio.item_id),
      or(isNull(precio.hasta), gt(precio.hasta, new Date()))
    ))

  return Response.json(result)
}
export async function POST(req: NextRequest) {
  

  const body = await req.json();
  const { itemId, nuevoPrecio } = body;

  if (!itemId || !nuevoPrecio) {
    return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 });
  }

  // Cerrar precios anteriores
  await db
    .update(precio)
    .set({ hasta: new Date() })
    .where(and(eq(precio.item_id, itemId), isNull(precio.hasta)));

  // Insertar nuevo precio
  await db.insert(precio).values({
    item_id: itemId,
    monto: nuevoPrecio,
    desde: new Date(),
  });

  // Buscar nombre del ítem
  const item = await db
    .select({ nombre: item_precio.nombre })
    .from(item_precio)
    .where(eq(item_precio.id, itemId))
    .then(res => res[0]);

  if (!item?.nombre) {
    return new Response(JSON.stringify({ error: 'No se encontró el ítem' }), { status: 404 });
  }

  // Cargar dinámicamente los nombres de tipo_habitacion
  const tiposHabitacion = await db
    .select({ nombre: tipo_habitacion.nombre })
    .from(tipo_habitacion);

  const nombresTipoHabitacion = tiposHabitacion.map(t => t.nombre);

  let habitaciones: { id: string; cantidad_normal: number | null }[] = [];

  if (nombresTipoHabitacion.includes(item.nombre)) {
    const tipo = await db
      .select({ id: tipo_habitacion.id })
      .from(tipo_habitacion)
      .where(eq(tipo_habitacion.nombre, item.nombre))
      .then(res => res[0]);

    if (!tipo?.id) {
      return new Response(JSON.stringify({ error: `No se encontró tipo de habitación con nombre '${item.nombre}'` }), { status: 404 });
    }

    habitaciones = await db
      .select({
        id: unidad_habitacional.id,
        cantidad_normal: unidad_habitacional.cantidad_normal,
      })
      .from(unidad_habitacional)
      .where(eq(unidad_habitacional.tipo_habitacion_id, tipo.id));

    await Promise.all(
      habitaciones.map(async (hab) => {
        const cantidad = hab.cantidad_normal ?? 1;
        const montoFinal = cantidad * nuevoPrecio;

        await db
          .delete(precio_habitacion)
          .where(eq(precio_habitacion.habitacion_id, hab.id));

        await db.insert(precio_habitacion).values({
          habitacion_id: hab.id,
          monto: montoFinal,
        });
      })
    );
  }

  // Auditoría
  const { session } = await getSupabaseSession(req);
  const usuarioId = session?.user?.id ?? null;

  await db.transaction(async (tx) => {
    if (usuarioId) {
      await tx.execute(sql.raw(`SET LOCAL "jwt.claims.usuario_id" = '${usuarioId}'`));
    }

    await tx.insert(auditoria).values({
      tabla: 'precio',
      accion: 'INSERT',
      registro_id: itemId,
      usuario_id: usuarioId,
      datos: {
        item_id: itemId,
        monto: nuevoPrecio,
        habitaciones_actualizadas: habitaciones.map(h => h.id),
        fecha: new Date().toISOString(),
      },
    });
  });

  return new Response(JSON.stringify({ success: true }));
}