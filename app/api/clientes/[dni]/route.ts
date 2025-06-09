import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cliente } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, context: { params: { dni: string } }) {
  try {
    const dni = context.params.dni;

    const result = await db.select().from(cliente).where(eq(cliente.dni, dni)).limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('[ERROR GET /api/clientes/:dni]', error);
    return NextResponse.json({ error: 'Error al obtener cliente' }, { status: 500 });
  }
}
