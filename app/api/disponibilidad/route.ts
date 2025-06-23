/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, and, sql, gte, lt, gt } from 'drizzle-orm';
import { db } from '../../../lib/db';
import {
  estadia,
  unidad_habitacional,
  tipo_unidad_habitacional,
  precio_habitacion
} from '../../../db/schema';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fechaIngreso = searchParams.get('fecha_ingreso');
  const fechaEgreso = searchParams.get('fecha_egreso');
  const cantidadPersonas = searchParams.get('cantidad_personas');
  const tipoHabitacionId = searchParams.get('tipo_habitacion_id');

  if (!fechaIngreso || !fechaEgreso) {
    return new Response(JSON.stringify({ error: 'Fechas requeridas' }), { status: 400 });
  }

  const subquery = db
    .select({ habitacion_id: estadia.habitacion_id })
    .from(estadia)
    .where(
      and(
        lt(estadia.fecha_ingreso, fechaEgreso),
        gt(estadia.fecha_egreso, fechaIngreso)
      )
    );

  const condiciones: any[] = [
    eq(tipo_unidad_habitacional.descripcion, 'Alquilable'),
    sql`${unidad_habitacional.id} NOT IN (${subquery})`
  ];

  if (cantidadPersonas) {
    condiciones.push(gte(unidad_habitacional.cantidad_normal, parseInt(cantidadPersonas)));
  }

  if (tipoHabitacionId) {
    condiciones.push(eq(unidad_habitacional.tipo_habitacion_id, tipoHabitacionId));
  }

  const disponibles = await db
    .select({
      unidad_habitacional: {
        id: unidad_habitacional.id,
        nombre: unidad_habitacional.nombre,
        cantidad_normal: unidad_habitacional.cantidad_normal,
        piso: unidad_habitacional.piso,
        numero: unidad_habitacional.numero,
        tipo_habitacion_id: unidad_habitacional.tipo_habitacion_id,
        precio: precio_habitacion.monto // 👈 acá agregamos el precio
      },
      tipo_unidad_habitacional: {
        id: tipo_unidad_habitacional.id,
        descripcion: tipo_unidad_habitacional.descripcion
      }
    })
    .from(unidad_habitacional)
    .innerJoin(
      tipo_unidad_habitacional,
      eq(unidad_habitacional.tipo_unidad_id, tipo_unidad_habitacional.id)
    )
    .leftJoin(
      precio_habitacion,
      eq(precio_habitacion.habitacion_id, unidad_habitacional.id)
    )
    .where(and(...condiciones));

  return Response.json(disponibles);
}
