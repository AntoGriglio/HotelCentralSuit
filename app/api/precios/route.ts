import { db } from '@/lib/db'
import {
  item_precio,
  precio,
  unidad_habitacional,
  precio_habitacion,
  tipo_habitacion,
} from '@/db/schema'
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
}export async function POST(req: Request) {
  const body = await req.json()
  const { itemId, nuevoPrecio } = body

  console.log('📥 Body recibido:', body)

  if (!itemId || !nuevoPrecio) {
    console.log('❌ Faltan datos')
    return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 })
  }

  await db
    .update(precio)
    .set({ hasta: new Date() })
    .where(and(eq(precio.item_id, itemId), isNull(precio.hasta)))

  await db.insert(precio).values({
    item_id: itemId,
    monto: nuevoPrecio,
    desde: new Date(),
  })

  const item = await db
    .select({ nombre: item_precio.nombre })
    .from(item_precio)
    .where(eq(item_precio.id, itemId))
    .then(res => res[0])

  console.log('🧾 item_precio:', item)

  if (!item?.nombre) {
    console.log('❌ No se encontró el item_precio')
    return new Response(JSON.stringify({ error: 'No se encontró el ítem' }), { status: 404 })
  }

  const tipo = await db
    .select({ id: tipo_habitacion.id })
    .from(tipo_habitacion)
    .where(eq(tipo_habitacion.nombre, item.nombre))
    .then(res => res[0])

  console.log('🏷️ tipo_habitacion encontrado:', tipo)

  if (!tipo?.id) {
    console.log('❌ No se encontró tipo_habitacion con nombre:', item.nombre)
    return new Response(JSON.stringify({ error: 'No se encontró tipo de habitación' }), { status: 404 })
  }

  const habitaciones = await db
    .select({
      id: unidad_habitacional.id,
      cantidad_normal: unidad_habitacional.cantidad_normal,
    })
    .from(unidad_habitacional)
    .where(eq(unidad_habitacional.tipo_habitacion_id, tipo.id))

  console.log('🛏️ Habitaciones encontradas:', habitaciones)

  await Promise.all(
    habitaciones.map(async (hab) => {
      const cantidad = hab.cantidad_normal ?? 1
      const montoFinal = cantidad * nuevoPrecio

      console.log(`💰 Insertando precio para hab ${hab.id}: ${cantidad} * ${nuevoPrecio} = ${montoFinal}`)

      await db
        .delete(precio_habitacion)
        .where(eq(precio_habitacion.habitacion_id, hab.id))

      await db.insert(precio_habitacion).values({
        habitacion_id: hab.id,
        monto: montoFinal,
      })
    })
  )

  console.log('✅ Proceso de actualización de precios completado.')
  return new Response(JSON.stringify({ success: true }))
}
