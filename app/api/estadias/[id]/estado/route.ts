import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { estadia } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { esTransicionValida } from '@/lib/estadiaEstados';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { estado_nuevo, tieneCliente = false, tienePagoReserva = false, tienePagoTotal = false } = await req.json();

  try {
    const result = await db.select().from(estadia).where(eq(estadia.id, params.id)).limit(1);
    const actual = result[0];
    if (!actual) return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 });

    if (!actual.estado_id) {
      return NextResponse.json({ error: 'La estadía no tiene un estado asignado aún.' }, { status: 400 });
    }

    const estadoActual = actual.estado_id;

    if (!esTransicionValida(estadoActual, estado_nuevo, { tieneCliente, tienePagoReserva, tienePagoTotal })) {
      return NextResponse.json({ error: 'Transición de estado inválida' }, { status: 400 });
    }

    await db.update(estadia)
      .set({ estado_id: estado_nuevo })
      .where(eq(estadia.id, params.id));

    return NextResponse.json({ message: 'Estado actualizado' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 });
  }
}
