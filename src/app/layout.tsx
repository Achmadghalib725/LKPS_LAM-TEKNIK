import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LKPS LAM Teknik – Sistem Informasi Akreditasi',
  description: 'Sistem digitalisasi Laporan Kinerja Program Studi (LKPS) untuk akreditasi LAM Teknik Diploma III. Kelola data kriteria akreditasi secara terpusat dan efisien.',
  keywords: 'LKPS, LAM Teknik, akreditasi, program studi, diploma, teknik',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
