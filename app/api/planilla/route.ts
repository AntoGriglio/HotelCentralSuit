import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { estadia, cliente, huesped, unidad_habitacional, vehiculo, tipo_habitacion } from '@/db/schema'
import { eq } from 'drizzle-orm'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta el parámetro ?id=' }, { status: 400 })

  const [e] = await db.select().from(estadia).where(eq(estadia.id, id))
  if (!e) return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 })
const [tipo] = await db
  .select()
  .from(tipo_habitacion)
  .where(eq(tipo_habitacion.id, e.tipo_habitacion_id!))

  const [c] = await db.select().from(cliente).where(eq(cliente.dni, e.cliente_dni!))
  const acompañantes = await db.select().from(huesped).where(eq(huesped.estadia_id, id))
  const [v] = await db.select().from(vehiculo).where(eq(vehiculo.estadia_id, id))

  const [h] = await db.select().from(unidad_habitacional).where(eq(unidad_habitacional.id, e.habitacion_id!))

  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  const logoBase64 = fs.readFileSync(logoPath).toString('base64')
const html = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 30px;
          font-size: 11pt;
          line-height: 1.4;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .logo {
          height: 80px;
        }

        .datos-principales {
          width: 60%;
          font-size: 10.5pt;
        }

        .datos-principales div {
          margin-bottom: 8px;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
        }

        .section-title {
          font-weight: bold;
          text-decoration: underline;
          margin-top: 20px;
          margin-bottom: 6px;
        }

        .item {
          margin: 2px 0;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
        }

        .firma {
          margin-top: 40px;
        }

        .small {
          font-size: 10pt;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="data:image/png;base64,${logoBase64}" class="logo" />
        <div class="datos-principales">
          <div><strong>Habitación Nº:</strong> ${h?.nombre ?? ''}</div>
          <div><strong>Tipo:</strong> ${tipo?.nombre ?? ''}</div>
          <div><strong>Check in:</strong> ${e.fecha_ingreso}</div>
          <div><strong>Check out:</strong> ${e.fecha_egreso}</div>
        </div>
      </div>

      <div class="section-title">DATOS DEL TITULAR</div>
      <div class="item"><strong>Nombre y apellido:</strong> ${c?.nombre_completo ?? ''}</div>
      <div class="item"><strong>Teléfono:</strong> ${c?.telefono ?? ''} &nbsp;&nbsp;&nbsp; <strong>DNI:</strong> ${c?.dni ?? ''}</div>
      <div class="item"><strong>Localidad:</strong> ${c?.localidad ?? ''} &nbsp;&nbsp;&nbsp; <strong>E-mail:</strong> ${c?.email ?? ''}</div>
      <div class="item"><strong>Dirección:</strong></div>
      <div class="item"><strong>Provincia:</strong> ${c?.provincia ?? ''} &nbsp;&nbsp;&nbsp; <strong>Fecha de nacimiento:</strong></div>
      <div class="item"><strong>Nacionalidad:</strong> Argentina</div>
      <div class="item"><strong>Patente/marca/modelo/color:</strong> ${v ? `${v.patente ?? ''} / ${v.marca ?? ''} / ${v.modelo ?? ''} / ${v.color ?? ''}` : ''}</div>
      <div class="item"><strong>Dietas:</strong></div>

      <div class="section-title">ACOMPAÑANTES</div>
      ${acompañantes.map(a => `<div class="item">${a.nombre_completo} - DNI: ${a.dni}</div>`).join('')}

      <div class="section-title">CONDICIONES</div>
      <p class="small">El huésped declara haber recibido y aceptado las políticas generales de “Central Suites” al momento del ingreso. El horario de check-in es a partir de las 14 hs y el horario de check-out es hasta las 10 hs, siendo fundamental respetar estos plazos para garantizar el buen funcionamiento del servicio. El ingreso de personas no registradas en el establecimiento está estrictamente prohibido por razones de seguridad y control, de lo contrario el valor de la ocupación será cargado a la cuenta del cliente. Asimismo, está terminantemente prohibido fumar en las habitaciones y en las áreas comunes cerradas. No se permiten mascotas o cualquier otro animal en el interior del hotel.</p>
      <p class="small">El huésped será responsable de cualquier daño, rotura o pérdida ocasionada en la habitación, el mobiliario o los elementos provistos durante su estadía, debiendo abonar el costo correspondiente en caso de ser necesario. “Central Suites” no se hace responsable por objetos personales o de valor no declarados y guardados en recepción.</p>
      <p class="small">Los pedidos de early check-in o late check-out podrán ser considerados según disponibilidad, estos servicios tienen un costo adicional, y se podrán efectuar siempre que se realicen con previo aviso y hayan sido autorizados por administración.</p>
      <p class="small">El pago total de la estadía deberá efectuarse al momento del ingreso, sin excepción. En caso de retiro anticipado, no se realizará devolución por las noches no utilizadas. No se permiten ruidos molestos, con el fin de preservar el descanso de todos los huéspedes.</p>

      <div class="firma">FIRMA: ________________________________________________________________</div>
    </body>
  </html>
`


  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
  await browser.close()

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="planilla_estadia_${e.nro_estadia}.pdf"`,
    }
  })
}
