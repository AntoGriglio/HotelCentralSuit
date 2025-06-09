import { db } from '@/lib/db';
import { estado_estadia } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function obtenerEstadosPorNombre(): Promise<Record<string, string>> {
  const resultados = await db.select().from(estado_estadia);
  const mapa: Record<string, string> = {};

  resultados.forEach((estado) => {
    mapa[estado.nombre.toLowerCase()] = estado.id;
  });

  return mapa;
}

export async function obtenerEstadoId(nombre: string): Promise<string | undefined> {
  const resultados = await db
    .select()
    .from(estado_estadia)
    .where(eq(estado_estadia.nombre, nombre));

  return resultados[0]?.id;
}
