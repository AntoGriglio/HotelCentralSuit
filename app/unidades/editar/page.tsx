/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function EditarUnidadHabitacionalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [tiposUnidad, setTiposUnidad] = useState<any[]>([])
  const [tiposHabitacion, setTiposHabitacion] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  const [form, setForm] = useState({
    tipoUnidadId: '', tipoHabitacionId: '',
    capacidadMax: '', capacidadMin: '',
    cantidadNormal: '', camasMatrimonial: '',
    camasIndividual: '', piso: '', numero: '',
    metrosCuadrados: '', balcon: false,
    cantidadBanos: '', cantidadHabitaciones: '',
    checkLimpieza: false, nombre: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/tipos-unidad').then(r => r.json()),
      fetch('/api/tipos-habitacion').then(r => r.json())
    ]).then(([tu, th]) => {
      setTiposUnidad(tu)
      setTiposHabitacion(th)
    })
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/unidades?id=${id}`)
      .then(res => res.json())
      .then(data => {
        const unidad = Array.isArray(data) ? data[0] : data
        if (!unidad) return
        setForm({
          tipoUnidadId: unidad.tipo_unidad_id ?? '',
          tipoHabitacionId: unidad.tipo_habitacion_id ?? '',
          capacidadMax: unidad.capacidad_maxima?.toString() ?? '',
          capacidadMin: unidad.capacidad_minima?.toString() ?? '',
          cantidadNormal: unidad.capacidad_normal?.toString() ?? '',
          camasMatrimonial: unidad.camas_matrimonial?.toString() ?? '',
          camasIndividual: unidad.camas_individual?.toString() ?? '',
          piso: unidad.piso?.toString() ?? '',
          numero: unidad.numero?.toString() ?? '',
          metrosCuadrados: unidad.metros_cuadrados?.toString() ?? '',
          balcon: unidad.balcon ?? false,
          cantidadBanos: unidad.cantidad_banios?.toString() ?? '',
          cantidadHabitaciones: unidad.cantidad_habitaciones?.toString() ?? '',
          checkLimpieza: unidad.estado_limpieza ?? false,
          nombre: unidad.nombre ?? '',
        })
        setLoaded(true)
      })
      .catch(console.error)
  }, [id])

  const esAlquilable = tiposUnidad.find(t => t.id === form.tipoUnidadId)?.descripcion === 'Alquilable'

  if (!id || !loaded) {
    return (
      <div className="p-6 text-center text-[#2C3639]">
        {!id ? 'Falta ID en URL' : 'Cargando datos de la unidad...'}
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/unidades', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...form })
    })
    router.push('/unidades')
  }

  return (
    <div className="min-h-screen bg-[#3F4E4F] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-[#DCD7C9] p-8 rounded-2xl shadow-lg font-sans">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#2C3639]">Editar Unidad Habitacional</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select name="tipoUnidadId" value={form.tipoUnidadId} onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" required>
            <option value="">Seleccionar tipo de unidad</option>
            {tiposUnidad.map(t => (
              <option key={t.id} value={t.id}>{t.descripcion}</option>
            ))}
          </select>

          <input name="piso" placeholder="Piso" value={form.piso} onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />

          {esAlquilable && (
            <>
              <input name="numero" placeholder="Número" value={form.numero} onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <select name="tipoHabitacionId" value={form.tipoHabitacionId} onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
                <option value="">Seleccionar tipo habitación</option>
                {tiposHabitacion.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
              <input name="capacidadMin" placeholder="Capacidad mínima" value={form.capacidadMin} onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="cantidadNormal" placeholder="Capacidad normal" value={form.cantidadNormal} onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="capacidadMax" placeholder="Capacidad máxima" value={form.capacidadMax} onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="camasMatrimonial" placeholder="Camas matrimoniales" value={form.camasMatrimonial} onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="camasIndividual" placeholder="Camas individuales" value={form.camasIndividual} onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="metrosCuadrados" placeholder="Metros cuadrados" value={form.metrosCuadrados} onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <label className="flex items-center gap-2 text-[#2C3639]">
                <input type="checkbox" name="balcon" checked={form.balcon} onChange={handleChange} />
                ¿Tiene balcón?
              </label>
              <input name="cantidadBanos" placeholder="Cantidad de baños" value={form.cantidadBanos} onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="cantidadHabitaciones" placeholder="Cantidad de habitaciones" value={form.cantidadHabitaciones} onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
            </>
          )}

          <button type="submit" className="w-full py-3 bg-[#A27B5B] text-white rounded-lg font-semibold hover:bg-[#8e664e]">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  )
}
