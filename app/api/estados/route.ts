import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { estado_estadia } from '@/db/schema';

export async function GET() {
  try {
    const estados = await db.select().from(estado_estadia);
    return NextResponse.json(estados);
  } catch (error) {
    console.error('[ERROR GET /api/estados]', error);
    return NextResponse.json({ error: 'Error al obtener estados' }, { status: 500 });
  }
}
