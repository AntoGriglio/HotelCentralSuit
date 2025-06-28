/* eslint-disable @typescript-eslint/no-explicit-any */
// ✅ Versión mejorada: Tabla con control por mes/trimestre y filtro por habitaciones alquilables
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';

export default function TablaDisponibilidad() {
  const [data, setData] = useState<any[]>([]);
  const [diasDelMes, setDiasDelMes] = useState<string[]>([]);
  const [fechaBase, setFechaBase] = useState<Date>(startOfMonth(new Date()));
  const [modoTrimestre, setModoTrimestre] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const fecha = format(fechaBase, 'yyyy-MM');
      try {
        const res = await axios.get(`/api/reportes?mes=${fecha}`);
        setData(res.data);

        const dias: string[] = [];
        const meses = modoTrimestre ? 3 : 1;
        const fin = addMonths(fechaBase, meses);

        for (let f = new Date(fechaBase); f < fin; f.setDate(f.getDate() + 1)) {
          dias.push(format(new Date(f), 'yyyy-MM-dd'));
        }
        setDiasDelMes(dias);
      } catch (err) {
        console.error('❌ Error cargando disponibilidad:', err);
      }
    };

    fetchData();
  }, [fechaBase, modoTrimestre]);

  return (
    <div className="overflow-x-auto text-sm">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setFechaBase(subMonths(fechaBase, modoTrimestre ? 3 : 1))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ◀️ Anterior
        </button>

        <div className="text-center">
          <p className="font-semibold">
            {modoTrimestre
              ? `${format(fechaBase, 'MMMM yyyy')} - ${format(addMonths(fechaBase, 2), 'MMMM yyyy')}`
              : format(fechaBase, 'MMMM yyyy')}
          </p>
          <button
            onClick={() => setModoTrimestre(!modoTrimestre)}
            className="text-xs text-blue-600 underline"
          >
            Ver por {modoTrimestre ? 'mes' : 'trimestre'}
          </button>
        </div>

        <button
          onClick={() => setFechaBase(addMonths(fechaBase, modoTrimestre ? 3 : 1))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Siguiente ▶️
        </button>
      </div>

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Día</th>
            {data.map(hab => (
              <th key={hab.habitacion_id} className="border px-2 py-1 text-xs">
                {hab.numero || hab.nombre || 'Hab'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {diasDelMes.map(dia => (
            <tr key={dia}>
              <td className="border px-2 py-1 font-semibold whitespace-nowrap">
                {format(new Date(dia), 'dd/MM')}
              </td>
              {data.map(hab => {
                const estado = hab.disponibilidad[dia];
                const color =
                  estado === 'reservado' ? 'bg-red-400' :
                  estado === 'pendiente' ? 'bg-yellow-300' :
                  'bg-green-300';
                return (
                  <td
                    key={hab.habitacion_id + dia}
                    className={`border px-2 py-1 text-center ${color}`}
                    title={estado}
                  ></td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
