import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { forma_pago } from '@/db/schema';

export async function GET() {
  try {
    const formas = await db.select().from(forma_pago);
    return NextResponse.json(formas);
  } catch (error) {
    console.error('[ERROR GET /api/formas-pago]', error);
    return NextResponse.json({ error: 'Error al obtener formas de pago' }, { status: 500 });
  }
}
