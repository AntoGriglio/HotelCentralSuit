import { Geist, Geist_Mono } from "next/font/google"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import "./globals.css"
import Navbar from "./Navbar"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: 'Central Suites Hotel',
  description: 'Sistema de gestión',
  icons: {
    icon: '/logo-central.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        {user && (
          <div className="p-2 text-center text-sm text-gray-600">
            Sesión activa: {user.email}
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
