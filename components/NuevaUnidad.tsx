/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CrearUnidadHabitacional() {
  const router = useRouter();

  const [tiposUnidad, setTiposUnidad] = useState<any[]>([]);
  const [tiposHabitacion, setTiposHabitacion] = useState<any[]>([]);
  const [form, setForm] = useState({
    tipoUnidadId: '',
    tipoHabitacionId: '',
    capacidadMax: '',
    capacidadMin: '',
    cantidadNormal: '',
    camasMatrimonial: '',
    camasIndividual: '',
    piso: '',
    numero: '',
    metrosCuadrados: '',
    balcon: false,
    cantidadBanos: '',
    cantidadHabitaciones: '',
    checkLimpieza: false,
    nombre: '',
  });

  useEffect(() => {
    fetch('/api/tipos-unidad')
      .then(res => res.json())
      .then(setTiposUnidad)
      .catch(console.error);
    fetch('/api/tipos-habitacion')
      .then(res => res.json())
      .then(setTiposHabitacion)
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? target.checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/unidades', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      alert('Unidad creada con éxito!');
      router.push('/unidades');
    } else {
      alert('Error al crear la unidad');
    }
  };

  const tipoSeleccionado = tiposUnidad.find(t => t.id === form.tipoUnidadId);
  const esAlquilable = tipoSeleccionado?.descripcion === 'Alquilable';

  return (
    <div className="min-h-screen bg-[#3F4E4F] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-[#DCD7C9] p-8 rounded-2xl shadow-lg font-sans">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#2C3639]">Crear Unidad Habitacional</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="tipoUnidadId"
            value={form.tipoUnidadId}
            onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
            required
          >
            <option value="">Seleccionar tipo de unidad</option>
            {tiposUnidad.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>{tipo.descripcion}</option>
            ))}
          </select>

          <input
            name="piso"
            placeholder="Piso"
            value={form.piso}
            onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          />
          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
          />

          {esAlquilable && (
            <>
              <input
                name="numero"
                placeholder="Número"
                value={form.numero}
                onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
                required
              />
              <select
                name="tipoHabitacionId"
                value={form.tipoHabitacionId}
                onChange={handleChange}
                className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]"
                required
              >
                <option value="">Seleccionar tipo habitacion</option>
                {tiposHabitacion.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
              <input name="capacidadMin" placeholder="Capacidad mínima" value={form.capacidadMin} onChange={handleChange} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="cantidadNormal" placeholder="Capacidad normal" value={form.cantidadNormal} onChange={handleChange} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="capacidadMax" placeholder="Capacidad máxima" value={form.capacidadMax} onChange={handleChange} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="camasMatrimonial" placeholder="Camas matrimoniales" value={form.camasMatrimonial} onChange={handleChange} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="camasIndividual" placeholder="Camas individuales" value={form.camasIndividual} onChange={handleChange} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="metrosCuadrados" placeholder="Metros cuadrados" value={form.metrosCuadrados} onChange={handleChange} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <label className="flex items-center gap-2 text-[#2C3639]">
                <input type="checkbox" name="balcon" checked={form.balcon} onChange={handleChange} />
                ¿Tiene balcón?
              </label>
              <input name="cantidadBanos" placeholder="Cantidad de baños" value={form.cantidadBanos} onChange={handleChange} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />
              <input name="cantidadHabitaciones" placeholder="Cantidad de habitaciones" value={form.cantidadHabitaciones} onChange={handleChange} className="w-full p-2 border border-[#A27B5B] rounded text-[#2C3639]" />

            </>
          )}

          <button type="submit" className="w-full py-3 bg-[#A27B5B] text-white rounded-lg font-semibold hover:bg-[#8e664e]">
            Crear Unidad
          </button>
        </form>
      </div>
    </div>
  );
}
