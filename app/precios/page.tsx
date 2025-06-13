/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ListaPrecios() {
  const [items, setItems] = useState<any[]>([])
  const [historial, setHistorial] = useState<{ [key: string]: any[] }>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    const fetchPrecios = async () => {
      const res = await fetch('/api/precios')
      const data = await res.json()
      setItems(data)
    }
    fetchPrecios()
  }, [])

  const toggleHistorial = async (itemId: string) => {
    if (expanded === itemId) {
      setExpanded(null)
    } else {
      if (!historial[itemId]) {
        const res = await fetch(`/api/precios/historial?itemId=${itemId}`)
        const data = await res.json()
        setHistorial((prev) => ({ ...prev, [itemId]: data }))
      }
      setExpanded(itemId)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-[#2C3639] mb-6">Lista de Precios</h2>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#2C3639] text-white">
            <tr>
              <th className="px-4 py-3">Ítem</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Desde</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <>
                <tr key={item.item_id} className="border-b hover:bg-[#DCD7C9]">
                  <td className="px-4 py-2">{item.item}</td>
                  <td className="px-4 py-2">${item.precio_actual?.toFixed(2) || '-'}</td>
                  <td className="px-4 py-2">{item.desde ? new Date(item.desde).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-2 flex gap-2 justify-center">
                    <button
                     onClick={() => router.push(`/precios/nuevo?id=${item.item_id}`)}

                      className="text-sm bg-[#A27B5B] text-white px-3 py-1 rounded hover:bg-[#8b6244]"
                    >
                      Modificar
                    </button>
                    <button
                      onClick={() => toggleHistorial(item.item_id)}
                      className="text-sm bg-[#DCD7C9] text-[#2C3639] px-3 py-1 rounded hover:bg-[#c9c4b7]"
                    >
                      {expanded === item.item_id ? 'Ocultar' : 'Ver historial'}
                    </button>
                  </td>
                </tr>
                {expanded === item.item_id && (
                  <tr className="bg-[#F5F5F5]">
                    <td colSpan={5} className="px-4 py-2">
                      <p className="font-semibold mb-2 text-[#2C3639]">Precios anteriores:</p>
                      <table className="w-full border text-sm">
                        <thead>
                          <tr className="bg-[#DCD7C9] text-[#2C3639]">
                            <th className="border px-2 py-1">Precio</th>
                            <th className="border px-2 py-1">Desde</th>
                            <th className="border px-2 py-1">Hasta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historial[item.item_id]?.length > 0 ? (
                            historial[item.item_id].map((h, idx) => (
                              <tr key={idx} className="text-[#2C3639]">
                                <td className="border px-2 py-1">${h.monto.toFixed(2)}</td>
                                <td className="border px-2 py-1">{new Date(h.desde).toLocaleDateString()}</td>
                                <td className="border px-2 py-1">{h.hasta ? new Date(h.hasta).toLocaleDateString() : '-'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="px-2 py-1" colSpan={3}>No hay precios anteriores.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}