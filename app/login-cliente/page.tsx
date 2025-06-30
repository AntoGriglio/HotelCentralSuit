'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  const estadiaId = searchParams.get('estadia_id')

  useEffect(() => {
    const signInWithGoogle = async () => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/huesped?estadia_id=${estadiaId}`,
        },
      })
    }

    signInWithGoogle()
  }, [estadiaId])

  return <p className="p-6">Redirigiendo a Google...</p>
}
