import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bloqueo_unidad } from '@/db/schema';
import { and, eq, lte, gte } from 'drizzle-orm';

// POST
export async function POST(req: NextRequest) {
  const data = await req.json();
  try {
    await db.insert(bloqueo_unidad).values({
      unidad_id: data.unidadId,
      tipo: data.tipo,
      descripcion: data.descripcion,
      fecha_desde: data.fechaDesde,
      fecha_hasta: data.fechaHasta,
    });
    return NextResponse.json({ message: 'Bloqueo registrado correctamente' });
  } catch (error) {
    console.error('[API BLOQUEO ERROR]', error);
    return NextResponse.json({ error: 'Error al registrar bloqueo' }, { status: 500 });
  }
}

// GET
export async function GET(req: NextRequest) {
  const unidadId = req.nextUrl.searchParams.get('unidadId');
  if (!unidadId) {
    return NextResponse.json({ error: 'unidadId es requerido' }, { status: 400 });
  }

  try {
    const bloqueos = await db
      .select()
      .from(bloqueo_unidad)
      .where(eq(bloqueo_unidad.unidad_id, unidadId));

    return NextResponse.json(bloqueos);
  } catch (error) {
    console.error('[API BLOQUEO GET ERROR]', error);
    return NextResponse.json({ error: 'Error al obtener bloqueos' }, { status: 500 });
  }
}

// PUT
export async function PUT(req: NextRequest) {
  const data = await req.json();
  try {
    if (!data.id) {
      return NextResponse.json({ error: 'Falta el ID del bloqueo a editar' }, { status: 400 });
    }

    await db.update(bloqueo_unidad)
      .set({
        tipo: data.tipo,
        descripcion: data.descripcion,
        fecha_desde: data.fechaDesde,
        fecha_hasta: data.fechaHasta,
      })
      .where(eq(bloqueo_unidad.id, data.id));

    return NextResponse.json({ message: 'Bloqueo actualizado correctamente' });
  } catch (error) {
    console.error('[API BLOQUEO PUT ERROR]', error);
    return NextResponse.json({ error: 'Error al actualizar bloqueo' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Falta el ID del bloqueo' }, { status: 400 });
  }

  try {
    await db.delete(bloqueo_unidad).where(eq(bloqueo_unidad.id, id));
    return NextResponse.json({ message: 'Bloqueo eliminado correctamente' });
  } catch (error) {
    console.error('[API BLOQUEO DELETE ERROR]', error);
    return NextResponse.json({ error: 'Error al eliminar bloqueo' }, { status: 500 });
  }
}
