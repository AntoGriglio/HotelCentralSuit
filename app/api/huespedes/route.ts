/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { huesped } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const estadia_id = formData.get('estadia_id') as string;

    const huespedes: any[] = [];
    let i = 0;
    while (formData.get(`dni_${i}`)) {
      const nombre_completo = formData.get(`nombre_completo_${i}`) as string;
      const dni = formData.get(`dni_${i}`) as string;
      const fecha_nacimiento = formData.get(`fecha_nacimiento_${i}`) as string;
      const sexo = formData.get(`sexo_${i}`) as string;

      const imagen_cara = formData.get(`imagen_cara_${i}`) as string;
      const imagen_dni_frente = formData.get(`imagen_dni_frente_${i}`) as string;
      const imagen_dni_dorso = formData.get(`imagen_dni_dorso_${i}`) as string;

            huespedes.push({
        id: uuidv4(),
        estadia_id,
        nombre_completo,
        dni,
        fecha_nacimiento: new Date(fecha_nacimiento).toISOString(),
        sexo,
        imagen_cara,
        imagen_dni_frente,
        imagen_dni_dorso,
      });

      i++;
    }

    for (const h of huespedes) {
      await db.insert(huesped).values(h);
    }

    return NextResponse.json({ mensaje: 'Huéspedes registrados correctamente', cantidad: huespedes.length });
  } catch (error) {
    console.error('❌ Error al registrar huéspedes:', error);
    return NextResponse.json({ error: 'Error interno al registrar huéspedes' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const resultado = await db.select().from(huesped);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener huéspedes:', error);
    return NextResponse.json({ error: 'Error al obtener huéspedes' }, { status: 500 });
  }
}