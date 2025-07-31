import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  unidad_habitacional,
  precio_habitacion,
  tipo_habitacion,
  tipo_unidad_habitacional,
  item_precio,
  precio,
  bloqueo_unidad
} from '@/db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'

// POST
export async function POST(req: Request) {
  const data = await req.json();
  try {
    await db.insert(unidad_habitacional).values({
      tipo_unidad_id: data.tipoUnidadId,
      tipo_habitacion_id: data.tipoHabitacionId || null,
      nombre: data.nombre || null,
      piso: parseInt(data.piso, 10) || 0,
      numero: parseInt(data.numero, 10) || 0,
      capacidad_min: parseInt(data.capacidadMin, 10) || null,
      capacidad_max: parseInt(data.capacidadMax, 10) || null,
      cantidad_normal: parseInt(data.cantidadNormal, 10) || null,
      camas_matrimonial: parseInt(data.camasMatrimonial, 10) || null,
      camas_individual: parseInt(data.camasIndividual, 10) || null,
      metros_cuadrados: parseFloat(data.metrosCuadrados) || null,
      balcon: !!data.balcon,
      cantidad_banos: parseInt(data.cantidadBanos, 10) || null,
      cantidad_habitaciones: parseInt(data.cantidadHabitaciones, 10) || null,
      check_limpieza: !!data.checkLimpieza,
      pagina_turismo: null,
      de_que_pagina_es: null,
    });

    return NextResponse.json({ message: 'Unidad habitacional creada con éxito' });
  } catch (error) {
    console.error('[API HABITACION ERROR]', error);
    return NextResponse.json({ error: 'Error al crear la unidad' }, { status: 500 });
  }
}

// GET
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const conBloqueos = req.nextUrl.searchParams.get('conBloqueos');

  try {
    const query = db
      .select({
        id: unidad_habitacional.id,
        nombre: unidad_habitacional.nombre,
        piso: unidad_habitacional.piso,
        capacidad_minima: unidad_habitacional.capacidad_min,
        capacidad_normal: unidad_habitacional.cantidad_normal,
        capacidad_maxima: unidad_habitacional.capacidad_max,
        numero: unidad_habitacional.numero,
        estado_limpieza: unidad_habitacional.check_limpieza,
        tipo: tipo_unidad_habitacional.descripcion,
        tipo_habitacion: tipo_habitacion.nombre,
        tipo_unidad_id: unidad_habitacional.tipo_unidad_id,
        tipo_habitacion_id: unidad_habitacional.tipo_habitacion_id,
        cantidad_habitaciones: unidad_habitacional.cantidad_habitaciones,
        cantidad_banios: unidad_habitacional.cantidad_banos,
        camas_matrimonial: unidad_habitacional.camas_matrimonial,
        camas_individual: unidad_habitacional.camas_individual,
        metros_cuadrados: unidad_habitacional.metros_cuadrados,
        balcon: unidad_habitacional.balcon,
        precio: precio_habitacion.monto,
        bloqueada: conBloqueos
          ? sql`EXISTS (
              SELECT 1 FROM bloqueo_unidad
              WHERE bloqueo_unidad.unidad_id = ${unidad_habitacional.id}
            )`.as('bloqueada')
          : sql`false`.as('bloqueada'),
      })
      .from(unidad_habitacional)
      .leftJoin(tipo_unidad_habitacional, eq(unidad_habitacional.tipo_unidad_id, tipo_unidad_habitacional.id))
      .leftJoin(tipo_habitacion, eq(unidad_habitacional.tipo_habitacion_id, tipo_habitacion.id))
      .leftJoin(precio_habitacion, eq(precio_habitacion.habitacion_id, unidad_habitacional.id))
     .orderBy(unidad_habitacional.piso, unidad_habitacional.numero);


    const unidades = id ? await query.where(eq(unidad_habitacional.id, id)) : await query;

    const unidadesConBloqueos = await Promise.all(
      unidades.map(async (unidad) => {
        const bloqueos = await db
          .select()
          .from(bloqueo_unidad)
          .where(eq(bloqueo_unidad.unidad_id, unidad.id))
          .orderBy(desc(bloqueo_unidad.fecha_desde));

        return {
          ...unidad,
          bloqueos,
        };
      })
    );

    return NextResponse.json(unidadesConBloqueos);
  } catch (error) {
    console.error('[API HABITACION GET ERROR]', error);
    return NextResponse.json({ error: 'Error al obtener unidades' }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  const data = await req.json();

  // 1. Actualizar la unidad habitacional
  await db.update(unidad_habitacional)
    .set({
      tipo_unidad_id: data.tipoUnidadId,
      tipo_habitacion_id: data.tipoHabitacionId || null,
      nombre: data.nombre || null,
      piso: parseInt(data.piso, 10) || 0,
      numero: parseInt(data.numero, 10) || 0,
      capacidad_min: parseInt(data.capacidadMin, 10) || null,
      capacidad_max: parseInt(data.capacidadMax, 10) || null,
      cantidad_normal: parseInt(data.cantidadNormal, 10) || null,
      camas_matrimonial: parseInt(data.camasMatrimonial, 10) || null,
      camas_individual: parseInt(data.camasIndividual, 10) || null,
      metros_cuadrados: parseFloat(data.metrosCuadrados) || null,
      balcon: !!data.balcon,
      cantidad_banos: parseInt(data.cantidadBanos, 10) || null,
      cantidad_habitaciones: parseInt(data.cantidadHabitaciones, 10) || null,
      check_limpieza: !!data.checkLimpieza,
    })
    .where(eq(unidad_habitacional.id, data.id));

  // 2. Buscar si es tipo "Alquilable"
  const tipoUnidadRes = await db
    .select()
    .from(tipo_unidad_habitacional)
    .where(eq(tipo_unidad_habitacional.id, data.tipoUnidadId));

  const tipoUnidad = tipoUnidadRes[0];

  if (tipoUnidad?.descripcion === 'Alquilable' && data.tipoHabitacionId && data.cantidadNormal) {
    const capacidad = parseInt(data.cantidadNormal, 10);

    // 3. Buscar nombre del tipo de habitación
    const tipoHabitacionRes = await db
      .select()
      .from(tipo_habitacion)
      .where(eq(tipo_habitacion.id, data.tipoHabitacionId));

    const tipoHabitacion = tipoHabitacionRes[0];
    const nombreTipo = tipoHabitacion?.nombre || '';

    // 4. Buscar item_precio con ese nombre
    const itemRes = await db
      .select()
      .from(item_precio)
      .where(eq(item_precio.nombre, nombreTipo));

    const item = itemRes[0];

    if (item) {
      // 5. Buscar precio vigente
      const precioBaseRes = await db
        .select()
        .from(precio)
        .where(and(
          eq(precio.item_id, item.id),
          sql`now() BETWEEN ${precio.desde} AND COALESCE(${precio.hasta}, now())`
        ));

      const precioBase = precioBaseRes[0];

      if (precioBase) {
        const nuevoMonto = precioBase.monto * capacidad;
const precioExistente = await db
  .select()
  .from(precio_habitacion)
  .where(eq(precio_habitacion.habitacion_id, data.id));

if (precioExistente.length > 0) {
  await db.update(precio_habitacion)
    .set({
      monto: nuevoMonto,
      fecha_actualizacion: new Date(),
    })
    .where(eq(precio_habitacion.habitacion_id, data.id));
} else {
  await db.insert(precio_habitacion).values({
    habitacion_id: data.id,
    monto: nuevoMonto,
    fecha_actualizacion: new Date(),
  });
}

      }
    }
  }

  return NextResponse.json({ message: 'Unidad actualizada y precios recalculados' });
}
