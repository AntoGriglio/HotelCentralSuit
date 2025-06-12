/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  if (!session) return null

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
      <Link href="/clientes" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Clientes</Link>
      <Link href="/unidades" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Unidades</Link>
      <Link href="/precios" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Precios</Link>
       <Link href="/disponibilidad" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Disponibilidad</Link>
      <Link href="/reportes" className="hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors">Reportes</Link>
      <button
        onClick={() => signOut()}
        className="ml-auto hover:bg-white hover:text-[#374e4e] px-3 py-2 rounded transition-colors"
      >
        Cerrar sesión
      </button>
    </nav>
  )
}
