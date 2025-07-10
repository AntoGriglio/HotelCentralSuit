/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Para detectar cambios como logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!user) return null

  return (
    <nav className="bg-[#374e4e] px-6 py-4 flex items-center gap-4 shadow-md text-white font-medium">
      <Link href="/dashboard" className="mr-4">
        <img
          src="/logo-central.png" 
          alt="Logo Central Suites"
          className="h-10 w-auto"
        />
      </Link>

      <Link href="/estadias" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Estadías</Link>
       <Link href="/estadias/sin-confirmar" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Sin Confirmar</Link>
    
      <Link href="/clientes" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Clientes</Link>
      <Link href="/unidades" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Unidades</Link>
      <Link href="/precios" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Precios</Link>
        <Link href="/huesped" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Huespedes</Link>
  
      <Link href="/disponibilidad" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Disponibilidad</Link>
      <Link href="/reportes" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Reportes</Link>
      <button
        onClick={() => supabase.auth.signOut().then(() => location.reload())}
        className="ml-auto hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors"
      >
        Cerrar sesión
      </button>
    </nav>
  )
}
