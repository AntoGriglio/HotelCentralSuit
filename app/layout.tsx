
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react"; // 👈 Importar SessionProvider
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Central Suites Hotel',
  description: 'Sistema de gestión',
  icons: {
    icon: '/logo-central.png',
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider> {/* 👈 Envuelve todo en SessionProvider */}
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
