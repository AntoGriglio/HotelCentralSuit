/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistrarEstadia() {
  const router = useRouter();

  const [dni, setDni] = useState('');
  const [cliente, setCliente] = useState<any>(null);
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [canales, setCanales] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);

  const [estadia, setEstadia] = useState({
    cantidadPersonas: '',
    fechaIngreso: '',
    fechaEgreso: '',
    cochera: false,
    desayuno: false,
    almuerzo: false,
    cena: false,
    ropaBlanca: false,
    precioPorNoche: '',
    porcentajeReserva: '',
    montoReserva: '',
    total: '',
    estado: '',
    habitacionId: '',
    observaciones: '',
    canalId: '',
    estadoId: '',
  });

  useEffect(() => {
    fetch('/api/habitaciones')
      .then((res) => res.json())
      .then(setHabitaciones)
      .catch(console.error);

    fetch('/api/canales')
      .then((res) => res.json())
      .then(setCanales)
      .catch(console.error);

    fetch('/api/estados')
      .then((res) => res.json())
      .then(setEstados)
      .catch(console.error);
  }, []);

  const buscarCliente = async () => {
    try {
      const res = await fetch(`/api/clientes/${dni}`);
      if (res.ok) {
        const data = await res.json();
        setCliente(data);
        setMensaje('');
      } else {
        setCliente(null);
        setMensaje('Cliente no encontrado. Redirigiendo...');
        setTimeout(() => {
          router.push('/clientes');
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const estadoSeleccionado = estados.find((e) => e.id === estadia.estadoId);

    if (estadoSeleccionado?.nombre !== 'sin confirmar' && !cliente) {
      setMensaje('Debes asignar un cliente si el estado no es "sin confirmar".');
      return;
    }

    const dataToSend = {
      cliente_dni: cliente?.dni || null,
      cantidad_personas: parseInt(estadia.cantidadPersonas),
      fecha_ingreso: estadia.fechaIngreso,
      fecha_egreso: estadia.fechaEgreso,
      cochera: estadia.cochera,
      desayuno: estadia.desayuno,
      almuerzo: estadia.almuerzo,
      cena: estadia.cena,
      ropa_blanca: estadia.ropaBlanca,
      precio_por_noche: parseFloat(estadia.precioPorNoche),
      porcentaje_reserva: parseFloat(estadia.porcentajeReserva),
      monto_reserva: parseFloat(estadia.montoReserva),
      total: parseFloat(estadia.total),
      habitacion_id: estadia.habitacionId,
      observaciones: estadia.observaciones,
      canal_id: estadia.canalId,
      estado_id: estadia.estadoId,
    };
    
    const res = await fetch('/api/estadias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    });

    if (res.ok) {
      setMensaje('Estadía registrada con éxito');
      router.push('/dashboard');
    } else {
      const error = await res.json();
      setMensaje(error.error || 'Error al registrar estadía');
    }
  };

  const estadoSeleccionado = estados.find((e) => e.id === estadia.estadoId);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Registrar Estadía</h1>

      {estadoSeleccionado?.nombre !== 'sin confirmar' && (
        <div>
          <input
            type="text"
            placeholder="DNI del cliente"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
          <button onClick={buscarCliente}>Buscar Cliente</button>
        </div>
      )}

      {cliente && estadoSeleccionado?.nombre !== 'sin confirmar' && (
        <p>Cliente: {cliente.nombre_completo} ({cliente.email})</p>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <select value={estadia.habitacionId} onChange={(e) => setEstadia({ ...estadia, habitacionId: e.target.value })} required>
          <option value="">Seleccionar habitación</option>
          {habitaciones.map((h) => (
            <option key={h.id} value={h.id}>{h.numero} - Piso {h.piso} - Capacidad {h.capacidad_max}</option>
          ))}
        </select>

        <select value={estadia.canalId} onChange={(e) => setEstadia({ ...estadia, canalId: e.target.value })} required>
          <option value="">Seleccionar canal de comercialización</option>
          {canales.map((canal) => (
            <option key={canal.id} value={canal.id}>{canal.descripcion}</option>
          ))}
        </select>

        <input type="number" placeholder="Cantidad de personas" value={estadia.cantidadPersonas} onChange={(e) => setEstadia({ ...estadia, cantidadPersonas: e.target.value })} />
        <input type="date" value={estadia.fechaIngreso} onChange={(e) => setEstadia({ ...estadia, fechaIngreso: e.target.value })} />
        <input type="date" value={estadia.fechaEgreso} onChange={(e) => setEstadia({ ...estadia, fechaEgreso: e.target.value })} />
        <input type="number" placeholder="Precio por noche" value={estadia.precioPorNoche} onChange={(e) => setEstadia({ ...estadia, precioPorNoche: e.target.value })} />
        <input type="number" placeholder="Porcentaje de reserva" value={estadia.porcentajeReserva} onChange={(e) => setEstadia({ ...estadia, porcentajeReserva: e.target.value })} />
        <input type="number" placeholder="Monto de reserva" value={estadia.montoReserva} onChange={(e) => setEstadia({ ...estadia, montoReserva: e.target.value })} />
        <input type="number" placeholder="Total" value={estadia.total} onChange={(e) => setEstadia({ ...estadia, total: e.target.value })} />

        <select value={estadia.estadoId} onChange={(e) => setEstadia({ ...estadia, estadoId: e.target.value })} required>
          <option value="">Seleccionar estado</option>
          {estados.map((estado) => (
            <option key={estado.id} value={estado.id}>{estado.nombre}</option>
          ))}
        </select>

        <label><input type="checkbox" checked={estadia.cochera} onChange={(e) => setEstadia({ ...estadia, cochera: e.target.checked })} /> Cochera</label>
        <label><input type="checkbox" checked={estadia.desayuno} onChange={(e) => setEstadia({ ...estadia, desayuno: e.target.checked })} /> Desayuno</label>
        <label><input type="checkbox" checked={estadia.almuerzo} onChange={(e) => setEstadia({ ...estadia, almuerzo: e.target.checked })} /> Almuerzo</label>
        <label><input type="checkbox" checked={estadia.cena} onChange={(e) => setEstadia({ ...estadia, cena: e.target.checked })} /> Cena</label>
        <label><input type="checkbox" checked={estadia.ropaBlanca} onChange={(e) => setEstadia({ ...estadia, ropaBlanca: e.target.checked })} /> Ropa Blanca</label>

        <textarea placeholder="Observaciones" value={estadia.observaciones} onChange={(e) => setEstadia({ ...estadia, observaciones: e.target.value })}></textarea>
        <button type="submit">Registrar Estadía</button>
      </form>

      {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
    </div>
  );
}
