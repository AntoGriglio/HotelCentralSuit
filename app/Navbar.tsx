// app/components/Navbar.tsx (⚠️ sin 'use client')
import Link from 'next/link'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function Navbar() {
  const supabase = createServerComponentClient({ cookies: () => cookies() })
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null // o un nav vacío

  return (
    <nav className="bg-[#374e4e] px-6 py-4 flex items-center gap-4 shadow-md text-white font-medium">
      <Link href="/dashboard" className="mr-4">
        <img
          src="/logo-central.png"
          alt="Central Suites"
          className="h-10 w-auto"
        />
      </Link>

      <Link href="/estadias" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Estadías</Link>
      <Link href="/estadias/sin-confirmar" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Sin Confirmar</Link>
      <Link href="/clientes" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Clientes</Link>
      <Link href="/unidades" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Unidades</Link>
      <Link href="/precios" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Precios</Link>
      <Link href="/huesped" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Huéspedes</Link>
      <Link href="/disponibilidad" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Disponibilidad</Link>
      <Link href="/reportes" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Reportes</Link>

      <form action="/api/auth/signout" method="post" className="ml-auto">
        <button
          type="submit"
          className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors"
        >
          Cerrar sesión
        </button>
      </form>
    </nav>
  )
}
