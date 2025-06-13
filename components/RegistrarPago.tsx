/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegistrarPago() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const estadiaIdFromUrl = searchParams.get('estadia_id')

  const [estadias, setEstadias] = useState<any[]>([])
  const [tiposPago, setTiposPago] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')

  const [pago, setPago] = useState({
    estadiaId: '',
    tipoPagoId: '',
    monto: '',
    comprobantePago: '',
    fechaPago: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    const fetchData = async () => {
      const resEstadias = await fetch('/api/estadias')
      const dataEstadias = await resEstadias.json()
      setEstadias(dataEstadias)

      const resTipos = await fetch('/api/tipos-pago')
      const dataTipos = await resTipos.json()
      setTiposPago(dataTipos)

      if (estadiaIdFromUrl) {
        setPago(prev => ({ ...prev, estadiaId: estadiaIdFromUrl }))
      }
    }

    fetchData()
  }, [estadiaIdFromUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estadia_id: pago.estadiaId,
        tipo_pago_id: pago.tipoPagoId,
        monto: parseFloat(pago.monto),
        comprobante_pago: pago.comprobantePago,
        fecha_pago: new Date(pago.fechaPago),
      }),
    })

    if (res.ok) {
      setMensaje('Pago registrado con éxito')
      router.push('/dashboard')
    } else {
      const error = await res.json()
      setMensaje(error.error || 'Error al registrar el pago')
    }
  }

  return (
    <div className="min-h-screen bg-[#3F4E4F] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-[#DCD7C9] p-8 rounded-2xl shadow-lg font-sans">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#2C3639]">Registrar Pago</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-[#2C3639]">Estadía</label>
            <select
              value={pago.estadiaId}
              onChange={(e) => setPago({ ...pago, estadiaId: e.target.value })}
              required
              className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
            >
              <option value="">Seleccione una estadía</option>
              {estadias.map((e: any) => (
                <option key={e.id} value={e.id}>
                  #{e.nro_estadia || e.id} - {e.cliente_dni}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#2C3639]">Tipo de pago</label>
            <select
              value={pago.tipoPagoId}
              onChange={(e) => setPago({ ...pago, tipoPagoId: e.target.value })}
              required
              className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
            >
              <option value="">Seleccione tipo de pago</option>
              {tiposPago.map((t: any) => (
                <option key={t.id} value={t.id}>{t.descripcion}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#2C3639]">Monto</label>
            <input
              type="number"
              step="0.01"
              value={pago.monto}
              onChange={(e) => setPago({ ...pago, monto: e.target.value })}
              required
              className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#2C3639]">Comprobante</label>
            <input
              type="text"
              value={pago.comprobantePago}
              onChange={(e) => setPago({ ...pago, comprobantePago: e.target.value })}
              className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#2C3639]">Fecha de pago</label>
            <input
              type="date"
              value={pago.fechaPago}
              onChange={(e) => setPago({ ...pago, fechaPago: e.target.value })}
              required
              className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#A27B5B] text-white rounded-lg font-semibold hover:bg-[#8e664e]"
          >
            Registrar Pago
          </button>
        </form>

        {mensaje && (
          <p className="mt-4 text-center text-green-700">{mensaje}</p>
        )}
      </div>
    </div>
  )
}
