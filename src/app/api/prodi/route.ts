import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prodiList = await prisma.prodi.findMany({
    select: {
      id: true,
      namaProdi: true,
      jenjang: true,
      peringkatAkreditasi: true,
      jumlahMahasiswaAktif: true,
    },
    orderBy: { namaProdi: 'asc' },
  })

  return NextResponse.json({ prodiList })
}
