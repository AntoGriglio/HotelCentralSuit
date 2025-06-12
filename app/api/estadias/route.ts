import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { estadia, estado_estadia, unidad_habitacional } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const data = await req.json();

  try {
    await db.insert(estadia).values({
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
    });

    return NextResponse.json({ message: 'Estadía registrada' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al registrar estadía' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await db
      .select({
        id: estadia.id,
        cliente_dni: estadia.cliente_dni,
        habitacion_id: estadia.habitacion_id,
        cantidad_personas: estadia.cantidad_personas,
        fecha_ingreso: estadia.fecha_ingreso,
        fecha_egreso: estadia.fecha_egreso,
        cochera: estadia.cochera,
        desayuno: estadia.desayuno,
        almuerzo: estadia.almuerzo,
        cena: estadia.cena,
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
      })
      .from(estadia)
      .leftJoin(estado_estadia, eq(estadia.estado_id, estado_estadia.id))
      .leftJoin(unidad_habitacional, eq(estadia.habitacion_id, unidad_habitacional.id));

    return NextResponse.json(data);
  } catch (error) {
    console.error('[ERROR GET /api/estadias]', error);
    return NextResponse.json({ error: 'Error al obtener estadías' }, { status: 500 });
  }
}

