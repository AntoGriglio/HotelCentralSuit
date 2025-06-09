import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tipo_pago } from '@/db/schema';

export async function GET() {
  try {
    const data = await db.select().from(tipo_pago);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[ERROR GET /api/tipos-pago]', error);
    return NextResponse.json({ error: 'Error al obtener tipos de pago' }, { status: 500 });
  }
}
