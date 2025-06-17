/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export default function RegistrarEstadia() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reciboRef = useRef<HTMLDivElement>(null)

  const [dni, setDni] = useState('')
  const [cliente, setCliente] = useState<any>(null)
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState<any[]>([])
  const [canales, setCanales] = useState<any[]>([])
  const [estados, setEstados] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({ dni: '', nombre_completo: '', email: '', telefono: '' })
  const [cantidadNoches, setCantidadNoches] = useState<number>(0)

  const [estadia, setEstadia] = useState({
    cantidadPersonas: '', fechaIngreso: '', fechaEgreso: '', cochera: false,
    desayuno: false, almuerzo: false, cena: false, ropaBlanca: false,
    precioPorNoche: '', porcentajeReserva: '', montoReserva: '', total: '',
    habitacionId: '', observaciones: '', canalId: '', estadoId: '',
  })

  useEffect(() => {
    const habitacion_id = searchParams.get('habitacion_id')
    const fecha_ingreso = searchParams.get('fecha_ingreso')
    const fecha_egreso = searchParams.get('fecha_egreso')
    const cantidad = searchParams.get('cantidad_personas')

    setEstadia(prev => ({
      ...prev,
      habitacionId: habitacion_id || prev.habitacionId,
      fechaIngreso: fecha_ingreso || prev.fechaIngreso,
      fechaEgreso: fecha_egreso || prev.fechaEgreso,
      cantidadPersonas: cantidad || prev.cantidadPersonas,
    }))
  }, [searchParams])

  useEffect(() => {
    fetch('/api/unidades')
      .then(res => res.json())
      .then(data => setHabitaciones(data))
      .catch(console.error)

    fetch('/api/canales')
      .then(res => res.json())
      .then(setCanales)
      .catch(console.error)

    fetch('/api/estados')
      .then(res => res.json())
      .then(setEstados)
      .catch(console.error)
  }, [])

  useEffect(() => {
    const precio = parseFloat(estadia.precioPorNoche)
    const porcentaje = parseFloat(estadia.porcentajeReserva)
    const fechaIngreso = new Date(estadia.fechaIngreso)
    const fechaEgreso = new Date(estadia.fechaEgreso)
    const diferenciaEnMs = fechaEgreso.getTime() - fechaIngreso.getTime()
    const noches = Math.ceil(diferenciaEnMs / (1000 * 60 * 60 * 24))
    setCantidadNoches(noches)

    if (!isNaN(precio) && noches > 0) {
      const totalCalculado = noches * precio
      const montoReservaCalculado = !isNaN(porcentaje) ? (totalCalculado * porcentaje) / 100 : 0

      setEstadia(prev => ({
        ...prev,
        montoReserva: montoReservaCalculado.toFixed(2),
        total: totalCalculado.toFixed(2),
      }))
    }
  }, [estadia.fechaIngreso, estadia.fechaEgreso, estadia.precioPorNoche, estadia.porcentajeReserva])

  useEffect(() => {
    if (estadia.fechaIngreso && estadia.fechaEgreso) {
      fetch(`/api/unidades/disponibles?desde=${estadia.fechaIngreso}&hasta=${estadia.fechaEgreso}`)
        .then(res => res.json())
        .then(data => setHabitacionesDisponibles(data))
        .catch(console.error)
    }
  }, [estadia.fechaIngreso, estadia.fechaEgreso])

  useEffect(() => {
    const estadoAuto = cliente ? 'pendiente' : 'sin confirmar'
    const encontrado = estados.find(e => e.nombre.toLowerCase() === estadoAuto)
    if (encontrado) {
      setEstadia(prev => ({ ...prev, estadoId: encontrado.id }))
    }
  }, [cliente, estados])

  const generarPDF = async () => {
    const contenedor = reciboRef.current
    if (!contenedor) return
    const canvas = await html2canvas(contenedor)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF()
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0)
    pdf.save(`reserva_${cliente?.dni || 'nueva'}.pdf`)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#2C3639] mb-6">Registrar Estadía</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input type="date" value={estadia.fechaIngreso} onChange={e => setEstadia({ ...estadia, fechaIngreso: e.target.value })} className="p-2 border rounded text-[#2C3639]" />
        <input type="date" value={estadia.fechaEgreso} onChange={e => setEstadia({ ...estadia, fechaEgreso: e.target.value })} className="p-2 border rounded text-[#2C3639]" />
        <input type="number" placeholder="Cantidad de personas" value={estadia.cantidadPersonas} onChange={e => setEstadia({ ...estadia, cantidadPersonas: e.target.value })} className="p-2 border rounded text-[#2C3639]" />
        <p className="p-2 text-[#2C3639]">Cantidad de noches: <strong>{cantidadNoches}</strong></p>

        <select value={estadia.habitacionId} onChange={e => setEstadia({ ...estadia, habitacionId: e.target.value })} required className="p-2 border rounded text-[#2C3639]">
          <option value="">Seleccionar habitación disponible</option>
          {habitacionesDisponibles.map((h) => (
            <option key={h.id} value={h.id}>{h.numero} - Piso {h.piso} - Capacidad {h.capacidad_max}</option>
          ))}
        </select>
      </div>

      <div ref={reciboRef} className="hidden bg-white text-black p-6 w-[800px]">
        <img src="/logo.png" alt="Logo" className="mb-4 h-12" />
        <h2 className="text-xl font-bold mb-4">Comprobante de Reserva</h2>
        <p><strong>Cliente:</strong> {cliente?.nombre_completo} ({cliente?.dni})</p>
        <p><strong>Habitación:</strong> {habitaciones.find(h => h.id === estadia.habitacionId)?.numero}</p>
        <p><strong>Ingreso:</strong> {estadia.fechaIngreso}</p>
        <p><strong>Egreso:</strong> {estadia.fechaEgreso}</p>
        <p><strong>Noches:</strong> {cantidadNoches}</p>
        <p><strong>Personas:</strong> {estadia.cantidadPersonas}</p>
        <p><strong>Total:</strong> ${estadia.total}</p>
        <p><strong>Reserva:</strong> ${estadia.montoReserva}</p>
      </div>

      <button onClick={generarPDF} className="mt-4 bg-[#A27B5B] text-white px-4 py-2 rounded">Descargar PDF</button>
    </div>
  )
}
