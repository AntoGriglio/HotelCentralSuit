/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatearMoneda } from '@/lib/formato';
import React from 'react';

export default function ListaUnidadesHabitacionales() {
  const [alquilables, setAlquilables] = useState<any[]>([]);
  const [ocupacionales, setOcupacionales] = useState<any[]>([]);
  const [vista, setVista] = useState<'alquilable' | 'ocupacional'>('alquilable');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalInfoBloqueo, setModalInfoBloqueo] = useState(false);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<any>(null);
  const [bloqueoId, setBloqueoId] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tipo, setTipo] = useState('Por grupos');
  const router = useRouter();

  useEffect(() => {
    const fetchUnidades = async () => {
      const res = await fetch('/api/unidades?conBloqueos=true');
      const data = await res.json();
      const alquilablesOrdenados = data
        .filter((u: any) => u.tipo === 'Alquilable')
        .sort((a: any, b: any) => a.numero - b.numero);
      setAlquilables(alquilablesOrdenados);
      setOcupacionales(data.filter((u: any) => u.tipo === 'Uso comun'));
    };
    fetchUnidades();
  }, []);

  const guardarBloqueo = async () => {
    if (!unidadSeleccionada) return;

    const method = modalInfoBloqueo && bloqueoId ? 'PUT' : 'POST';
    const payload = {
      unidadId: unidadSeleccionada.id,
      tipo,
      descripcion,
      fechaDesde: desde,
      fechaHasta: hasta,
      ...(bloqueoId ? { id: bloqueoId } : {})
    };

    const res = await fetch('/api/bloqueos', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert('Bloqueo guardado con éxito');
      cerrarModal();
    } else {
      alert('Error al guardar el bloqueo');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalInfoBloqueo(false);
    setUnidadSeleccionada(null);
    setBloqueoId(null);
    setTipo('Por grupos');
    setDescripcion('');
    setDesde('');
    setHasta('');
  };

  return (
    <div className="p-6 text-[#2C3639] bg-white">
      <h1 className="text-3xl font-bold mb-6">Unidades Habitacionales</h1>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setVista('alquilable')} className={`px-4 py-2 rounded font-semibold ${vista === 'alquilable' ? 'bg-[#A27B5B] text-white' : 'bg-[#DCD7C9] text-[#2C3639]'}`}>
          Alquilables
        </button>
        <button onClick={() => setVista('ocupacional')} className={`px-4 py-2 rounded font-semibold ${vista === 'ocupacional' ? 'bg-[#A27B5B] text-white' : 'bg-[#DCD7C9] text-[#2C3639]'}`}>
          Uso Común
        </button>
      </div>

      {vista === 'alquilable' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#DCD7C9] text-[#2C3639]">
              <tr>
                <th className="px-4 py-2">Número</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Piso</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alquilables.map((u) => (
                <tr key={u.id} className={`border-b ${u.bloqueada ? 'bg-red-100 text-red-700' : 'hover:bg-[#F5F5F5]'}`}>
                  <td className="px-4 py-2">
                    {u.numero}
                    {u.bloqueada && (
                      <button
                        onClick={async () => {
                          setUnidadSeleccionada(u);
                          try {
                            const res = await fetch(`/api/bloqueos?unidadId=${u.id}`);
                            const bloqueos = await res.json();
                            const bloqueo = bloqueos[0];

                            if (bloqueo) {
                              setBloqueoId(bloqueo.id);
                              setTipo(bloqueo.tipo || 'Por grupos');
                              setDescripcion(bloqueo.descripcion || '');
                              setDesde(bloqueo.fecha_desde?.slice(0, 10) || '');
                              setHasta(bloqueo.fecha_hasta?.slice(0, 10) || '');
                              setModalInfoBloqueo(true);
                            } else {
                              alert('No hay bloqueos activos para esta unidad.');
                            }
                          } catch (err) {
                            console.error('Error al obtener bloqueo:', err);
                            alert('Error al obtener datos de bloqueo.');
                          }
                        }}
                        className="ml-2 text-xs text-blue-600 underline"
                      >
                        Ver bloqueo
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2">{u.nombre}</td>
                  <td className="px-4 py-2">{u.piso}</td>
                  <td className="px-4 py-2">{u.tipo_habitacion || '-'}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => router.push(`/unidades/editar?id=${u.id}`)} className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setUnidadSeleccionada(u);
                        setTipo('Por grupos');
                        setDescripcion('');
                        setDesde('');
                        setHasta('');
                        setBloqueoId(null);
                        setModalAbierto(true);
                      }}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded ml-2 hover:bg-red-600"
                    >
                      Bloquear
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modalAbierto || modalInfoBloqueo) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {modalInfoBloqueo ? 'Editar bloqueo' : `Bloquear unidad ${unidadSeleccionada?.nombre}`}
            </h2>

            <label className="block mb-2 text-sm font-semibold">Tipo</label>
            <select className="w-full border rounded p-2 mb-4" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="Por grupos">Por grupos</option>
              <option value="Por reparación">Por reparación</option>
              <option value="Otros">Otros</option>
            </select>

            <label className="block mb-2 text-sm font-semibold">Descripción</label>
            <textarea className="w-full border rounded p-2 mb-4" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold">Desde</label>
                <input type="date" className="w-full border rounded p-2" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold">Hasta</label>
                <input type="date" className="w-full border rounded p-2" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={cerrarModal} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                Cancelar
              </button>
              <button onClick={guardarBloqueo} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}