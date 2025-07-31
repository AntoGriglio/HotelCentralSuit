// app/api/reportes/cobranzas/route.ts
import { db } from '@/lib/db'
import { between, eq, sql, and } from 'drizzle-orm'
import { auditoria, cliente, estadia, forma_pago, pago, usuario } from '@/db/schema'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const desde = req.nextUrl.searchParams.get('desde')
  const hasta = req.nextUrl.searchParams.get('hasta')

  if (!desde || !hasta) {
    return new Response(JSON.stringify({ error: 'Faltan fechas' }), { status: 400 })
  }

  const desdeDate = new Date(`${desde}T00:00:00`)
  const hastaDate = new Date(`${hasta}T23:59:59`)

  const detalles = await db
    .select({
      fecha_pago: pago.fecha_pago,
      medio_pago: forma_pago.descripcion,
      nro_estadia: estadia.nro_estadia,
      cliente_nombre: cliente.nombre_completo,
      cliente_dni: cliente.dni,
      monto: pago.monto,
      usuario: usuario.email
    })
    .from(pago)
    .leftJoin(forma_pago, eq(pago.forma_pago_id, forma_pago.id)) // CAMBIO CLAVE
    .innerJoin(estadia, eq(pago.estadia_id, estadia.id))
    .innerJoin(cliente, eq(estadia.cliente_dni, cliente.dni))
.leftJoin(
  auditoria, 
  and(
    eq(auditoria.registro_id, pago.id),
    eq(auditoria.tabla, 'pago')
  )
)
.leftJoin(usuario, eq(auditoria.usuario_id, usuario.id))

    .where(between(pago.fecha_pago, desdeDate, hastaDate))
    .orderBy(pago.fecha_pago)

  const totales = await db
    .select({
      medio_pago: forma_pago.descripcion,
      total: sql<number>`SUM(${pago.monto})`
    })
    .from(pago)
    .leftJoin(forma_pago, eq(pago.forma_pago_id, forma_pago.id)) // CAMBIO CLAVE
    .where(between(pago.fecha_pago, desdeDate, hastaDate))
    .groupBy(forma_pago.descripcion)

  return Response.json({ detalles, totales })
}
