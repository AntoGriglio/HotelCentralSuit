'use client';

import { useState } from 'react';

export default function ClientesPage() {
  const [form, setForm] = useState({
    dni: '',
    email: '',
    nombre_completo: '',
    telefono: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/clientes', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      alert('Cliente registrado con éxito!');
      setForm({
        dni: '',
        email: '',
        nombre_completo: '',
        telefono: '',
      });
    } else {
      alert('Error al registrar cliente');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Registrar Cliente</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input name="dni" placeholder="DNI" value={form.dni} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="nombre_completo" placeholder="Nombre completo" value={form.nombre_completo} onChange={handleChange} />
        <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}
