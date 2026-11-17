export type UserRole = 'ADMIN_UPPS' | 'OPERATOR_PRODI' | 'ASESOR' | 'GUEST'

export type LkpsModule =
  | 'identitas'
  | 'kerjasama'
  | 'mahasiswa'
  | 'sdm'
  | 'keuangan'
  | 'pendidikan'
  | 'penelitian'
  | 'pkm'
  | 'luaran'
  | 'penjaminan'
  | 'admin'
  | 'export'
  | 'konfigurasi'

/**
 * Aturan hak akses tulis/ubah data (Mutation: POST, PUT, DELETE) per modul:
 * - ADMIN_UPPS: Otoritas penuh terhadap seluruh sistem (seluruh Kriteria 1-9, Identitas, Export, Konfigurasi, dan Manajemen Pengguna).
 * - OPERATOR_PRODI: Dapat mengisi & mengedit seluruh modul borang akreditasi (Kriteria 1-9, Identitas, Ingestion, Export, Konfigurasi), KECUALI manajemen pengguna (/admin).
 * - ASESOR / REVIEWER: Read-Only murni di seluruh modul (Audit & Simulasi, melihat dashboard ringkasan data).
 * - GUEST (SSO Kampus): Read-Only ringkasan data akreditasi prodi di tingkat fakultas saja.
 */
export const MODULE_PERMISSIONS: Record<LkpsModule, UserRole[]> = {
  admin: ['ADMIN_UPPS'],
  identitas: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
  kerjasama: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
  mahasiswa: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
  sdm: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
  keuangan: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
  pendidikan: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
  penelitian: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
  pkm: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
  luaran: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
  penjaminan: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
  export: ['ADMIN_UPPS', 'OPERATOR_PRODI', 'ASESOR'],
  konfigurasi: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
}

/**
 * Cek apakah role memiliki izin untuk mengedit / menyimpan data pada modul tertentu
 */
export function canEditModule(role: UserRole | string | undefined | null, moduleName: LkpsModule): boolean {
  if (!role) return false
  const normalizedRole = (role === 'SUPER_ADMIN' || role === 'PENANGGUNG_JAWAB')
    ? 'ADMIN_UPPS'
    : role === 'REVIEWER'
    ? 'ASESOR'
    : role
  const allowedRoles = MODULE_PERMISSIONS[moduleName]
  return allowedRoles ? allowedRoles.includes(normalizedRole as UserRole) : false
}

/**
 * Deskripsi tanggung jawab dan batasan per role
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, { title: string; deskripsi: string; wewenang: string[]; batasan: string[] }> = {
  ADMIN_UPPS: {
    title: 'Admin UPPS (Fakultas / Otoritas Penuh)',
    deskripsi: 'Memiliki kendali penuh terhadap seluruh sistem LKPS, seluruh kriteria borang, dan manajemen akun pengguna.',
    wewenang: [
      'Mengelola data institusi, UPPS, dan seluruh Program Studi',
      'Mengelola akun pengguna dan penugasan operator program studi (/admin)',
      'Mengonfigurasi struktur kriteria dan pembagian wewenang tabel (/konfigurasi)',
      'Mengisi, merevisi, dan memvalidasi seluruh Kriteria Akreditasi (Kriteria 1 s.d. 9)',
      'Melakukan ekspor laporan lengkap LKPS format baku LAM Teknik',
    ],
    batasan: ['Tidak ada batasan hak akses (Administrator Tertinggi).'],
  },
  OPERATOR_PRODI: {
    title: 'Operator Program Studi',
    deskripsi: 'Bertanggung jawab penuh atas pengisian, pembaruan, dan validasi data seluruh borang LKPS.',
    wewenang: [
      'Mengisi dan mengedit data seluruh Kriteria Akreditasi (Kriteria 1 s.d. 9)',
      'Mengelola data Identitas Program Studi dan Tim Penyusun',
      'Melakukan import data dari One Data UNILA dan input manual',
      'Mengekspor laporan borang LKPS format baku LAM Teknik',
    ],
    batasan: [
      'Dilarang mengakses dan mengubah manajemen data pengguna sistem (/admin)',
    ],
  },
  ASESOR: {
    title: 'Reviewer (Auditor Mutu Internal)',
    deskripsi: 'Bertugas melakukan peninjauan audit mutu dan verifikasi instrumen LKPS sebelum diajukan ke LAM Teknik.',
    wewenang: [
      'Melihat dashboard ringkasan data dan penjelasan singkat capaian akreditasi',
      'Melihat seluruh data kuantitatif pada Identitas dan 9 Kriteria Akreditasi (Read-Only)',
      'Melihat hasil kalkulasi otomatis rumus akreditasi dan skor simulasi',
      'Mengekspor laporan akhir LKPS format Excel untuk keperluan audit fisik',
    ],
    batasan: [
      'Dilarang keras mengubah, menambah, atau menghapus data di seluruh modul (100% Read-Only)',
      'Tidak dapat mengakses halaman manajemen pengguna (/admin)',
    ],
  },
  GUEST: {
    title: 'Guest (Akses Terbatas / SSO Kampus)',
    deskripsi: 'Pengguna tamu terintegrasi SSO kampus untuk melihat ringkasan status akreditasi prodi di tingkat fakultas.',
    wewenang: [
      'Melihat dashboard ringkasan data akreditasi prodi di lingkungan fakultas',
      'Melihat penjelasan umum matriks capaian akreditasi',
    ],
    batasan: [
      'Tidak dapat mengubah data apapun di seluruh sistem (100% Read-Only)',
      'Tidak memiliki akses ke halaman edit borang, impor One Data, dan manajemen pengguna',
    ],
  },
}

/**
 * Pesan error standar jika role tidak memiliki hak akses tulis
 */
export function getRoleErrorMessage(role: UserRole | string | undefined | null, moduleName: LkpsModule): string {
  if (role === 'GUEST') {
    return 'Akses ditolak: Akun Guest hanya memiliki akses melihat ringkasan akreditasi fakultas.'
  }
  if (role === 'ASESOR' || role === 'REVIEWER') {
    return 'Akses ditolak: Reviewer Internal hanya memiliki izin membaca data (Read-Only).'
  }
  if (role === 'OPERATOR_PRODI' && moduleName === 'admin') {
    return 'Akses ditolak: Modul manajemen pengguna hanya dapat diakses oleh Admin UPPS.'
  }
  return 'Akses ditolak: Anda tidak memiliki wewenang untuk mengubah data pada modul ini.'
}
