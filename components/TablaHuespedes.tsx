/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'

export default function TablaHuespedes() {
  const [huespedes, setHuespedes] = useState<any[]>([])
  const [filtroDni, setFiltroDni] = useState('')

  useEffect(() => {
    const fetchHuespedes = async () => {
      const res = await fetch('/api/huespedes')
      const data = await res.json()
      setHuespedes(data)
    }
    fetchHuespedes()
  }, [])

  const huespedesFiltrados = huespedes.filter((h) =>
    h.dni.toLowerCase().includes(filtroDni.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Huéspedes</h1>

      <input
        type="text"
        placeholder="Filtrar por DNI"
        className="mb-4 p-2 border rounded w-full max-w-sm"
        value={filtroDni}
        onChange={(e) => setFiltroDni(e.target.value)}
      />

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#2C3639] text-white">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">DNI</th>
              <th className="px-4 py-3">Nacimiento</th>
              <th className="px-4 py-3">Sexo</th>
              <th className="px-4 py-3">Fotos</th>
            </tr>
          </thead>
          <tbody>
            {huespedesFiltrados.map((h) => (
              <tr key={h.id} className="border-b hover:bg-[#2C3639]/10">
                <td className="px-4 py-2">{h.nombre_completo}</td>
                <td className="px-4 py-2">{h.dni}</td>
                <td className="px-4 py-2">{new Date(h.fecha_nacimiento).toLocaleDateString()}</td>
                <td className="px-4 py-2">{h.sexo}</td>
                <td className="px-4 py-2 space-x-2">
                  {h.imagen_cara && (
                    <a href={`https://YOUR_PROJECT.supabase.co/storage/v1/object/public/documentos/${h.imagen_cara}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Cara</a>
                  )}
                  {h.imagen_dni_frente && (
                    <a href={`https://YOUR_PROJECT.supabase.co/storage/v1/object/public/documentos/${h.imagen_dni_frente}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Frente</a>
                  )}
                  {h.imagen_dni_dorso && (
                    <a href={`https://YOUR_PROJECT.supabase.co/storage/v1/object/public/documentos/${h.imagen_dni_dorso}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Dorso</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
