/* eslint-disable @typescript-eslint/no-unused-vars */
import { transporter } from '@/lib/mailer'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  const data = await req.formData()
  const to = data.get('to') as string
  const pdfBuffer = data.get('pdf') as File

  const pdfArrayBuffer = await pdfBuffer.arrayBuffer()

  await transporter.sendMail({
    from: `"Central Suites" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Confirmación de reserva',
    text: 'Adjuntamos el comprobante de tu reserva. ¡Gracias por elegirnos!',
    attachments: [
      {
        filename: 'reserva.pdf',
        content: Buffer.from(pdfArrayBuffer),
        contentType: 'application/pdf',
      },
    ],
  })

  return NextResponse.json({ status: 'ok' })
}
