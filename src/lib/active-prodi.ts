import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

/**
 * Mengambil ID Program Studi aktif yang sedang dilihat.
 * - OPERATOR_PRODI: selalu mengembalikan prodiId milik operator tersebut (terkunci).
 * - ADMIN_UPPS & REVIEWER: mengambil dari parameter query ?prodiId= atau cookie selected_prodi_id.
 *   Jika belum disetel, fallback ke Program Studi pertama di database.
 */
export async function getActiveProdiId(session: any, req?: Request): Promise<string | null> {
  if (!session?.user) return null
  const role = session.user.role

  // Operator Prodi terkunci pada prodinya sendiri
  if (role === 'OPERATOR_PRODI') {
    return session.user.prodiId || null
  }

  // 1. Cek dari query param ?prodiId= jika ada
  if (req) {
    try {
      const url = new URL(req.url)
      const q = url.searchParams.get('prodiId')
      if (q) return q
    } catch {}
  }

  // 2. Cek dari Cookie selected_prodi_id
  try {
    const cookieStore = await cookies()
    const fromCookie = cookieStore.get('selected_prodi_id')?.value
    if (fromCookie) {
      const exists = await prisma.prodi.findUnique({
        where: { id: fromCookie },
        select: { id: true },
      })
      if (exists) return exists.id
    }
  } catch {}

  // 3. Fallback: pilih prodi pertama yang ada di database
  try {
    const first = await prisma.prodi.findFirst({
      select: { id: true },
      orderBy: { namaProdi: 'asc' },
    })
    return first?.id || null
  } catch {
    return null
  }
}
