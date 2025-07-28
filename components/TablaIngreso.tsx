/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
// @ts-ignore
import autoTable from 'jspdf-autotable'

export default function TablaIngresos() {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [datos, setDatos] = useState<any[]>([])

  const generarReporte = async () => {
    if (!desde || !hasta) return alert('Seleccioná ambas fechas')

    const res = await fetch(`/api/reportes/ingresos?desde=${desde}&hasta=${hasta}`)
    const json = await res.json()
    setDatos(json)
  }

  const formatearFecha = (fecha: string) => {
    const fechaLocal = new Date(`${fecha}T12:00:00`)
    return fechaLocal.toLocaleDateString('es-AR')
  }

  const descargarPDF = () => {
    const pdf = new jsPDF('l', 'pt', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()

    // Título
    pdf.setFontSize(18)
    pdf.text('Reporte de Ingresos', pageWidth / 2, 40, { align: 'center' })
    pdf.setFontSize(12)
    pdf.text(`Desde: ${formatearFecha(desde)}   Hasta: ${formatearFecha(hasta)}`, pageWidth / 2, 60, { align: 'center' })

    const columns = [
      'N° Unidad', 'Tipo Unidad', 'N° Estadia', 'Cliente', 'Teléfono', 'Canal',
      'Ingreso', 'Egreso', 'Noches', 'Personas',
      'Precio/Noche', 'Total', 'Pagado', 'Saldo', 'Observaciones'
    ]

    const rows = datos.map(item => {
      const noches = Math.max(1, Math.floor((new Date(item.fecha_egreso).getTime() - new Date(item.fecha_ingreso).getTime()) / (1000 * 60 * 60 * 24)))
      const saldo = (item.total_estadia || 0) - (item.pagado || 0)
      return [
        item.numero_unidad,
        item.tipo_unidad,
        item.numero_reserva,
        item.cliente,
        item.telefono,
        item.canal,
        formatearFecha(item.fecha_ingreso),
        formatearFecha(item.fecha_egreso),
        noches,
        item.cantidad_personas,
        `$${item.precio_por_noche?.toFixed(2)}`,
        `$${item.total_estadia?.toFixed(2)}`,
        `$${item.pagado?.toFixed(2)}`,
        `$${saldo.toFixed(2)}`,
        item.observaciones || ''
      ]
    })

    autoTable(pdf, {
      startY: 80,
      head: [columns],
      body: rows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { left: 40, right: 40 },
    })

    pdf.save(`reporte-ingresos-${desde}_a_${hasta}.pdf`)
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Reporte de Ingresos</h1>

      <div className="flex gap-4 items-end mb-6">
        <div>
          <label className="block text-sm mb-1">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <button onClick={generarReporte} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Generar reporte
        </button>
      </div>

      {datos.length > 0 && (
        <>
          <button
            onClick={descargarPDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
          >
            Descargar PDF
          </button>

          <div className="overflow-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2">N° Unidad</th>
                  <th className="border px-2">Tipo Unidad</th>
                  <th className="border px-2">N° Estadia</th>
                  <th className="border px-2">Cliente</th>
                  <th className="border px-2">Telefono</th>
                  <th className="border px-2">Canal</th>
                  <th className="border px-2">Fecha Ingreso</th>
                  <th className="border px-2">Fecha Egreso</th>
                  <th className="border px-2">Cant de noches</th>
                  <th className="border px-2">Cant personas</th>
                  <th className="border px-2">Precio por noche </th>
                  <th className="border px-2">Total Estadia</th>
                  <th className="border px-2">Pagado</th>
                  <th className="border px-2">Saldo</th>
                  <th className="border px-2">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((item, i) => {
                  const noches = Math.max(1, Math.floor((new Date(item.fecha_egreso).getTime() - new Date(item.fecha_ingreso).getTime()) / (1000 * 60 * 60 * 24)))
                  const saldo = (item.total_estadia || 0) - (item.pagado || 0)
                  return (
                    <tr key={i} className="border-t">
                      <td className="border px-2 text-center">{item.numero_unidad}</td>
                      <td className="border px-2">{item.tipo_unidad}</td>
                      <td className="border px-2">{item.numero_reserva}</td>
                      <td className="border px-2">{item.cliente}</td>
                      <td className="border px-2">{item.telefono}</td>
                      <td className="border px-2">{item.canal}</td>
                      <td className="border px-2">{formatearFecha(item.fecha_ingreso)}</td>
                      <td className="border px-2">{formatearFecha(item.fecha_egreso)}</td>
                      <td className="border px-2">{noches}</td>
                      <td className="border px-2">{item.cantidad_personas}</td>
                      <td className="border px-2 text-right">${item.precio_por_noche?.toFixed(2)}</td>
                      <td className="border px-2 text-right">${item.total_estadia?.toFixed(2)}</td>
                      <td className="border px-2 text-right">${item.pagado?.toFixed(2)}</td>
                      <td className="border px-2 text-right">${saldo.toFixed(2)}</td>
                      <td className="border px-2">{item.observaciones}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
