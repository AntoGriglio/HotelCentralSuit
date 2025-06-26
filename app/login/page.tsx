'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard') // redirige después del login
    }
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
