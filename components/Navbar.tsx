'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null; // No mostrar el navbar si no está logueado

  return (
    <nav style={{ padding: '1rem', background: '#171717', display: 'flex', gap: '1rem' }}>
      <Link href="/">Inicio</Link>
      <Link href="/estadias">Estadias</Link>
      <Link href="/clientes">Clientes</Link>
      <Link href="/habitaciones">Habitaciones</Link>
      <Link href="/reportes">Reportes</Link>
      <button onClick={() => signOut()}>Cerrar sesión</button>
    </nav>
  );
}
