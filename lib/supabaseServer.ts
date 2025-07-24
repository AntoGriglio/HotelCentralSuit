// lib/getSupabaseServerClient.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function getSupabaseSession(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session }, error } = await supabase.auth.getSession();

  return { supabase, session, res, error };
}
