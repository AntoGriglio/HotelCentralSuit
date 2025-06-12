import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tipo_habitacion } from '@/db/schema';

// GET: Obtener todos los tipos de unidad habitacional
export async function GET() {
  try {
    const tipos = await db.select().from(tipo_habitacion);
    return NextResponse.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos habitacion:', error);
    return NextResponse.json({ error: 'Error al obtener tipos habitacion' }, { status: 500 });
  }
}
