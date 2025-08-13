'use client'

import { useEffect, useState } from 'react'

export default function InputMoneda({
  valorInicial = '',
  onCambio,
  className = '',
  editable = true, // 🔹 nuevo parámetro
}: {
  valorInicial?: string | number
  onCambio: (valor: number) => void
  className?: string
  editable?: boolean
}) {
  const [valor, setValor] = useState('')

  useEffect(() => {
    if (valorInicial !== undefined && valorInicial !== null) {
      const numerico = typeof valorInicial === 'number' ? valorInicial : parseFloat(valorInicial)
      setValor('$ ' + numerico.toLocaleString('es-AR'))
    }
  }, [valorInicial])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const soloNumeros = e.target.value.replace(/\./g, '').replace(',', '.').replace(/\$/g, '').trim()
    const valorNumerico = parseFloat(soloNumeros)

    if (!isNaN(valorNumerico)) {
      setValor('$ ' + valorNumerico.toLocaleString('es-AR'))
      onCambio(valorNumerico)
    } else {
      setValor('')
      onCambio(0)
    }
  }

  return (
    <input
      type="text"
      value={valor}
      onChange={editable ? handleChange : undefined} // 🔹 solo cambia si es editable
      readOnly={!editable} // 🔹 así puede copiar pero no escribir
      className={className}
      placeholder="Ej: $ 1.000.000"
    />
  )
}
