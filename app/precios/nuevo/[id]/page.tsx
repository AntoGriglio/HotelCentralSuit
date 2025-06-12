'use client'

import { useState } from 'react'

export default function CambiarPrecioPage({ params }: { params: { id: string } }) {
  const itemId = params.id
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const actualizarPrecio = async () => {
    if (!nuevoPrecio || isNaN(Number(nuevoPrecio))) {
      setMensaje('Por favor ingresá un precio válido')
      return
    }

    setCargando(true)
    const res = await fetch('/api/precios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, nuevoPrecio: parseFloat(nuevoPrecio) }),
    })

    if (res.ok) {
      setMensaje('✅ Precio actualizado correctamente')
      setNuevoPrecio('')
    } else {
      setMensaje('❌ Error al actualizar el precio')
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-[#3F4E4F] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#DCD7C9] p-8 rounded-2xl shadow-lg font-sans">
        <h1 className="text-2xl font-bold mb-4 text-[#2C3639] text-center">Actualizar Precio</h1>
        <label className="block text-sm font-medium mb-1 text-[#2C3639]">Nuevo precio</label>
        <input
          type="number"
          step="0.01"
          value={nuevoPrecio}
          onChange={(e) => setNuevoPrecio(e.target.value)}
          placeholder="Ej: 9500.00"
          className="w-full border border-[#A27B5B] rounded px-3 py-2 mb-4 text-[#2C3639]"
        />
        <button
          onClick={actualizarPrecio}
          disabled={cargando}
          className="w-full bg-[#A27B5B] text-white px-4 py-2 rounded font-semibold hover:bg-[#8e664e] disabled:opacity-50"
        >
          {cargando ? 'Guardando...' : 'Guardar nuevo precio'}
        </button>
        {mensaje && <p className="mt-4 text-center text-[#2C3639] text-sm">{mensaje}</p>}
      </div>
    </div>
  )
}
