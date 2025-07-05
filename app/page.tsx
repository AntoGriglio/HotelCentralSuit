'use client'

import Image from 'next/image'
import Link from 'next/link'
import Consulta from '@/components/consultaWh'
import { useState } from 'react'

const IMAGENES_POR_TIPO: Record<string, string[]> = {
  'Apart-1D': [
    '/Apart-1D/Apart-1D-1.jpg',
    '/Apart-1D/Apart-1D-2.jpg',
    '/Apart-1D/Apart-1D-3.jpg',
    '/Apart-1D/Apart-1D-4.jpg',
    '/Apart-1D/Apart-1D-5.jpg',
    '/Apart-1D/Apart-1D-6.jpg',
    '/Apart-1D/Apart-1D-7.jpg',
    '/Apart-1D/Apart-1D-8.jpg',
    '/Apart-1D/Apart-1D-9.jpg',
  ],
  'Apart-2D': [
    '/Apart-2D/Apart-2D-1.jpg',
    '/Apart-2D/Apart-2D-2.jpg',
    '/Apart-2D/Apart-2D-3.jpg',
    '/Apart-2D/Apart-2D-4.jpg',
    '/Apart-2D/Apart-2D-5.jpg',
    '/Apart-2D/Apart-2D-6.jpg',
    '/Apart-2D/Apart-2D-7.jpg',
  ],
  'Apart-Sup': [
    '/Apart-Sup/Apart-Sup-1.jpg',
    '/Apart-Sup/Apart-Sup-2.jpg',
    '/Apart-Sup/Apart-Sup-3.PNG',
    '/Apart-Sup/Apart-Sup-4.jpg',
    '/Apart-Sup/Apart-Sup-5.PNG',
    '/Apart-Sup/Apart-Sup-6.PNG',
    '/Apart-Sup/Apart-Sup-7.PNG',
    '/Apart-Sup/Apart-Sup-8.PNG',
    '/Apart-Sup/Apart-Sup-9.jpg',
    '/Apart-Sup/Apart-Sup-10.jpg',
    '/Apart-Sup/Apart-Sup-11.PNG',
    '/Apart-Sup/Apart-Sup-12.PNG',
    '/Apart-Sup/Apart-Sup-13.PNG',
  ],
  'Habitacion': [
    '/Habitacion/img1.jpg',
    '/Habitacion/img2.jpg',
  ],
}

export default function Home() {
  const [modalAbierto, setModalAbierto] = useState(false)
const [carpetaSeleccionada, setCarpetaSeleccionada] = useState('')
const [imagenes, setImagenes] = useState<string[]>([])
const [imagenActual, setImagenActual] = useState(0)

const abrirCarrusel = (carpeta: string) => {
  setImagenes(IMAGENES_POR_TIPO[carpeta] || [])
  setCarpetaSeleccionada(carpeta)
  setImagenActual(0)
  setModalAbierto(true)
}


  return (
    <div className="relative min-h-screen bg-[#f9f9f9] text-[#2C3639]">
      {/* MODAL */}
  {modalAbierto && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center px-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-4xl relative">
      <button
        onClick={() => setModalAbierto(false)}
        className="absolute top-2 right-4 text-2xl text-gray-600 hover:text-black font-bold"
      >
        ✕
      </button>

      {/* Título del tipo de habitación */}
      <h2 className="text-2xl font-semibold text-center mb-4 text-[#2C3639]">
        {carpetaSeleccionada.replace(/-/g, ' ')}
      </h2>

      {/* Carrusel con flechas */}
      <div className="relative">
        {/* Flecha izquierda */}
        <button
          onClick={() =>
            setImagenActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1))
          }
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow-md z-10"
        >
          ←
        </button>

        {/* Imagen central */}
        <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-md">
          <Image
            src={imagenes[imagenActual]}
            alt={`img-${imagenActual}`}
            fill
            className="object-cover"
          />
        </div>

        {/* Flecha derecha */}
        <button
          onClick={() =>
            setImagenActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1))
          }
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow-md z-10"
        >
          →
        </button>
      </div>

  
    </div>
  </div>
)}

    <div className="relative min-h-screen bg-[#f9f9f9] text-[#2C3639]">
      {/* Imagen de fondo portada */}
      <div className="absolute inset-0 -z-10"></div>

      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-[#DCD7C9] shadow relative z-10">
        <div className="flex items-center gap-2">
          <Image src="/central-suites-bg.svg" alt="Logo" width={100} height={100} />
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

      {/* Amenities y Servicios */}
      <section className="py-16 px-6 bg-[#f0ebe3] text-center">
        <h3 className="text-3xl font-semibold mb-6 text-[#2C3639]">Amenities y Servicios</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-[#3F4E4F]">
          {[
            'TV por cable',
            'Aire acondicionado',
            'Cochera cubierta',
            'Terraza con pileta',
            'Comedor',
            'WiFi',
            'Ropa blanca',
            'Desayuno buffet'
          ].map((item, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg py-4 px-3 text-sm font-medium">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-8 max-w-md mx-auto">
          <Image src="/buffet.png" alt="Desayuno Buffet" width={600} height={400} className="rounded-lg shadow-md object-cover w-full h-auto" />
        </div>
      </section>
    {/* Tipos de habitaciones */}
      <section className="py-16 px-6 bg-[#DCD7C9] text-center">
        <h3 className="text-3xl font-semibold mb-6 text-[#2C3639]">Unidades Disponibles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { nombre: 'Apart 1 dormitorio', img: '/Apart-1D.PNG', carpeta: 'Apart-1D' },
            { nombre: 'Apart 2 dormitorios', img: '/Apart-2D.PNG', carpeta: 'Apart-2D' },
            { nombre: 'Apart superior', img: '/Apart-Sup.PNG', carpeta: 'Apart-Sup' },
            { nombre: 'Habitación', img: '/Habitacion.PNG', carpeta: 'Habitacion' },
          ].map((tipo, index) => (
            <div
              key={index}
              onClick={() => abrirCarrusel(tipo.carpeta)}
              className="bg-white rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition"
            >
              <Image
                src={tipo.img}
                alt={tipo.nombre}
                width={400}
                height={250}
                className="object-cover w-full h-[200px]"
              />
              <div className="p-4 text-[#2C3639] font-medium">{tipo.nombre}</div>
            </div>
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
      {/* Formulario y demás secciones siguen igual */}
      <section id="formulario" className="py-16 px-6 bg-[#DCD7C9] relative z-10">
        <Consulta />
      </section>

      <footer className="text-center text-sm text-[#3F4E4F] py-4 border-t bg-[#DCD7C9] relative z-10">
        © 2025 Hotel Central Suites. Todos los derechos reservados.
      </footer>
    </div>
    </div>
  )
}


   