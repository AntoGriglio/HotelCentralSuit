import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unidad_habitacional } from '@/db/schema';

export async function POST(req: Request) {
  const data = await req.json();

  try {
    await db.insert(unidad_habitacional).values({
        capacidad_max: Number(data.capacidadMax),
        capacidad_min: Number(data.capacidadMin),
        camas_matrimonial: Number(data.camasMatrimonial),
        camas_individual: Number(data.camasIndividual),
        piso: Number(data.piso),
        numero: Number(data.numero),
        metros_cuadrados: Number(data.metrosCuadrados),
        balcon: data.balcon,
        cantidad_banos: Number(data.cantidadBanos),
        cantidad_habitaciones: Number(data.cantidadHabitaciones),
        check_limpieza: data.checkLimpieza,
      });      
    return NextResponse.json({ message: 'Habitación creada' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear la habitación' }, { status: 500 });
  }
}
export async function GET() {
    try {
      const habitaciones = await db.select().from(unidad_habitacional);
      return NextResponse.json(habitaciones);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Error al obtener habitaciones' }, { status: 500 });
    }
  }
