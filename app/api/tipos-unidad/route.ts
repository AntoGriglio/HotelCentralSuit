import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tipo_unidad_habitacional } from '@/db/schema';

// GET: Obtener todos los tipos de unidad habitacional
export async function GET() {
  try {
    const tipos = await db.select().from(tipo_unidad_habitacional);
    return NextResponse.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos de unidad:', error);
    return NextResponse.json({ error: 'Error al obtener tipos de unidad' }, { status: 500 });
  }
}
