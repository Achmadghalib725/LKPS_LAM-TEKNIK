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
 * - OPERATOR_PRODI: Satu-satunya peran yang berhak mengisi, mengubah, dan memvalidasi seluruh data kriteria borang akreditasi (Kriteria 1 s.d. 9, termasuk Keuangan K4).
 * - ADMIN_UPPS: Otoritas pengelolaan pengguna (/admin), master institusi & program studi, konfigurasi struktur kriteria (/konfigurasi), serta memantau (monitoring) dan ekspor laporan. Bersifat Read-Only pada modul pengisian kriteria.
 * - ASESOR / REVIEWER: Read-Only murni di seluruh modul (Audit & Simulasi, melihat dashboard ringkasan data).
 * - GUEST (SSO Kampus): Read-Only ringkasan data akreditasi prodi di tingkat fakultas saja.
 */
export const MODULE_PERMISSIONS: Record<LkpsModule, UserRole[]> = {
  admin: ['ADMIN_UPPS'],
  identitas: ['ADMIN_UPPS', 'OPERATOR_PRODI'],
  kerjasama: ['OPERATOR_PRODI'],
  mahasiswa: ['OPERATOR_PRODI'],
  sdm: ['OPERATOR_PRODI'],
  keuangan: ['OPERATOR_PRODI'],
  pendidikan: ['OPERATOR_PRODI'],
  penelitian: ['OPERATOR_PRODI'],
  pkm: ['OPERATOR_PRODI'],
  luaran: ['OPERATOR_PRODI'],
  penjaminan: ['OPERATOR_PRODI'],
  export: ['ADMIN_UPPS', 'OPERATOR_PRODI', 'ASESOR'],
  konfigurasi: ['ADMIN_UPPS'],
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
    title: 'Admin UPPS (Fakultas / Penanggung Jawab)',
    deskripsi: 'Bertanggung jawab atas manajemen pengguna, master program studi, konfigurasi sistem, dan pemantauan (monitoring) borang seluruh prodi.',
    wewenang: [
      'Mengelola data pengguna dan penugasan operator program studi (/admin)',
      'Mengelola master data institusi dan seluruh Program Studi (/identitas)',
      'Mengonfigurasi struktur kriteria dan tabel dinamis (/konfigurasi)',
      'Memantau dan mereview progres data seluruh Kriteria Akreditasi (1 s.d. 9)',
      'Mengekspor laporan lengkap LKPS format baku LAM Teknik (/export)',
    ],
    batasan: [
      'Bersifat Read-Only pada modul pengisian kriteria akreditasi (pengisian & edit data kriteria merupakan hak eksklusif Operator Program Studi).',
    ],
  },
  OPERATOR_PRODI: {
    title: 'Operator Program Studi (Pengisi Borang)',
    deskripsi: 'Satu-satunya pihak yang berwenang mengisi, memperbarui, dan memvalidasi seluruh data kriteria borang akreditasi (Kriteria 1 s.d. 9).',
    wewenang: [
      'Mengisi dan mengedit data seluruh Kriteria Akreditasi (Kriteria 1 s.d. 9, termasuk Keuangan Kriteria 4)',
      'Mengelola data Tim Penyusun LKPS prodi (/identitas)',
      'Melakukan sinkronisasi data dari One Data UNILA',
      'Mengekspor laporan borang LKPS program studi (/export)',
    ],
    batasan: [
      'Dilarang mengakses dan mengubah manajemen data pengguna sistem (/admin) serta konfigurasi regulasi (/konfigurasi).',
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
  if ((role === 'ADMIN_UPPS' || role === 'SUPER_ADMIN' || role === 'PENANGGUNG_JAWAB') && moduleName !== 'admin' && moduleName !== 'konfigurasi' && moduleName !== 'identitas' && moduleName !== 'export') {
    return 'Akses ditolak: Admin UPPS berstatus sebagai Pemantau (Read-Only). Seluruh pengisian dan pembaruan data kriteria merupakan kewenangan eksklusif Operator Program Studi.'
  }
  if (role === 'OPERATOR_PRODI' && (moduleName === 'admin' || moduleName === 'konfigurasi')) {
    return 'Akses ditolak: Modul ini hanya dapat diakses dan dikelola oleh Admin UPPS.'
  }
  return 'Akses ditolak: Anda tidak memiliki wewenang untuk mengubah data pada modul ini.'
}
