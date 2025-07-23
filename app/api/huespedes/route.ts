
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { huesped } from '@/db/schema'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const estadia_id = formData.get('estadia_id') as string

    if (!estadia_id) {
      return NextResponse.json({ error: 'Falta el ID de estadía' }, { status: 400 })
    }

    const huespedes: typeof huesped.$inferInsert[] = []
    let i = 0

    while (formData.get(`dni_${i}`)) {
      const nombre_completo = formData.get(`nombre_completo_${i}`)?.toString() ?? ''
      const dni = formData.get(`dni_${i}`)?.toString() ?? ''
      const fecha_nacimiento = formData.get(`fecha_nacimiento_${i}`)?.toString() ?? ''
      const sexo = formData.get(`sexo_${i}`)?.toString() ?? ''
      const dni_frente = formData.get(`imagen_dni_frente_${i}`)?.toString() ?? ''
      const dni_dorso = formData.get(`imagen_dni_dorso_${i}`)?.toString() ?? ''

      if (!nombre_completo || !dni || !fecha_nacimiento || !sexo) {
        return NextResponse.json({ error: `Faltan datos en huésped ${i + 1}` }, { status: 400 })
      }

      huespedes.push({
        id: uuidv4(),
        estadia_id,
        nombre_completo,
        dni,
        fecha_nacimiento: new Date(fecha_nacimiento).toISOString(),
        sexo,
        dni_frente,
        dni_dorso,
      })

      i++
    }

    if (huespedes.length === 0) {
      return NextResponse.json({ error: 'No se enviaron huéspedes' }, { status: 400 })
    }

    // ✅ Insert masivo
    await db.insert(huesped).values(huespedes)

    return NextResponse.json({
      mensaje: 'Huéspedes registrados correctamente',
      cantidad: huespedes.length,
    })
  } catch (error) {
    console.error('❌ Error al registrar huéspedes:', error)
    return NextResponse.json(
      { error: 'Error interno al registrar huéspedes' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const resultado = await db.select().from(huesped)
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('❌ Error al obtener huéspedes:', error)
    return NextResponse.json({ error: 'Error al obtener huéspedes' }, { status: 500 })
  }
}
