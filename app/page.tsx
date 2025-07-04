'use client'

import Image from 'next/image'
import Link from 'next/link'
import Consulta from '@/components/consultaWh'

export default function Home() {
  return (
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
            alt={`Habitación ${index + 2}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="mt-8 max-w-md mx-auto">
          <Image src="/buffet.png" alt="Desayuno Buffet" width={600} height={400} className="rounded-lg shadow-md object-cover w-full h-auto" />
        </div>
      </section>

{/* Tipos de habitaciones */}
<section className="py-16 px-6 bg-[#DCD7C9] text-center">
  <h3 className="text-3xl font-semibold mb-6 text-[#2C3639]">Tipos de habitaciones</h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
    {[
      { nombre: 'Apart 1 dormitorio', img: '/Apart-1D.PNG' },
      { nombre: 'Apart 2 dormitorios', img: '/Apart-2D.PNG' },
      { nombre: 'Apart superior', img: '/Apart-Sup.PNG' },
      { nombre: 'Habitación', img: '/Habitacion.PNG' },
    ].map((tipo, index) => (
      <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
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

      {/* Formulario */}
      <section id="formulario" className="py-16 px-6 bg-[#DCD7C9] relative z-10">
        <Consulta></Consulta>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-[#3F4E4F] py-4 border-t bg-[#DCD7C9] relative z-10">
        © 2025 Hotel Central Suites. Todos los derechos reservados.       Testing(1.0)
      </footer>
    </div>
  )
}
