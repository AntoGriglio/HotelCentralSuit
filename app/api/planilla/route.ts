import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { estadia, cliente, huesped, unidad_habitacional, vehiculo, tipo_habitacion } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta el parámetro ?id=' }, { status: 400 })

  const [e] = await db.select().from(estadia).where(eq(estadia.id, id))
  if (!e) return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 })

  const [tipo] = await db.select().from(tipo_habitacion).where(eq(tipo_habitacion.id, e.tipo_habitacion_id!))
  const [c] = await db.select().from(cliente).where(eq(cliente.dni, e.cliente_dni!))
  const acompañantes = await db.select().from(huesped).where(eq(huesped.estadia_id, id))
  const [v] = await db.select().from(vehiculo).where(eq(vehiculo.estadia_id, id))
  const [h] = await db.select().from(unidad_habitacional).where(eq(unidad_habitacional.id, e.habitacion_id!))

  return NextResponse.json({
    estadia: e,
    cliente: c,
    tipo_habitacion: tipo,
    unidad: h,
    vehiculo: v,
    huespedes: acompañantes,
  })
}
