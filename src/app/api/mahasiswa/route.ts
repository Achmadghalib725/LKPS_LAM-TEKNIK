import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

import { canEditModule, getRoleErrorMessage } from '@/lib/permissions'
import { getActiveProdiId } from '@/lib/active-prodi'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const activeProdiId = await getActiveProdiId(session, req)
  const whereClause: any = activeProdiId ? { prodiId: activeProdiId } : {}

  const seleksi = await prisma.seleksiMahasiswaBaru.findMany({
    where: whereClause,
    orderBy: { tahunSemester: 'asc' },
  })
  const asing = await prisma.mahasiswaAsing.findMany({
    where: whereClause,
    orderBy: { tahunSemester: 'asc' },
  })

  return NextResponse.json({ seleksi, asing })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const role = session.user?.role
  const userProdiId = session.user?.prodiId

  if (!canEditModule(role, 'mahasiswa')) {
    return NextResponse.json({ error: getRoleErrorMessage(role, 'mahasiswa') }, { status: 403 })
  }

  const { seleksi, asing } = await req.json()
  const prodiPrefix = userProdiId ? `${userProdiId}-` : ''

  // Upsert seleksi
  for (const row of seleksi) {
    const rowId = `seleksi-${prodiPrefix}${row.tahun}`
    await prisma.seleksiMahasiswaBaru.upsert({
      where: { id: rowId },
      update: {
        dayaTampung: row.dayaTampung,
        jumlahPendaftar: row.jumlahPendaftar,
        jumlahLulusSeleksi: row.jumlahLulusSeleksi,
        mahasiswaBaruReguler: row.mbReguler,
        mahasiswaBaruTransfer: row.mbTransfer,
        mahasiswaAktifReguler: row.maReguler,
        mahasiswaAktifTransfer: row.maTransfer,
        prodiId: userProdiId || undefined,
      },
      create: {
        id: rowId,
        tahunSemester: row.tahun,
        dayaTampung: row.dayaTampung,
        jumlahPendaftar: row.jumlahPendaftar,
        jumlahLulusSeleksi: row.jumlahLulusSeleksi,
        mahasiswaBaruReguler: row.mbReguler,
        mahasiswaBaruTransfer: row.mbTransfer,
        mahasiswaAktifReguler: row.maReguler,
        mahasiswaAktifTransfer: row.maTransfer,
        prodiId: userProdiId || null,
      },
    })
  }

  // Upsert asing
  for (const row of asing) {
    const rowId = `asing-${prodiPrefix}${row.tahun}`
    await prisma.mahasiswaAsing.upsert({
      where: { id: rowId },
      update: { 
        jumlahFullTime: row.fullTime, 
        jumlahPartTime: row.partTime,
        prodiId: userProdiId || undefined,
      },
      create: {
        id: rowId,
        tahunSemester: row.tahun,
        jumlahFullTime: row.fullTime,
        jumlahPartTime: row.partTime,
        prodiId: userProdiId || null,
      },
    })
  }

  return NextResponse.json({ success: true })
}
