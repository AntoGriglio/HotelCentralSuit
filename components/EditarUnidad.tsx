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
                      <button
  type="button"
  onClick={() => router.back()}
  className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
>
  ← Atrás
</button>
        <h1 className="text-2xl font-bold mb-6 text-center text-[#2C3639]">Editar Unidad Habitacional</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-[#2C3639] mb-1">Tipo Unidad</label>
          <select name="tipoUnidadId" value={form.tipoUnidadId} onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" required>
            <option value="">Seleccionar tipo de unidad</option>
            {tiposUnidad.map(t => (
              <option key={t.id} value={t.id}>{t.descripcion}</option>
            ))}
          </select>
<label className="block text-[#2C3639] mb-1">Piso</label>
          <input name="piso" placeholder="Piso" value={form.piso} onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
            <label className="block text-[#2C3639] mb-1">Nombre</label>
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />

          {esAlquilable && (
            <>
              <>
  <div>
    <label className="block text-[#2C3639] mb-1">Número</label>
    <input name="numero" value={form.numero} onChange={handleChange}
      className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
  </div>

  <div>
    <label className="block text-[#2C3639] mb-1">Tipo de habitación</label>
    <select name="tipoHabitacionId" value={form.tipoHabitacionId} onChange={handleChange}
      className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]">
      <option value="">Seleccionar tipo habitación</option>
      {tiposHabitacion.map((tipo) => (
        <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="block text-[#2C3639] mb-1">Capacidad mínima</label>
    <input name="capacidadMin" value={form.capacidadMin} onChange={handleChange}
      className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
  </div>

  <div>
    <label className="block text-[#2C3639] mb-1">Capacidad normal</label>
    <input name="cantidadNormal" value={form.cantidadNormal} onChange={handleChange}
      className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
  </div>

  <div>
    <label className="block text-[#2C3639] mb-1">Capacidad máxima</label>
    <input name="capacidadMax" value={form.capacidadMax} onChange={handleChange}
      className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
  </div>

  <div>
    <label className="block text-[#2C3639] mb-1">Camas matrimoniales</label>
    <input name="camasMatrimonial" value={form.camasMatrimonial} onChange={handleChange}
      className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
  </div>

  <div>
    <label className="block text-[#2C3639] mb-1">Camas individuales</label>
    <input name="camasIndividual" value={form.camasIndividual} onChange={handleChange}
      className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
  </div>

  <div>
    <label className="block text-[#2C3639] mb-1">Metros cuadrados</label>
    <input name="metrosCuadrados" value={form.metrosCuadrados} onChange={handleChange}
      className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
  </div>

  <div className="flex items-center gap-2 text-[#2C3639]">
    <input type="checkbox" name="balcon" checked={form.balcon} onChange={handleChange} />
    <label className="select-none">¿Tiene balcón?</label>
  </div>

  <div>
    <label className="block text-[#2C3639] mb-1">Cantidad de baños</label>
    <input name="cantidadBanos" value={form.cantidadBanos} onChange={handleChange}
      className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
  </div>

  <div>
    <label className="block text-[#2C3639] mb-1">Cantidad de habitaciones</label>
    <input name="cantidadHabitaciones" value={form.cantidadHabitaciones} onChange={handleChange}
      className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
  </div>
</>

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
