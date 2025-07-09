'use client'

import Image from 'next/image'
import Link from 'next/link'
import Consulta from '@/components/consultaWh'
import { useState } from 'react'

const IMAGENES_POR_TIPO: Record<string, string[]> = {
  'Apart-1D': [
    '/Apart-1D/apart1d-1.png',
     '/Apart-1D/apart1d-2.jpg',
      '/Apart-1D/apart1d-3.jpg',
       '/Apart-1D/apart1d-4.jpg',
        '/Apart-1D/apart1d-5.jpg',
         '/Apart-1D/apart1d-6.jpg',
          '/Apart-1D/apart1d-7.jpg',
  ],
  'Apart-2D': [
    '/Apart-2D/apart2d-1.png',
    '/Apart-2D/apart2d-2.jpg',
    '/Apart-2D/apart2d-3.jpg',
    '/Apart-2D/apart2d-4.jpg',
    '/Apart-2D/apart2d-5.jpg',
    '/Apart-2D/apart2d-6.jpg',
  ],
  'Apart-Sup': [
    '/Apart-Sup/apartsup-1.png',
    '/Apart-Sup/apartsup-2.png',
    '/Apart-Sup/apartsup-3.png',
    '/Apart-Sup/apartsup-4.jpg',
    '/Apart-Sup/apartsup-5.png',
    '/Apart-Sup/apartsup-6.png',
    '/Apart-Sup/apartsup-7.png',
    '/Apart-Sup/apartsup-8.jpg',
    '/Apart-Sup/apartsup-9.jpg',
    '/Apart-Sup/apartsup-10.jpg',
  ],
  'Habitacion': [
    '/Habitacion/hab-1.png',
    '/Habitacion/hab-2.jpg',
    '/Habitacion/hab-3.jpg',
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
    <div className="relative min-h-screen bg-[#c89859] text-[#2C3639]">
      {/* MODAL */}
  {modalAbierto && (
  <div className="fixed inset-0 z-50 bg-opacity-30 flex items-center justify-center px-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-4xl h-full relative">
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
       {/* Imagen central */}
<div className="relative w-full h-[800px] p-4 bg-white rounded-lg shadow-md">
  <Image
    src={imagenes[imagenActual]}
    alt={`img-${imagenActual}`}
    fill
    className="object-contain"
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

    <div className="relative min-h-screen bg-[##c89859] text-[#2C3639]">
      {/* Imagen de fondo portada */}
      <div className="absolute inset-0 -z-10"></div>

      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-[##c89859] shadow relative z-10">
        <div className="flex items-center gap-2">
          <Image src="/central-suites-bg.svg" alt="Logo" width={100} height={100} />
        </div>
        <Link href="/login" className="text-[#A27B5B] hover:underline font-medium">
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
   {/* Hero */}
<section
  className="text-center py-20 px-4 bg-[url('/fondo.jpg')] bg-cover bg-center bg-no-repeat relative z-10 text-white"
>
  <div className="absolute inset-0 bg-black/40 backdrop-blur -z-10" />
  <h2 className="text-4xl font-bold mb-4">Descansá en el corazón de la Ciudad</h2>
  <p className="max-w-xl mx-auto mb-6 text-lg">
    Espacios confortables con todos los servicios que necesitás.
  </p>
  <button
    onClick={() =>
      document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' })
    }
    className="bg-[#00242F] text-white px-6 py-3 rounded-lg hover:bg-[#8e664e]"
  >
    Reservá tu lugar
  </button>
</section>

      {/* Galería tipo carrusel scroll horizontal */} 
      <section className="py-12 px-6 max-w-6xl mx-auto overflow-x-auto scrollbar-thin scrollbar-thumb-[#A27B5B]">
        <div className="flex gap-4 w-max">
          {[
            '/Apart-1D/apart1d-2.jpg',
             '/Apart-Sup/apartsup-2.png',
           '/Apart-Sup/apartsup-4.jpg',
            '/Apart-Sup/apartsup-5.png',
            '/Apart-Sup/apartsup-10.jpg',
            '/frente.png',
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
      <section className="py-16 px-6 bg-[#d9d9d9] text-center">
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
      <section className="py-16 px-6 bg-[#c89859] text-center">
        <h3 className="text-3xl font-semibold mb-6 text-[#2C3639]">Unidades Disponibles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { nombre: 'Apart 1 dormitorio', img:     '/Apart-1D/apart1d-2.jpg', carpeta: 'Apart-1D' },
            { nombre: 'Apart 2 dormitorios', img: '/Apart-2D/apart2d-2.jpg', carpeta: 'Apart-2D' },
            { nombre: 'Apart superior', img:     '/Apart-Sup/apartsup-2.png', carpeta: 'Apart-Sup' },
            { nombre: 'Habitación', img: '/Habitacion/hab-3.jpg', carpeta: 'Habitacion' },
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
      <section className="py-12 px-6 bg-[#00242F] text-[#DCD7C9] text-center relative z-10">
        <h3 className="text-2xl font-semibold mb-4">¿Dónde estamos?</h3>
        <p className="mb-4">Av. Libertad 21, Villa Carlos Paz, Córdoba, Argentina</p>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d506.11294062904807!2d-64.4946122329637!3d-31.422157584949815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942d67c0c2f977e7%3A0xeb5aae61be03c5a2!2sCentral%20Suites%20Hotel!5e0!3m2!1ses!2sar!4v1751755615622!5m2!1ses!2sar"
          width="100%"
          height="300"
          className="rounded-lg mx-auto max-w-4xl"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>
      {/* Formulario y demás secciones siguen igual */}
      <section id="formulario" className="py-16 px-6 bg-[#d9d9d9] relative z-10">
        <Consulta />
      </section>

      <footer className="text-center text-sm text-[#3F4E4F] py-4 border-t bg-[#d9d9d9] relative z-10">
        © 2025 Hotel Central Suites. Todos los derechos reservados.
      </footer>
    </div>
    </div>
  )
}


   