import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { estadia, estado_estadia, unidad_habitacional, tipo_unidad_habitacional } from '@/db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import { addDays, endOfMonth, format, isBefore, isEqual, isAfter, addMonths } from 'date-fns';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mesParam = searchParams.get('mes');
  const trimestreParam = searchParams.get('trimestre'); // opcional: true | false

  if (!mesParam) {
    return NextResponse.json({ error: 'Falta el parámetro ?mes=YYYY-MM' }, { status: 400 });
  }

  const [anio, mes] = mesParam.split('-').map(Number);
  if (!anio || !mes) {
    return NextResponse.json({ error: 'Formato de mes inválido' }, { status: 400 });
  }

  // 📅 Calcular rango (mes o trimestre)
  const desde = new Date(anio, mes - 1, 1);
  const hasta = trimestreParam === 'true'
    ? endOfMonth(addMonths(desde, 2))
    : endOfMonth(desde);

  // Generar array de días
  const dias: string[] = [];
  for (let d = new Date(desde); !isAfter(d, hasta); d = addDays(d, 1)) {
    dias.push(format(d, 'yyyy-MM-dd'));
  }

  // Obtener ID de tipo alquilable
  const tipoAlquilable = await db
    .select()
    .from(tipo_unidad_habitacional)
    .where(eq(tipo_unidad_habitacional.descripcion, 'Alquilable'));

  const tipoAlquilableId = tipoAlquilable[0]?.id;
  if (!tipoAlquilableId) {
    return NextResponse.json({ error: 'No se encontró el tipo "alquilable"' }, { status: 500 });
  }

  // Traer habitaciones alquilables
  const habitaciones = await db
    .select()
    .from(unidad_habitacional)
    .where(eq(unidad_habitacional.tipo_unidad_id, tipoAlquilableId));

  // Traer estadías que se cruzan con el rango
  const estadiasConEstado = await db
    .select({
      id: estadia.id,
      habitacion_id: estadia.habitacion_id,
      fecha_ingreso: estadia.fecha_ingreso,
      fecha_egreso: estadia.fecha_egreso,
      estado_nombre: estado_estadia.nombre,
    })
    .from(estadia)
    .leftJoin(estado_estadia, eq(estadia.estado_id, estado_estadia.id))
    .where(
      and(
        gte(estadia.fecha_egreso, format(desde, 'yyyy-MM-dd')),
        lte(estadia.fecha_ingreso, format(hasta, 'yyyy-MM-dd'))
      )
    );

  // Armar disponibilidad
  const resultado = habitaciones.map((hab) => {
    const disponibilidad: Record<string, string> = {};
    for (const dia of dias) {
      disponibilidad[dia] = 'disponible';
    }

    const estadiasDeHab = estadiasConEstado.filter(e => e.habitacion_id === hab.id);

    for (const est of estadiasDeHab) {
      if (!est.fecha_ingreso || !est.fecha_egreso) continue;

      const desdeEst = new Date(est.fecha_ingreso);
      const hastaEst = new Date(est.fecha_egreso);

      for (const dia of dias) {
        const diaDate = new Date(dia);
        if (
          (isEqual(diaDate, desdeEst) || isAfter(diaDate, desdeEst)) &&
          (isEqual(diaDate, hastaEst) || isBefore(diaDate, hastaEst))
        ) {
          const estado = est.estado_nombre?.toLowerCase();
          if (estado?.includes('reservado') || estado?.includes('pagado')) {
            disponibilidad[dia] = 'reservado';
          } else if (estado?.includes('pendiente') || estado?.includes('sin confirmar')) {
            disponibilidad[dia] = 'pendiente';
          }
        }
      }
    }

    return {
      habitacion_id: hab.id,
      numero: hab.numero,
      nombre: hab.nombre,
      disponibilidad,
    };
  });

  return NextResponse.json(resultado);
}
