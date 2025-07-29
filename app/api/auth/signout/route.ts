import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies as getCookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auditoria } from '@/db/schema';
import { getSupabaseSession } from '@/lib/supabaseServer';
import { v4 as uuidv4 } from 'uuid';
import { sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies: () => getCookies() });

  const { session } = await getSupabaseSession(req); // ✅ Pasar `req`
  const user = session?.user;

  if (user) {
    try {
      await db.transaction(async (tx) => {
        await tx.execute(sql.raw(`SET LOCAL "jwt.claims.usuario_id" = '${user.id}'`));

        await tx.insert(auditoria).values({
          id: uuidv4(),
          tabla: 'auth',
          accion: 'LOGOUT',
          registro_id: user.id,
          usuario_id: user.id,
          datos: {
            email: user.email,
            fecha: new Date().toISOString(),
          },
        });
      });
    } catch (err) {
      console.error('[ERROR LOGOUT AUDITORIA]', err);
    }
  }

  await supabase.auth.signOut();

return NextResponse.redirect(new URL(process.env.NEXTAUTH_URL!));
}
