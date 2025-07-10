/* eslint-disable @typescript-eslint/no-explicit-any */
// ✅ BACKEND MODIFICADO
import { eq, and, sql, lt, gt } from 'drizzle-orm';
import { db } from '../../../lib/db';
import {
  estadia,
  unidad_habitacional,
  tipo_unidad_habitacional,
  precio_habitacion,
  tipo_habitacion
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

  const noches = Math.max(
    1,
    Math.floor((new Date(fechaEgreso).getTime() - new Date(fechaIngreso).getTime()) / (1000 * 60 * 60 * 24))
  );
  const personas = parseInt(cantidadPersonas || '0');

  const subquery = db
    .select({ habitacion_id: estadia.habitacion_id })
    .from(estadia)
   .where(
  and(
    lt(estadia.fecha_ingreso, fechaEgreso),
    gt(estadia.fecha_egreso, fechaIngreso) // esta línea está OK
  )
)


  const condiciones: any[] = [
    eq(tipo_unidad_habitacional.descripcion, 'Alquilable'),
    sql`${unidad_habitacional.id} NOT IN (${subquery})`
  ];

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
      precio: precio_habitacion.monto
    },
    tipo_unidad_habitacional: {
      id: tipo_unidad_habitacional.id,
      descripcion: tipo_unidad_habitacional.descripcion
    },
    tipo_habitacion: {
      id: tipo_habitacion.id,
      descripcion: tipo_habitacion.nombre
    }
  })
  .from(unidad_habitacional)
  .innerJoin(tipo_unidad_habitacional, eq(unidad_habitacional.tipo_unidad_id, tipo_unidad_habitacional.id))
  .leftJoin(precio_habitacion, eq(precio_habitacion.habitacion_id, unidad_habitacional.id))
  .leftJoin(tipo_habitacion, eq(unidad_habitacional.tipo_habitacion_id, tipo_habitacion.id))
  .where(and(...condiciones));
const resultadosConTotal = disponibles
  .filter((res) => {
    const capacidadNormal = res.unidad_habitacional.cantidad_normal || 1;
    const diferencia = capacidadNormal - personas;
    return personas <= capacidadNormal && diferencia <= 3;
  })

  .map((res) => {
    const precioBase = res.unidad_habitacional.precio || 0;
    const capacidadNormal = res.unidad_habitacional.cantidad_normal || 1;

    let ajuste = 1;

    const diferencia = capacidadNormal - personas;

    if (diferencia === 1) ajuste = 0.9;
    else if (diferencia === 2) ajuste = 0.8;
    else if (diferencia >= 3) ajuste = 0.7;

    const total = precioBase * ajuste * noches;

    return {
      ...res,
      total_estadia: total,
      tipo_id: res.unidad_habitacional.tipo_habitacion_id, 
    };
  });
  return Response.json(resultadosConTotal);
}