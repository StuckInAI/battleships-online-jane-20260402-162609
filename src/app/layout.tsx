import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BATTLESHIP // RETRO ARCADE',
  description: 'Classic Battleship game with retro arcade aesthetics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
