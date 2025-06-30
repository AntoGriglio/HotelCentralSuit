/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'

export default function TablaHuespedes() {
  const [huespedes, setHuespedes] = useState<any[]>([])
  const [filtroDni, setFiltroDni] = useState('')
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null)

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
                  {h.foto_cara && (
                    <img
                      src={h.foto_cara}
                      alt="Cara"
                      className="inline-block w-12 h-12 object-cover rounded border cursor-pointer"
                      onClick={() => setImagenSeleccionada(h.foto_cara)}
                      title="Ver Cara"
                    />
                  )}
                  {h.dni_frente && (
                    <img
                      src={h.dni_frente}
                      alt="Frente DNI"
                      className="inline-block w-12 h-12 object-cover rounded border cursor-pointer"
                      onClick={() => setImagenSeleccionada(h.dni_frente)}
                      title="Ver Frente"
                    />
                  )}
                  {h.dni_dorso && (
                    <img
                      src={h.dni_dorso}
                      alt="Dorso DNI"
                      className="inline-block w-12 h-12 object-cover rounded border cursor-pointer"
                      onClick={() => setImagenSeleccionada(h.dni_dorso)}
                      title="Ver Dorso"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE ZOOM */}
      {imagenSeleccionada && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setImagenSeleccionada(null)}
        >
          <img
            src={imagenSeleccionada}
            alt="Documento"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg border-4 border-white"
          />
        </div>
      )}
    </div>
  )
}
