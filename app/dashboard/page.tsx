'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createPagesBrowserClient()

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return router.push('/login')
      setUser(data.user)
      setLoading(false)
    })
  }, [router])

  if (loading) return null // o spinner

  return (
    <div className="relative min-h-screen bg-[#f9f9f9]">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 z-0  flex items-center justify-center pointer-events-none select-none">
          <Image
            src="/central-suites-bg.svg"
            alt="Central Suites"
            width={600}
            height={600}
            className="object-contain"
          />
        </div>
      </div>
      <div className="relative z-10 p-10 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-[#374e4e] mb-4">
          Bienvenido, {user.user_metadata?.name || user.email}!
        </h1>
      </div>
    </div>
  )
}
