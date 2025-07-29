'use client'

import { useState } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const supabase = createPagesBrowserClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      return
    }

    const { data: userData, error: getUserError } = await supabase.auth.getUser()
    const user = userData?.user

    if (getUserError || !user?.id || !user?.email) {
      setError('No se pudo obtener el usuario')
      return
    }

    // Verificamos si el usuario existe en Supabase
    const { error: errorBuscar } = await supabase
      .from('usuario')
      .select('id')
      .eq('id', user.id)
      .single()

    if (errorBuscar && errorBuscar.code !== 'PGRST116') {
      setError('Error al verificar usuario')
      return
    }

localStorage.setItem('usuario_id', user.id);

// 🔍 Auditar login
await fetch('/api/auth/auditar-login', { method: 'POST' });

// Redireccionar
window.location.href = '/dashboard';

  }

  return (
    <div className="min-h-screen bg-[#374e4e] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl font-sans">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#374e4e]">Central Suites</h1>
        <p className="text-center text-gray-500 mb-6">Accedé a tu panel de gestión</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#374e4e]"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#374e4e]"
          />
          <button
            type="submit"
            className="w-full py-3 bg-white text-[#374e4e] border border-[#374e4e] font-semibold rounded-lg hover:bg-[#2e3f3f] hover:text-white transition-colors"
          >
            Ingresar
          </button>
        </form>

        {error && <p className="mt-4 text-center text-red-600">{error}</p>}
      </div>
    </div>
  )
}
