'use client'

import Image from 'next/image'

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-[#DCD7C9] bg-opacity-90 z-50 flex flex-col items-center justify-center">
      <Image
        src="/logo.png" 
        width={80}
        height={80}
        alt="Cargando..."
        className="animate-spin-slow"
      />
      <p className="mt-4 text-[#2C3639] font-semibold text-lg">Cargando...</p>
    </div>
  )
}
