// File: app/api/reportes/ingresos/route.ts
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { and, gte, lte, eq } from 'drizzle-orm'
import { estadia, unidad_habitacional, tipo_habitacion, canal_comercializacion, cliente, tipo_unidad_habitacional } from '@/db/schema'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')

  if (!desde || !hasta) {
    return new Response(JSON.stringify({ error: 'Parámetros "desde" y "hasta" son requeridos' }), {
      status: 400,
    })
  }

  try {
  const resultados = await db
  .select({
    numero_unidad: unidad_habitacional.numero,
    tipo_unidad: tipo_unidad_habitacional.descripcion,
    numero_reserva: estadia.nro_estadia,
    cliente: cliente.nombre_completo,
    telefono: cliente.telefono,
    canal: canal_comercializacion.descripcion,
    fecha_ingreso: estadia.fecha_ingreso,
    fecha_egreso: estadia.fecha_egreso,
    cantidad_personas: estadia.cantidad_personas,
    precio_por_noche: estadia.precio_por_noche,
    total_estadia: estadia.total,
    pagado: estadia.monto_reserva,
    observaciones: estadia.observaciones,
  })
  .from(estadia)
  .leftJoin(unidad_habitacional, eq(estadia.habitacion_id, unidad_habitacional.id))
  .leftJoin(tipo_unidad_habitacional, eq(unidad_habitacional.tipo_unidad_id, tipo_unidad_habitacional.id))
  .leftJoin(tipo_habitacion, eq(estadia.tipo_habitacion_id, tipo_habitacion.id))
  .leftJoin(canal_comercializacion, eq(estadia.canal_id, canal_comercializacion.id))
  .leftJoin(cliente, eq(estadia.cliente_dni, cliente.dni))
  .where(and(
    gte(estadia.fecha_ingreso, desde),
    lte(estadia.fecha_ingreso, hasta)
  ));

    return new Response(JSON.stringify(resultados), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener los ingresos', detalle: error }), { status: 500 })
  }
}
