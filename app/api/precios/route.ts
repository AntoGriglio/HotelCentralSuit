// app/api/precios/route.ts
import { db } from '@/lib/db'
import { item_precio, precio } from '@/db/schema'
import { and, eq, or, isNull, gt } from 'drizzle-orm'

export async function GET() {
  const result = await db
    .select({
      item_id: item_precio.id,
      item: item_precio.nombre,
      precio_actual: precio.monto,
      desde: precio.desde,
      hasta: precio.hasta,
    })
    .from(item_precio)
    .leftJoin(precio, and(
      eq(item_precio.id, precio.item_id),
      or(isNull(precio.hasta), gt(precio.hasta, new Date()))
    ))

  return Response.json(result)
}
export async function POST(req: Request) {
  const body = await req.json()
  const { itemId, nuevoPrecio } = body

  if (!itemId || !nuevoPrecio) {
    return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 })
  }

  // Cerrar el precio actual
  await db
    .update(precio)
    .set({ hasta: new Date() })
    .where(and(eq(precio.item_id, itemId), isNull(precio.hasta)))

  // Insertar nuevo precio
  await db.insert(precio).values({
    item_id: itemId,
    monto: nuevoPrecio,
    desde: new Date(),
  })

  return new Response(JSON.stringify({ success: true }))
}
