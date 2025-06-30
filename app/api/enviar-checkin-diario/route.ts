// app/api/enviar-checkin-diario/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db' // tu conexión drizzle
import { estadia, cliente } from '@/db/schema'
import { eq } from 'drizzle-orm'
import nodemailer from 'nodemailer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function GET() {
  const hoy = new Date()
  const fechaObjetivo = new Date(hoy)
  fechaObjetivo.setDate(hoy.getDate() + 3)
  const fechaISO = fechaObjetivo.toISOString().split('T')[0]

  const estadias = await db
    .select()
    .from(estadia)
    .where(eq(estadia.fecha_ingreso, fechaISO))

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  })

  for (const e of estadias) {

  if (!e.cliente_dni) continue // salteamos si el DNI es null

const clienteData = await db
  .select()
  .from(cliente)
  .where(eq(cliente.dni, e.cliente_dni)) // ahora e.dni es seguro
  .then((res) => res[0])

    if (!clienteData?.email) continue

    const checkinUrl = `http://localhost:3000/login-cliente?estadia_id=${e.id}`

    const fechaFormatted = format(fechaObjetivo, "EEEE d 'de' MMMM", { locale: es })

    const html = `
      <div style="font-family: sans-serif; padding: 20px; background: #f4f4f4">
        <h2>Hola ${clienteData.nombre_completo || ''},</h2>
        <p>Tu ingreso está previsto para el <strong>${fechaFormatted}</strong>.</p>
        <p>Podés realizar tu check-in online con anticipación desde este enlace:</p>
        <a href="${checkinUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0a5bff; color: white; text-decoration: none; border-radius: 6px;">Hacer Check-in</a>
        <p style="margin-top: 20px;">Hotel Central Suites</p>
      </div>
    `

    await transporter.sendMail({
      from: `"Central Suites" <${process.env.MAIL_USER}>`,
      to: clienteData.email,
      subject: 'Check-in online disponible',
      html,
    })
  }

  return NextResponse.json({ ok: true, enviados: estadias.length })
}
