import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unidad_habitacional, tipo_unidad_habitacional } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST: Crear nueva unidad habitacional
export async function POST(req: Request) {
  const data = await req.json();

  try {
  await db.insert(unidad_habitacional).values({
  tipo_unidad_id: data.tipoUnidadId,
  numero: parseInt(data.numero, 10) || 0,
  piso: parseInt(data.piso, 10) || 0,
  capacidad_max: parseInt(data.capacidadMax, 10) || null,
  capacidad_min: parseInt(data.capacidadMin, 10) || null,
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
  nombre: data.nombre || null,
  tipo_habitacion_id: data.tipoHabitacionId || null, // ✅ CAMBIADO AQUÍ
})


    return NextResponse.json({ message: 'Unidad habitacional creada con éxito' });
  } catch (error) {
    console.error('[API HABITACION ERROR]', error);
    return NextResponse.json({ error: 'Error al crear la unidad' }, { status: 500 });
  }
}

// GET: Obtener lista de unidades con info del tipo
export async function GET() {
  try {
    const unidades = await db
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
      })
      .from(unidad_habitacional)
      .leftJoin(
        tipo_unidad_habitacional,
        eq(unidad_habitacional.tipo_unidad_id, tipo_unidad_habitacional.id)
      );

    return NextResponse.json(unidades);
  } catch (error) {
    console.error('[API HABITACION GET ERROR]', error);
    return NextResponse.json({ error: 'Error al obtener unidades' }, { status: 500 });
  }
}
