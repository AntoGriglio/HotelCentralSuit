'use client';

import { useState } from 'react';

export default function HabitacionesPage() {
  const [form, setForm] = useState({
    capacidadMax: '',
    capacidadMin: '',
    camasMatrimonial: '',
    camasIndividual: '',
    piso: '',
    numero: '',
    metrosCuadrados: '',
    balcon: false,
    cantidadBanos: '',
    cantidadHabitaciones: '',
    checkLimpieza: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/habitaciones', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      alert('Habitación creada con éxito!');
      setForm({
        capacidadMax: '',
        capacidadMin: '',
        camasMatrimonial: '',
        camasIndividual: '',
        piso: '',
        numero: '',
        metrosCuadrados: '',
        balcon: false,
        cantidadBanos: '',
        cantidadHabitaciones: '',
        checkLimpieza: false,
      });
    } else {
      alert('Error al crear la habitación');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Crear Habitación</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input name="capacidadMax" placeholder="Capacidad máxima" value={form.capacidadMax} onChange={handleChange} />
        <input name="capacidadMin" placeholder="Capacidad mínima" value={form.capacidadMin} onChange={handleChange} />
        <input name="camasMatrimonial" placeholder="Camas matrimoniales" value={form.camasMatrimonial} onChange={handleChange} />
        <input name="camasIndividual" placeholder="Camas individuales" value={form.camasIndividual} onChange={handleChange} />
        <input name="piso" placeholder="Piso" value={form.piso} onChange={handleChange} />
        <input name="numero" placeholder="Número de habitación" value={form.numero} onChange={handleChange} />
        <input name="metrosCuadrados" placeholder="Metros cuadrados" value={form.metrosCuadrados} onChange={handleChange} />
        <label>
          <input type="checkbox" name="balcon" checked={form.balcon} onChange={handleChange} /> ¿Tiene balcón?
        </label>
        <input name="cantidadBanos" placeholder="Cantidad de baños" value={form.cantidadBanos} onChange={handleChange} />
        <input name="cantidadHabitaciones" placeholder="Cantidad de habitaciones" value={form.cantidadHabitaciones} onChange={handleChange} />
        <label>
          <input type="checkbox" name="checkLimpieza" checked={form.checkLimpieza} onChange={handleChange} /> Check de limpieza
        </label>
        <button type="submit">Crear</button>
      </form>
    </div>
  );
}
