/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import jsPDF from 'jspdf'
// @ts-ignore
import autoTable from 'jspdf-autotable'

export default function TablaEgresos() {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [datos, setDatos] = useState<any[]>([])

  const generarReporte = async () => {
    if (!desde || !hasta) return alert('Seleccioná ambas fechas')

    const res = await fetch(`/api/reportes/egresos?desde=${desde}&hasta=${hasta}`)
    const json = await res.json()
    setDatos(json)
  }

  const descargarPDF = () => {
    const pdf = new jsPDF('l', 'pt', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()

    // Título y fechas
    pdf.setFontSize(18)
    pdf.text('Reporte de Egresos', pageWidth / 2, 40, { align: 'center' })
    pdf.setFontSize(12)
    pdf.text(`Desde: ${format(new Date(desde), 'dd/MM/yyyy')}   Hasta: ${format(new Date(hasta), 'dd/MM/yyyy')}`, pageWidth / 2, 60, { align: 'center' })

    const columns = [
      'Estadía', 'Cliente', 'Teléfono', 'Unidad', 'Tipo',
      'Ingreso', 'Egreso', 'Personal Limpieza'
    ]

    const rows = datos.map((item: any) => [
      item.nro_estadia,
      item.cliente_nombre,
      item.telefono,
      item.unidad_nombre,
      item.tipo_habitacion,
      format(new Date(item.fecha_ingreso), 'dd/MM/yyyy', { locale: es }),
      format(new Date(item.fecha_salida), 'dd/MM/yyyy', { locale: es }),
      item.personal_limpieza || ''
    ])

    autoTable(pdf, {
      startY: 80,
      head: [columns],
      body: rows,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [46, 204, 113], textColor: 255 },
      margin: { left: 40, right: 40 },
    })

    pdf.save(`reporte-egresos-${desde}_a_${hasta}.pdf`)
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Reporte de Egresos</h1>

      <div className="flex gap-4 items-end mb-6">
        <div>
          <label className="block text-sm mb-1">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <button onClick={generarReporte} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Generar reporte
        </button>
      </div>

      {datos.length > 0 && (
        <>
          <button
            onClick={descargarPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            Descargar PDF
          </button>

          <div className="overflow-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2">Estadía</th>
                  <th className="border px-2">Cliente</th>
                  <th className="border px-2">Teléfono</th>
                  <th className="border px-2">Unidad</th>
                  <th className="border px-2">Tipo</th>
                  <th className="border px-2">Ingreso</th>
                  <th className="border px-2">Egreso</th>
                  <th className="border px-2">Personal Limpieza</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="border px-2 text-center">{item.nro_estadia}</td>
                    <td className="border px-2">{item.cliente_nombre}</td>
                    <td className="border px-2">{item.telefono}</td>
                    <td className="border px-2">{item.unidad_nombre}</td>
                    <td className="border px-2">{item.tipo_habitacion}</td>
                    <td className="border px-2">{format(new Date(item.fecha_ingreso), 'dd/MM/yyyy', { locale: es })}</td>
                    <td className="border px-2">{format(new Date(item.fecha_salida), 'dd/MM/yyyy', { locale: es })}</td>
                    <td className="border px-2">{item.personal_limpieza}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
