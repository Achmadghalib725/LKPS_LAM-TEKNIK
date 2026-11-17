import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

import { canEditModule, getRoleErrorMessage } from '@/lib/permissions'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = session.user?.role
  const userProdiId = session.user?.prodiId

  const whereClause: any = {}
  if (role === 'OPERATOR_PRODI' && userProdiId) {
    whereClause.prodiId = userProdiId
  }

  const data = await prisma.kerjasama.findMany({
    where: whereClause,
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const role = session.user?.role
  const userProdiId = session.user?.prodiId

  if (!canEditModule(role, 'kerjasama')) {
    return NextResponse.json({ error: getRoleErrorMessage(role, 'kerjasama') }, { status: 403 })
  }

  const { rows } = await req.json()

  // Clear existing for this prodi and recreate
  const deleteWhere: any = {}
  if (role === 'OPERATOR_PRODI' && userProdiId) {
    deleteWhere.prodiId = userProdiId
  }
  await prisma.kerjasama.deleteMany({ where: deleteWhere })
  
  const created = await prisma.kerjasama.createMany({
    data: rows.map((r: any) => ({
      namaLembaga: r.namaLembaga,
      tingkat: r.tingkat,
      judulKegiatan: r.judulKegiatan,
      manfaat: r.manfaat || '',
      tanggalMulai: r.tanggalMulai ? new Date(r.tanggalMulai) : new Date(),
      tanggalAkhir: r.tanggalAkhir ? new Date(r.tanggalAkhir) : new Date(),
      jenisKerjasama: r.jenisKerjasama,
      prodiId: userProdiId || r.prodiId || null,
    })),
  })

  return NextResponse.json({ success: true, count: created.count })
}
