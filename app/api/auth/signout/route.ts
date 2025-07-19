import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies as getCookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies: () => getCookies() }) // 👈 ESTO ES LO CLAVE
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}
