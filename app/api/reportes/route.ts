import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { estadia, estado_estadia, unidad_habitacional, tipo_unidad_habitacional } from '@/db/schema'
import { and, eq, gte, lte } from 'drizzle-orm'
import { addMonths, endOfMonth, format } from 'date-fns'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mesParam = searchParams.get('mes')
  const trimestreParam = searchParams.get('trimestre')

  if (!mesParam) {
    return NextResponse.json({ error: 'Falta el parámetro ?mes=YYYY-MM' }, { status: 400 })
  }

  const [anio, mes] = mesParam.split('-').map(Number)
  if (!anio || !mes) {
    return NextResponse.json({ error: 'Formato de mes inválido' }, { status: 400 })
  }

  const desde = new Date(anio, mes - 1, 1)
  const hasta = trimestreParam === 'true' ? endOfMonth(addMonths(desde, 2)) : endOfMonth(desde)

  const tipoAlquilable = await db
    .select()
    .from(tipo_unidad_habitacional)
    .where(eq(tipo_unidad_habitacional.descripcion, 'Alquilable'))

  const tipoAlquilableId = tipoAlquilable[0]?.id
  if (!tipoAlquilableId) {
    return NextResponse.json({ error: 'No se encontró el tipo "alquilable"' }, { status: 500 })
  }

  const habitaciones = await db
    .select()
    .from(unidad_habitacional)
    .where(eq(unidad_habitacional.tipo_unidad_id, tipoAlquilableId))

  const estadiasConEstado = await db
    .select({
      id: estadia.id,
      habitacion_id: estadia.habitacion_id,
      fecha_ingreso: estadia.fecha_ingreso,
      fecha_egreso: estadia.fecha_egreso,
      estado_nombre: estado_estadia.nombre
    })
    .from(estadia)
    .leftJoin(estado_estadia, eq(estadia.estado_id, estado_estadia.id))
    .where(
      and(
        gte(estadia.fecha_egreso, format(desde, 'yyyy-MM-dd')),
        lte(estadia.fecha_ingreso, format(hasta, 'yyyy-MM-dd'))
      )
    )

  const resultado = habitaciones.map((hab) => {
    const estadiasDeHab = estadiasConEstado
      .filter(e => e.habitacion_id === hab.id)
      .map(est => ({
        ingreso: est.fecha_ingreso,
        egreso: est.fecha_egreso,
        estado: est.estado_nombre?.toLowerCase()
      }))

    return {
      habitacion_id: hab.id,
      numero: hab.numero,
      nombre: hab.nombre,
      estadias: estadiasDeHab,
      tipo_habitacion_id: hab.tipo_habitacion_id,
    }
  })

  return NextResponse.json(resultado)
}
