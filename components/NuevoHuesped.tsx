/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import Loader from './loader'

interface Huesped {
  id: string
  nombre_completo: string
  dni: string
  fecha_nacimiento: string
  sexo: string
  foto_dni_frente: File | null
  foto_dni_dorso: File | null
}

export default function RegistrarHuespedesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const estadiaId = searchParams.get('estadia_id')
  const supabase = createPagesBrowserClient()

  const [cantidad, setCantidad] = useState(0)
  const [huespedes, setHuespedes] = useState<Huesped[]>([])
  const [tab, setTab] = useState(0)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!estadiaId) return

    fetch(`/api/estadias?id=${estadiaId}`)
      .then(res => res.json())
      .then(async data => {
        const estadia = Array.isArray(data) ? data[0] : data
        const cant = estadia?.cantidad_personas ?? 1
        setCantidad(cant)

        let primerHuesped: Huesped = {
          id: uuidv4(),
          nombre_completo: '',
          dni: '',
          fecha_nacimiento: '',
          sexo: '',
          foto_dni_frente: null,
          foto_dni_dorso: null,
        }

        if (estadia?.cliente_dni) {
          const clienteRes = await fetch(`/api/clientes?dni=${estadia.cliente_dni}`)
          const cliente = await clienteRes.json()
          primerHuesped.nombre_completo = cliente?.nombre_completo ?? ''
          primerHuesped.dni = cliente?.dni ?? ''
        }

        const restantes = Array.from({ length: cant - 1 }, () => ({
          id: uuidv4(),
          nombre_completo: '',
          dni: '',
          fecha_nacimiento: '',
          sexo: '',
          foto_dni_frente: null,
          foto_dni_dorso: null,
        }))
setCargando(false)
        setHuespedes([primerHuesped, ...restantes])
      })
  }, [estadiaId])

  const handleInput = (index: number, field: keyof Huesped, value: any) => {
    setHuespedes(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const todosCompletos = huespedes.every(
    (h) =>
      h.nombre_completo &&
      h.dni &&
      h.fecha_nacimiento &&
      h.sexo
  )

  const subirArchivo = async (file: File, nombre: string) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      alert('Debés iniciar sesión para subir archivos.')
      throw new Error('Sesión no iniciada')
    }

    const nombreArchivo = `huespedes/${nombre}-${Date.now()}-${uuidv4()}.jpg`

    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(nombreArchivo, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error || !data) {
      console.error('❌ Error al subir archivo:', error)
      throw new Error('Error al subir archivo')
    }

    const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(data.path)
    return urlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    const formData = new FormData()
    formData.append('estadia_id', estadiaId ?? '')

    for (let i = 0; i < huespedes.length; i++) {
      const h = huespedes[i]
      let urlFrente = ''
      let urlDorso = ''

      try {
        if (h.foto_dni_frente)
          urlFrente = await subirArchivo(h.foto_dni_frente, `frente_${h.dni}`)
        if (h.foto_dni_dorso)
          urlDorso = await subirArchivo(h.foto_dni_dorso, `dorso_${h.dni}`)
      } catch (err) {
        alert(`Error al subir imágenes del huésped ${i + 1}.`)
        setCargando(false)
        return
      }

      formData.append(`nombre_completo_${i}`, h.nombre_completo)
      formData.append(`dni_${i}`, h.dni)
      formData.append(`fecha_nacimiento_${i}`, h.fecha_nacimiento)
      formData.append(`sexo_${i}`, h.sexo)
      formData.append(`imagen_dni_frente_${i}`, urlFrente)
      formData.append(`imagen_dni_dorso_${i}`, urlDorso)
    }

    const res = await fetch('/api/huespedes', {
      method: 'POST',
      body: formData,
    })



    if (res.ok) {
     
      router.push('/estadias')
           setCargando(false)
    } else {
      alert('Error al guardar los huéspedes')
    }
  }

 if (!estadiaId || huespedes.length === 0) {
  return <div className="p-4"><Loader /></div>
}

return (
  <div className="relative">
    {cargando && <Loader />}

    <div className="max-w-4xl mx-auto p-6 bg-[#F3EFE0] rounded-xl shadow text-black relative z-10">
      <h2 className="text-2xl font-semibold text-center mb-6">Registrar Huéspedes</h2>

      {/* Tabs */}
      <div className="flex mb-4 gap-2 justify-center">
        {huespedes.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              tab === i ? 'bg-[#A27B5B] text-black' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setTab(i)}
          >
            Huésped {i + 1}
          </button>
        ))}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {huespedes.map((h, i) => (
          <div
            key={h.id}
            className={`space-y-4 ${tab === i ? 'block' : 'hidden'}`}
          >
            <input
              placeholder="Nombre completo"
              className="w-full p-2 border rounded"
              value={h.nombre_completo}
              onChange={(e) => handleInput(i, 'nombre_completo', e.target.value)}
            />
            <input
              placeholder="DNI"
              className="w-full p-2 border rounded"
              value={h.dni}
              onChange={(e) => handleInput(i, 'dni', e.target.value)}
            />
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={h.fecha_nacimiento}
              onChange={(e) => handleInput(i, 'fecha_nacimiento', e.target.value)}
            />
            <select
              className="w-full p-2 border rounded"
              value={h.sexo}
              onChange={(e) => handleInput(i, 'sexo', e.target.value)}
            >
              <option value="">Sexo</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
              <option value="X">Otro</option>
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">DNI frente (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInput(i, 'foto_dni_frente', e.target.files?.[0] || null)}
                />
                {h.foto_dni_frente && (
                  <p className="text-xs text-green-700 mt-1">
                    Archivo cargado: {h.foto_dni_frente.name}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm">DNI dorso (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInput(i, 'foto_dni_dorso', e.target.files?.[0] || null)}
                />
                {h.foto_dni_dorso && (
                  <p className="text-xs text-green-700 mt-1">
                    Archivo cargado: {h.foto_dni_dorso.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={!todosCompletos || cargando}
          className={`w-full mt-6 py-3 rounded-md text-white ${
            todosCompletos && !cargando
              ? 'bg-[#3F4E4F] hover:bg-[#2C3639]'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {cargando ? 'Guardando...' : 'Guardar huéspedes'}
        </button>
      </form>
    </div>
  </div>
)

}