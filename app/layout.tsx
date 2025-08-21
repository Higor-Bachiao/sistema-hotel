import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hotel Management System",
  description: "Sistema completo de gerenciamento hoteleiro com controle de quartos, reservas e hóspedes",
  keywords: "hotel, gerenciamento, reservas, quartos, hospedagem",
  authors: [{ name: "Hotel Management Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Hotel Management System",
    description: "Sistema completo de gerenciamento hoteleiro",
    type: "website",
    locale: "pt_BR",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
