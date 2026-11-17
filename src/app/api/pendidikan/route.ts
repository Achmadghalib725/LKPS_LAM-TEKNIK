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

    const mk = await prisma.mataKuliah.findMany({
      where: whereClause,
      orderBy: { kode: 'asc' },
    })
    const mbkm = await prisma.programMBKM.findMany({
      where: whereClause,
      orderBy: { namaMahasiswa: 'asc' },
    })

    return NextResponse.json({ mk, mbkm })
  } catch (error) {
    console.error('API Pendidikan GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch Pendidikan data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const role = session.user?.role
  if (!canEditModule(role, 'pendidikan')) {
    return NextResponse.json({ error: getRoleErrorMessage(role, 'pendidikan') }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { action, payload } = body

    if (action === 'saveMK') {
      const { id, kode, nama, sksTeori, sksPraktikum, cpl, linkRps, unitPenyelenggara } = payload
      let mk
      if (id && !id.startsWith('temp_')) {
        mk = await prisma.mataKuliah.update({
          where: { id },
          data: {
            kode,
            nama,
            sksTeori: parseFloat(sksTeori) || 0,
            sksPraktikum: parseFloat(sksPraktikum) || 0,
            cpl: cpl || '',
            linkRps: linkRps || null,
            unitPenyelenggara: unitPenyelenggara || 'Prodi',
            prodiId: session.user?.prodiId || undefined,
          },
        })
      } else {
        mk = await prisma.mataKuliah.create({
          data: {
            kode,
            nama,
            sksTeori: parseFloat(sksTeori) || 0,
            sksPraktikum: parseFloat(sksPraktikum) || 0,
            cpl: cpl || '',
            linkRps: linkRps || null,
            unitPenyelenggara: unitPenyelenggara || 'Prodi',
            prodiId: session.user?.prodiId || null,
          },
        })
      }
      return NextResponse.json(mk)
    }

    if (action === 'deleteMK') {
      await prisma.mataKuliah.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    if (action === 'saveMBKM') {
      const { id, namaMahasiswa, nim, namaMitra, sksKonversi, dosenPembimbing, tahun } = payload
      let mbkm
      if (id && !id.startsWith('temp_')) {
        mbkm = await prisma.programMBKM.update({
          where: { id },
          data: {
            namaMahasiswa,
            nim,
            namaMitra,
            sksKonversi: parseFloat(sksKonversi) || 0,
            dosenPembimbing,
            tahun: parseInt(tahun) || new Date().getFullYear(),
          },
        })
      } else {
        mbkm = await prisma.programMBKM.create({
          data: {
            namaMahasiswa,
            nim,
            namaMitra,
            sksKonversi: parseFloat(sksKonversi) || 0,
            dosenPembimbing,
            tahun: parseInt(tahun) || new Date().getFullYear(),
          },
        })
      }
      return NextResponse.json(mbkm)
    }

    if (action === 'deleteMBKM') {
      await prisma.programMBKM.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API Pendidikan POST Error:', error)
    return NextResponse.json({ error: 'Failed to process Pendidikan request' }, { status: 500 })
  }
}
