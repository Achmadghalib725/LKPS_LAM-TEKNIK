import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "pg"],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return [
      // Kriteria 1
      { source: '/kriteria/1', destination: '/kerjasama', permanent: false },
      { source: '/kriteria-1', destination: '/kerjasama', permanent: false },
      { source: '/tata-pamong', destination: '/kerjasama', permanent: false },
      
      // Kriteria 2
      { source: '/kriteria/2', destination: '/mahasiswa', permanent: false },
      { source: '/kriteria-2', destination: '/mahasiswa', permanent: false },
      { source: '/mahasiswa/seleksi', destination: '/mahasiswa', permanent: false },
      { source: '/mahasiswa/asing', destination: '/mahasiswa', permanent: false },
      { source: '/tabel-2a', destination: '/mahasiswa', permanent: false },
      { source: '/tabel-2b', destination: '/mahasiswa', permanent: false },
      { source: '/tabel2a', destination: '/mahasiswa', permanent: false },
      { source: '/tabel2b', destination: '/mahasiswa', permanent: false },
      
      // Kriteria 3
      { source: '/kriteria/3', destination: '/sdm', permanent: false },
      { source: '/kriteria-3', destination: '/sdm', permanent: false },
      { source: '/dosen', destination: '/sdm', permanent: false },
      
      // Kriteria 4
      { source: '/kriteria/4', destination: '/keuangan', permanent: false },
      { source: '/kriteria-4', destination: '/keuangan', permanent: false },
      { source: '/sarana', destination: '/keuangan', permanent: false },
      
      // Kriteria 5
      { source: '/kriteria/5', destination: '/pendidikan', permanent: false },
      { source: '/kriteria-5', destination: '/pendidikan', permanent: false },
      { source: '/kurikulum', destination: '/pendidikan', permanent: false },
      { source: '/mbkm', destination: '/pendidikan', permanent: false },
      
      // Kriteria 6
      { source: '/kriteria/6', destination: '/penelitian', permanent: false },
      { source: '/kriteria-6', destination: '/penelitian', permanent: false },
      
      // Kriteria 7
      { source: '/kriteria/7', destination: '/pkm', permanent: false },
      { source: '/kriteria-7', destination: '/pkm', permanent: false },
      
      // Kriteria 8
      { source: '/kriteria/8', destination: '/luaran', permanent: false },
      { source: '/kriteria-8', destination: '/luaran', permanent: false },
      
      // Kriteria 9
      { source: '/kriteria/9', destination: '/penjaminan', permanent: false },
      { source: '/kriteria-9', destination: '/penjaminan', permanent: false },
      { source: '/spmi', destination: '/penjaminan', permanent: false },
    ]
  },
}

export default nextConfig

