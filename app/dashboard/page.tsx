import { auth } from '@/auth'
import Image from 'next/image'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    return (
      <div className="p-8">
        <h1>No tienes acceso a esta página</h1>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#f9f9f9]">

      <div className="absolute inset-0 z-0 opacity-10">
       <div className="absolute inset-0 z-0  flex items-center justify-center pointer-events-none select-none">
  <Image
    src="/central-suites-bg.svg"
    alt="Central Suites"
    width={600} // ajustá este valor según el tamaño deseado
    height={600}
    className="object-contain"
  />
</div>

      </div>
      <div className="relative z-10 p-10 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-[#374e4e] mb-4">Bienvenido, {session.user?.name}!</h1>
      
      </div>
    </div>
  )
}
