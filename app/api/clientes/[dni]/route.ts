import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cliente } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { dni: string } }
) {
  try {
    const result = await db
      .select()
      .from(cliente)
      .where(eq(cliente.dni, params.dni))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('[ERROR GET /api/clientes/:dni]', error);
    return NextResponse.json({ error: 'Error al obtener cliente' }, { status: 500 });
  }
}
