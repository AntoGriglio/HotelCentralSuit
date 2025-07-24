// File: app/api/reportes/ingresos/route.ts
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { and, gte, lte, eq } from 'drizzle-orm'
import { estadia, unidad_habitacional, tipo_habitacion, canal_comercializacion, cliente } from '@/db/schema'

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
        cliente_telefono: estadia.telefono,
        unidad_nombre: unidad_habitacional.nombre,
        tipo_habitacion: tipo_habitacion.nombre,
        canal: canal_comercializacion.descripcion,
        cant_noches: estadia.fecha_egreso, // calculamos en frontend
        cant_personas: estadia.cantidad_personas,
        precio_noche: estadia.precio_por_noche,
        total: estadia.total,
        pagado: estadia.monto_reserva,
        saldo: estadia.total,
        desayuno: estadia.desayuno,
        media_pension: estadia.pension_media,
        pension_completa: estadia.pension_completa,
        all_inclusive: estadia.all_inclusive,
        ropa_blanca: estadia.ropa_blanca,
        observaciones: estadia.observaciones,
      })
      .from(estadia)
      .leftJoin(unidad_habitacional, eq(estadia.habitacion_id, unidad_habitacional.id))
      .leftJoin(tipo_habitacion, eq(estadia.tipo_habitacion_id, tipo_habitacion.id))
      .leftJoin(canal_comercializacion, eq(estadia.canal_id, canal_comercializacion.id))
      .leftJoin(cliente, eq(estadia.cliente_dni, cliente.dni))
      .where(and(
        gte(estadia.fecha_ingreso, desde),
        lte(estadia.fecha_ingreso, hasta)
      ))

    return new Response(JSON.stringify(resultados), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener los ingresos', detalle: error }), { status: 500 })
  }
}
