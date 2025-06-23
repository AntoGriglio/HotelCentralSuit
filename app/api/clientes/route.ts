import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cliente } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const data = await req.json()
  try {
    await db.insert(cliente).values({
      dni: data.dni,
      email: data.email,
      nombre_completo: data.nombre_completo,
      telefono: data.telefono,
      localidad: data.localidad,
      pais: data.pais,
      provincia: data.provincia ?? null,
    })
    return NextResponse.json({ message: 'Cliente creado' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear el cliente' }, { status: 500 })
  }
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dni = searchParams.get('dni');

  try {
    if (dni) {
      const result = await db
        .select()
        .from(cliente)
        .where(eq(cliente.dni, dni))
        .limit(1);

      if (result.length === 0) {
        return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
      }

      return NextResponse.json(result[0]);
    } else {
      // Si no se pasa dni, devuelve todos los clientes
      const data = await db.select().from(cliente);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('[ERROR GET /api/clientes]', error);
    return NextResponse.json({ error: 'Error al obtener cliente(s)' }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  const data = await req.json()

  try {
    await db
      .update(cliente)
      .set({
        email: data.email,
        nombre_completo: data.nombre_completo,
        telefono: data.telefono,
        localidad: data.localidad,
        pais: data.pais,
        provincia: data.provincia ?? null,
      })
      .where(eq(cliente.dni, data.dni))

    return NextResponse.json({ message: 'Cliente actualizado' })
  } catch (error) {
    console.error('[ERROR PUT /api/clientes]', error)
    return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 })
  }
}

