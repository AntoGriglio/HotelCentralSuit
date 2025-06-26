/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useRouter } from 'next/navigation' // ✅ Correcta para app router

import { useState, useEffect } from 'react'

const provinciasAR = [
  'Buenos Aires','Ciudad Autónoma de Buenos Aires','Catamarca','Chaco',
  'Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy',
  'La Pampa','La Rioja','Mendoza','Misiones','Neuquén',
  'Río Negro','Salta','San Juan','San Luis','Santa Cruz',
  'Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán'
]

export default function ClientesPage() {
  const [form, setForm] = useState({
    dni: '', email: '', nombre_completo: '',
    telefono: '', localidad: '', provincia: '', pais: ''
  })
  const [paises, setPaises] = useState<string[]>([])
const router = useRouter();
 useEffect(() => {
  fetch('https://restcountries.com/v3.1/all?fields=name')
    .then(res => res.json())
    .then((data: any[]) => {
      const list = data.map((c: any) => c.name.common).sort()
      setPaises(list)
    })
    .catch(err => console.error('Error al cargar países:', err))
}, [])

  const showProvincia = form.pais === 'Argentina'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value, ...(name === 'pais' && value !== 'Argentina' ? { provincia: '' } : {}) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      alert('Cliente registrado con éxito!')
      setForm({ dni: '', email: '', nombre_completo: '', telefono: '', localidad: '', provincia: '', pais: '' })
    } else {
      alert('Error al registrar cliente')
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
        <h1 className="text-2xl font-bold mb-6 text-center text-[#2C3639]">Registrar Cliente</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="dni" placeholder="DNI" value={form.dni} onChange={handleChange} required className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input name="nombre_completo" placeholder="Nombre completo" value={form.nombre_completo} onChange={handleChange} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input name="localidad" placeholder="Localidad" value={form.localidad} onChange={handleChange} required className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <select name="pais" value={form.pais} onChange={handleChange} required className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
            <option value="">Seleccione país</option>
            {paises.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {showProvincia && (
            <select name="provincia" value={form.provincia} onChange={handleChange} required className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
              <option value="">Provincia</option>
              {provinciasAR.map(prov => <option key={prov} value={prov}>{prov}</option>)}
            </select>
          )}
          <button type="submit" className="w-full py-3 bg-[#A27B5B] text-white rounded-lg font-semibold hover:bg-[#8e664e]">
            Registrar
          </button>
        </form>
      </div>
    </div>
  )
}
