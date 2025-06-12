'use client'

import { useState } from 'react'

export default function ClientesPage() {
  const [form, setForm] = useState({
    dni: '',
    email: '',
    nombre_completo: '',
    telefono: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/clientes', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      alert('Cliente registrado con éxito!')
      setForm({
        dni: '',
        email: '',
        nombre_completo: '',
        telefono: '',
      })
    } else {
      alert('Error al registrar cliente')
    }
  }

  return (
    <div className="min-h-screen bg-[#3F4E4F] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#DCD7C9] p-8 rounded-2xl shadow-lg font-sans">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#2C3639]">Registrar Cliente</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="dni"
            placeholder="DNI"
            value={form.dni}
            onChange={handleChange}
            required
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          />
          <input
            name="nombre_completo"
            placeholder="Nombre completo"
            value={form.nombre_completo}
            onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          />
          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          />
          <button
            type="submit"
            className="w-full py-3 bg-[#A27B5B] text-white rounded-lg font-semibold hover:bg-[#8e664e]"
          >
            Registrar
          </button>
        </form>
      </div>
    </div>
  )
}
