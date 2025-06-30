import { transporter } from '@/lib/mailer'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const data = await req.formData()
  const to = data.get('to') as string
  const file = data.get('pdf') as File

  if (!to || !file) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  await transporter.sendMail({
    from: `"Central Suites" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Comprobante de pago',
    text: 'Adjuntamos el comprobante de pago correspondiente a tu estadía. ¡Gracias por elegirnos!',
    attachments: [
      {
        filename: 'comprobante.pdf',
        content: buffer,
        contentType: 'application/pdf',
      },
    ],
  })

  return NextResponse.json({ status: 'ok' })
}
