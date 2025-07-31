/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function ReporteCobranzas() {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [detalles, setDetalles] = useState<any[]>([])
  const [totales, setTotales] = useState<any[]>([])

  const obtenerReporte = async () => {
    if (!desde || !hasta) return alert('Seleccioná ambas fechas')

    const res = await fetch(`/api/reportes/pagos?desde=${desde}&hasta=${hasta}`)
    const json = await res.json()
    console.log(json)
    setDetalles(json.detalles || [])
    setTotales(json.totales || [])
  }

  const exportarPDF = async () => {
    const element = document.getElementById('reporte-cobranza')
    if (!element) return
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`reporte-cobranzas.pdf`)
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Reporte de Cobranzas por Usuario</h1>

      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm">Desde</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Hasta</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
        <button
          onClick={obtenerReporte}
          className="bg-blue-600 text-white px-4 py-2 rounded self-end"
        >
          Generar
        </button>
        <button
          onClick={exportarPDF}
          className="bg-green-600 text-white px-4 py-2 rounded self-end"
        >
          Descargar PDF
        </button>
      </div>

      <div id="reporte-cobranza" className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Detalle de Cobros</h2>
        <table className="w-full table-auto border mb-6 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Fecha</th>
              <th className="border px-2 py-1">Medio de Pago</th>
              <th className="border px-2 py-1">Reserva</th>
              <th className="border px-2 py-1">Cliente</th>
              <th className="border px-2 py-1">DNI</th>
              <th className="border px-2 py-1">Monto</th>
              <th className="border px-2 py-1">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((d, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">
                  {format(new Date(d.fecha_pago), 'dd/MM/yyyy', { locale: es })}
                </td>
                <td className="border px-2 py-1">{d.medio_pago}</td>
                <td className="border px-2 py-1">{d.nro_estadia}</td>
                <td className="border px-2 py-1">{d.cliente_nombre}</td>
                <td className="border px-2 py-1">{d.cliente_dni}</td>
                <td className="border px-2 py-1">${d.monto.toFixed(2)}</td>
                <td className="border px-2 py-1">{d.usuario || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-lg font-semibold mb-2">Resumen por Medio de Pago</h2>
        <table className="w-full table-auto border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Medio de Pago</th>
              <th className="border px-2 py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {totales.map((t, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{t.medio_pago}</td>
                <td className="border px-2 py-1">${t.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
