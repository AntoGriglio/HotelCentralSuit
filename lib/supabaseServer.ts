// lib/getSupabaseServerClient.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function getSupabaseSession(req: NextRequest) {
    console.log(req)
  const res = NextResponse.next();
  console.log('res', res)
  const supabase = createMiddlewareClient({ req, res });
  console.log('supabase',supabase)
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('sesion',session)

  return { supabase, session, res, error };
}
