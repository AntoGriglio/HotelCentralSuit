// File: app/api/reportes/egresos/route.ts
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { and, gte, lte, eq } from 'drizzle-orm'
import {
  estadia,
  unidad_habitacional,
  tipo_habitacion,
  cliente,
  limpieza
} from '@/db/schema'

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
        fecha_ingreso: estadia.fecha_ingreso,
        fecha_salida: estadia.fecha_egreso,
        nro_estadia: estadia.nro_estadia,
        cliente_nombre: cliente.nombre_completo,
        telefono: estadia.telefono,
        unidad_nombre: unidad_habitacional.nombre,
        tipo_habitacion: tipo_habitacion.nombre,
        personal_limpieza: limpieza.persona,
        observacion: limpieza.observacion,
      })
      .from(estadia)
      .leftJoin(unidad_habitacional, eq(estadia.habitacion_id, unidad_habitacional.id))
      .leftJoin(tipo_habitacion, eq(estadia.tipo_habitacion_id, tipo_habitacion.id))
      .leftJoin(cliente, eq(estadia.cliente_dni, cliente.dni))
      .leftJoin(limpieza, eq(limpieza.habitacion_id, unidad_habitacional.id))
      .where(and(
        gte(estadia.fecha_egreso, desde),
        lte(estadia.fecha_egreso, hasta)
      ))

    return new Response(JSON.stringify(resultados), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener los egresos', detalle: error }), { status: 500 })
  }
}
