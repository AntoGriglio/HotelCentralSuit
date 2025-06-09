import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cliente } from '@/db/schema';

export async function POST(req: Request) {
  const data = await req.json();

  try {
    await db.insert(cliente).values({
      dni: data.dni,
      email: data.email,
      nombre_completo: data.nombre_completo,
      telefono: data.telefono,
    });

    return NextResponse.json({ message: 'Cliente creado' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear el cliente' }, { status: 500 });
  }
}
export async function GET() {
  try {
    const data = await db.select().from(cliente);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[ERROR GET /api/clientes]', error);
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 });
  }
}