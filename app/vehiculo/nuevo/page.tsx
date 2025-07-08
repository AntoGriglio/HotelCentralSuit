'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NuevoVehiculo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const estadia_id = searchParams.get('estadia_id') ?? ''
  const nro_estadia = searchParams.get('nro_estadia') ?? ''

  const [form, setForm] = useState({
    patente: '',
    color: '',
    marca: '',
    modelo: '',
    cochera_nro: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/vehiculo', {
      method: 'POST',
      body: JSON.stringify({ ...form, estadia_id }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      alert('Vehículo guardado')
      router.push('/estadias')
    } else {
      alert('Error al guardar vehículo')
    }
  }

  return (
    <div className="min-h-screen bg-[#3F4E4F] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#DCD7C9] p-8 rounded-2xl shadow-lg font-sans">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          ← Atrás
        </button>
        <h1 className="text-2xl font-bold mb-6 text-center text-[#2C3639]">
          Registrar Vehículo para estadía #{nro_estadia}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="patente"
            placeholder="Patente"
            value={form.patente}
            onChange={handleChange}
            required
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          />
          <input
            name="color"
            placeholder="Color"
            value={form.color}
            onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          />
          <input
            name="marca"
            placeholder="Marca"
            value={form.marca}
            onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          />
          <input
            name="modelo"
            placeholder="Modelo"
            value={form.modelo}
            onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          />
          <input
            name="cochera_nro"
            placeholder="Cochera N°"
            value={form.cochera_nro}
            onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          />
          <button
            type="submit"
            className="w-full py-3 bg-[#A27B5B] text-white rounded-lg font-semibold hover:bg-[#8e664e]"
          >
            Guardar vehículo
          </button>
        </form>
      </div>
    </div>
  )
}
