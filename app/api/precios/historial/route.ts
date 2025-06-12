// app/api/precios/historial/route.ts
import { db } from '@/lib/db'
import { precio } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('itemId')

  if (!itemId) {
    return new Response(JSON.stringify({ error: 'Falta itemId' }), { status: 400 })
  }

  const historico = await db
    .select()
    .from(precio)
    .where(eq(precio.item_id, itemId))
    .orderBy(precio.desde)

  return new Response(JSON.stringify(historico))
}
