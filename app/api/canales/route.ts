import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canal_comercializacion } from '@/db/schema';

export async function GET() {
  try {
    const canales = await db.select().from(canal_comercializacion);
    return NextResponse.json(canales);
  } catch (error) {
    console.error('[ERROR GET /api/canales]', error);
    return NextResponse.json({ error: 'Error al obtener canales' }, { status: 500 });
  }
}
