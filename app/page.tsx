'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const [formData, setFormData] = useState({
    nombre: '',
    mensaje: '',
  })

  const enviarWhatsApp = () => {
    const { nombre, mensaje } = formData
    const telefono = '5493517011639'
    const texto = `Hola! Soy ${nombre}. ${mensaje}`
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }

  return (
    <div className="relative min-h-screen bg-[#f9f9f9] text-[#2C3639]">
      {/* Imagen de fondo portada */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/Imagen de WhatsApp 2025-06-12 a las 12.14.47_6c4088aa.jpg"
          alt="Fondo"
          fill
          className="object-cover object-center opacity-30"
        />
      </div>

      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-[#DCD7C9] shadow relative z-10">
        <div className="flex items-center gap-2">
          <Image src="/central-suites-bg.svg" alt="Logo" width={40} height={40} />
        </div>
        <Link href="/login" className="text-[#A27B5B] hover:underline font-medium">
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
      <section className="text-center py-20 px-4 bg-[#DCD7C9]/80 backdrop-blur-sm relative z-10">
        <h2 className="text-4xl font-bold mb-4">Descansá en el corazón de la Ciudad</h2>
        <p className="max-w-xl mx-auto mb-6 text-lg">
          Espacios confortables con todos los servicios que necesitás.
        </p>
        <button
          onClick={() => document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-[#A27B5B] text-white px-6 py-3 rounded-lg hover:bg-[#8e664e]"
        >
          Reservá tu lugar
        </button>
      </section>

     {/* Galería tipo carrusel scroll horizontal */} 
<section className="py-12 px-6 max-w-6xl mx-auto overflow-x-auto scrollbar-thin scrollbar-thumb-[#A27B5B]">
  <div className="flex gap-4 w-max">
    {[
      '/habitacion1.jpg',
      '/habitacion2.jpg',
      '/habitacion4.jpg',
      '/habitacion5.jpg',
      '/habitacion3.jpg',
    ].map((src, index) => (
      <a
        key={index}
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0"
      >
        <div className="relative w-[320px] h-[220px] rounded-lg overflow-hidden shadow-md">
          <Image
            src={src}
            alt={`Habitación ${index + 1}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </a>
    ))}
  </div>
</section>

      {/* Ubicación */}
      <section className="py-12 px-6 bg-[#3F4E4F] text-[#DCD7C9] text-center relative z-10">
        <h3 className="text-2xl font-semibold mb-4">¿Dónde estamos?</h3>
        <p className="mb-4">Av. Libertad 21, Villa Carlos Paz, Córdoba, Argentina</p>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d212.79412304086387!2d-64.4949173927307!3d-31.42222620741587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942d6644500c6ad3%3A0xe9313a402e35f83c!2sDomus%20Center%20Hotel!5e0!3m2!1ses!2sar!4v1750684396467!5m2!1ses!2sar"
          width="100%"
          height="300"
          className="rounded-lg mx-auto max-w-4xl"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>

      {/* Formulario */}
      <section id="formulario" className="py-16 px-6 bg-[#DCD7C9] relative z-10">
        <h3 className="text-2xl font-semibold text-center mb-6 text-[#2C3639]">Consultanos por WhatsApp</h3>
        <div className="max-w-lg mx-auto space-y-4">
          <input
            type="text"
            placeholder="Tu nombre"
            className="w-full border border-[#A27B5B] px-4 py-2 rounded-lg"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
          <textarea
            placeholder="Tu mensaje o consulta"
            className="w-full border border-[#A27B5B] px-4 py-2 rounded-lg"
            rows={4}
            value={formData.mensaje}
            onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
          />
          <button
            onClick={enviarWhatsApp}
            className="w-full bg-[#A27B5B] text-white py-3 rounded-lg hover:bg-[#8e664e]"
          >
            Enviar por WhatsApp
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-[#3F4E4F] py-4 border-t bg-[#DCD7C9] relative z-10">
        © 2025 Hotel Central Suit. Todos los derechos reservados.
      </footer>
    </div>
  )
}