import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cliente } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: Request,
   context: { params: { dni: string } }
) {
  const { dni } = context.params;

  const result = await db.select().from(cliente).where(eq(cliente.dni, dni)).limit(1);

  if (result.length === 0) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}
