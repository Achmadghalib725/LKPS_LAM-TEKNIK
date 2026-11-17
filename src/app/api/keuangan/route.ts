import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canEditModule, getRoleErrorMessage } from '@/lib/permissions'
import { getActiveProdiId } from '@/lib/active-prodi'

export async function GET(req: Request) {
  try {
    const session = await auth()
    const activeProdiId = await getActiveProdiId(session, req)
    const whereClause: any = activeProdiId ? { prodiId: activeProdiId } : {}

    const dana = await prisma.penggunaanDana.findMany({
      where: whereClause,
      orderBy: { tahunSemester: 'asc' },
    })
    const lab = await prisma.laboratorium.findMany({
      where: whereClause,
      orderBy: { namaLab: 'asc' },
    })

    return NextResponse.json({ dana, lab })
  } catch (error) {
    console.error('API Keuangan GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch Keuangan data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const role = session.user?.role
  if (!canEditModule(role, 'keuangan')) {
    return NextResponse.json({ error: getRoleErrorMessage(role, 'keuangan') }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { action, payload } = body

    if (action === 'saveDana') {
      const { rows } = payload
      // Upsert rows
      for (const row of rows) {
        if (row.id && !row.id.startsWith('temp_')) {
          await prisma.penggunaanDana.update({
            where: { id: row.id },
            data: {
              tahunSemester: row.tahunSemester,
              biayaOperasionalPendidikan: parseFloat(row.biayaOperasionalPendidikan) || 0,
              biayaPenelitianDosen: parseFloat(row.biayaPenelitianDosen) || 0,
              biayaPkmDosen: parseFloat(row.biayaPkmDosen) || 0,
              investasiSdm: parseFloat(row.investasiSdm) || 0,
              investasiSarana: parseFloat(row.investasiSarana) || 0,
              investasiPrasarana: parseFloat(row.investasiPrasarana) || 0,
              prodiId: session.user?.prodiId || undefined,
            },
          })
        } else {
          await prisma.penggunaanDana.create({
            data: {
              tahunSemester: row.tahunSemester,
              biayaOperasionalPendidikan: parseFloat(row.biayaOperasionalPendidikan) || 0,
              biayaPenelitianDosen: parseFloat(row.biayaPenelitianDosen) || 0,
              biayaPkmDosen: parseFloat(row.biayaPkmDosen) || 0,
              investasiSdm: parseFloat(row.investasiSdm) || 0,
              investasiSarana: parseFloat(row.investasiSarana) || 0,
              investasiPrasarana: parseFloat(row.investasiPrasarana) || 0,
              prodiId: session.user?.prodiId || null,
            },
          })
        }
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'saveLab') {
      const { id, namaLab, jenisPeralatan, kepemilikan, kondisi, jamPenggunaan, luasRuangan } = payload
      let lab
      if (id && !id.startsWith('temp_')) {
        lab = await prisma.laboratorium.update({
          where: { id },
          data: {
            namaLab,
            jenisPeralatan,
            kepemilikan,
            kondisi,
            jamPenggunaan: parseFloat(jamPenggunaan) || 0,
            luasRuangan: parseFloat(luasRuangan) || 0,
            prodiId: session.user?.prodiId || undefined,
          },
        })
      } else {
        lab = await prisma.laboratorium.create({
          data: {
            namaLab,
            jenisPeralatan,
            kepemilikan,
            kondisi,
            jamPenggunaan: parseFloat(jamPenggunaan) || 0,
            luasRuangan: parseFloat(luasRuangan) || 0,
            prodiId: session.user?.prodiId || null,
          },
        })
      }
      return NextResponse.json(lab)
    }

    if (action === 'deleteLab') {
      await prisma.laboratorium.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API Keuangan POST Error:', error)
    return NextResponse.json({ error: 'Failed to process Keuangan request' }, { status: 500 })
  }
}
