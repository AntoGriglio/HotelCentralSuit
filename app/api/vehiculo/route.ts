import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { vehiculo } from '@/db/schema'

export async function POST(req: NextRequest) {
  const data = await req.json()

  if (!data.estadia_id) {
    return NextResponse.json({ error: 'Falta estadia_id' }, { status: 400 })
  }

  try {
    await db.insert(vehiculo).values({
      estadia_id: data.estadia_id,
      patente: data.patente,
      color: data.color,
      marca: data.marca,
      modelo: data.modelo,
      cochera_nro: data.cochera_nro,
    })

    return NextResponse.json({ message: 'Vehículo registrado correctamente' })
  } catch (error) {
    console.error('Error al guardar vehículo:', error)
    return NextResponse.json({ error: 'Error al registrar vehículo' }, { status: 500 })
  }
}
