import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSession } from '@/lib/supabaseServer';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { auditoria } from '@/db/schema';

export async function POST(req: NextRequest) {
  const { session } = await getSupabaseSession(req);
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
  }

  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql.raw(`SET LOCAL "jwt.claims.usuario_id" = '${user.id}'`));

      await tx.insert(auditoria).values({
        id: uuidv4(),
        tabla: 'auth',
        accion: 'LOGIN',
        registro_id: user.id,
        usuario_id: user.id,
        datos: {
          email: user.email,
          metodo: 'password',
          fecha: new Date().toISOString()
        }
      });
    });

    return NextResponse.json({ message: 'Login auditado correctamente' });
  } catch (err) {
    console.error('[ERROR LOGIN AUDITORIA]', err);
    return NextResponse.json({ error: 'Error al registrar auditoría' }, { status: 500 });
  }
}
