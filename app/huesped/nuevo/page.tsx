/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

interface Huesped {
  id: string
  nombre_completo: string
  dni: string
  fecha_nacimiento: string
  sexo: string
  foto_cara: File | null
  foto_dni_frente: File | null
  foto_dni_dorso: File | null
}

export default function RegistrarHuespedesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const estadiaId = searchParams.get('estadia_id')
  const [cantidad, setCantidad] = useState(0)
  const [huespedes, setHuespedes] = useState<Huesped[]>([])
  const [tab, setTab] = useState(0)

  useEffect(() => {
    if (!estadiaId) return

    // Traer cantidad de personas de la estadía
    fetch(`/api/estadias?id=${estadiaId}`)
      .then(res => res.json())
      .then(data => {
        const estadia = Array.isArray(data) ? data[0] : data
        const cant = estadia?.cantidad_personas ?? 1
        setCantidad(cant)
        setHuespedes(
          Array.from({ length: cant }, (_) => ({
            id: uuidv4(),
            nombre_completo: '',
            dni: '',
            fecha_nacimiento: '',
            sexo: '',
            foto_cara: null,
            foto_dni_frente: null,
            foto_dni_dorso: null,
          }))
        )
      })
  }, [estadiaId])

  const handleInput = (i: number, field: keyof Huesped, value: any) => {
    setHuespedes(prev => {
      const copy = [...prev]
      copy[i] = { ...copy[i], [field]: value }
      return copy
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('estadia_id', estadiaId ?? '');

  const subirArchivo = async (file: File, nombre: string) => {
    const nombreArchivo = `huespedes/${nombre}-${Date.now()}-${uuidv4()}.jpg`;

    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(nombreArchivo, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error || !data) {
      console.error('❌ Error al subir archivo:', error);
      throw new Error('Error al subir archivo');
    }

    const { data: urlData } = supabase
      .storage
      .from('documentos')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  for (let i = 0; i < huespedes.length; i++) {
    const h = huespedes[i];
    let urlCara = '', urlFrente = '', urlDorso = '';

    try {
      if (h.foto_cara) urlCara = await subirArchivo(h.foto_cara, `cara_${h.dni}`);
      if (h.foto_dni_frente) urlFrente = await subirArchivo(h.foto_dni_frente, `frente_${h.dni}`);
      if (h.foto_dni_dorso) urlDorso = await subirArchivo(h.foto_dni_dorso, `dorso_${h.dni}`);
    } catch (err) {
      alert(`Error al subir imágenes del huésped ${i + 1}.`);
      return;
    }

    formData.append(`nombre_completo_${i}`, h.nombre_completo);
    formData.append(`dni_${i}`, h.dni);
    formData.append(`fecha_nacimiento_${i}`, h.fecha_nacimiento);
    formData.append(`sexo_${i}`, h.sexo);
    formData.append(`imagen_cara_${i}`, urlCara);
    formData.append(`imagen_dni_frente_${i}`, urlFrente);
    formData.append(`imagen_dni_dorso_${i}`, urlDorso);
  }

  const res = await fetch('/api/huespedes', {
    method: 'POST',
    body: formData
  });

  if (res.ok) {
    router.push('/estadias');
  } else {
    alert('Error al guardar los huéspedes');
  }
};


  if (!estadiaId || huespedes.length === 0) {
    return <div className="p-4">Cargando formulario...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#F3EFE0] rounded-xl shadow">
      <h2 className="text-2xl font-semibold text-center mb-6">Registrar Huéspedes</h2>

      <div className="flex mb-4 gap-2 justify-center">
        {huespedes.map((_, i) => (
          <button
            key={i}
            className={`px-4 py-1 rounded-full text-sm font-medium ${tab === i ? 'bg-[#A27B5B] text-black' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setTab(i)}
          >
            Huésped {i + 1}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {huespedes.map((h, i) => (
          tab === i && (
            <div key={h.id} className="space-y-4">
              <input placeholder="Nombre completo" className="w-full p-2 border rounded"
                value={h.nombre_completo} onChange={(e) => handleInput(i, 'nombre_completo', e.target.value)} />
              <input placeholder="DNI" className="w-full p-2 border rounded"
                value={h.dni} onChange={(e) => handleInput(i, 'dni', e.target.value)} />
              <input type="date" className="w-full p-2 border rounded"
                value={h.fecha_nacimiento} onChange={(e) => handleInput(i, 'fecha_nacimiento', e.target.value)} />
              <select className="w-full p-2 border rounded" value={h.sexo} onChange={(e) => handleInput(i, 'sexo', e.target.value)}>
                <option value="">Sexo</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="X">Otro</option>
              </select>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm">Foto de cara</label>
                  <input type="file" accept="image/*" onChange={(e) => handleInput(i, 'foto_cara', e.target.files?.[0] || null)} />
                </div>
                <div>
                  <label className="text-sm">DNI frente</label>
                  <input type="file" accept="image/*" onChange={(e) => handleInput(i, 'foto_dni_frente', e.target.files?.[0] || null)} />
                </div>
                <div>
                  <label className="text-sm">DNI dorso</label>
                  <input type="file" accept="image/*" onChange={(e) => handleInput(i, 'foto_dni_dorso', e.target.files?.[0] || null)} />
                </div>
              </div>
            </div>
          )
        ))}

        <button type="submit" className="w-full mt-6 bg-[#3F4E4F] text-white py-3 rounded-md hover:bg-[#2C3639]">
          Guardar huéspedes
        </button>
      </form>
    </div>
  )
}
