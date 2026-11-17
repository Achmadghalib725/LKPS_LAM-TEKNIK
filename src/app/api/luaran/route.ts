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

    const ipk = await prisma.ipkLulusan.findMany({ where: whereClause, orderBy: { tahunSemester: 'asc' } })
    const prestasi = await prisma.prestasiMahasiswa.findMany({ where: whereClause, orderBy: { tahun: 'desc' } })
    const efektivitas = await prisma.efektivitasStudi.findMany({ where: whereClause, orderBy: { angkatan: 'desc' } })
    const tracer = await prisma.tracerStudy.findMany({ where: whereClause, orderBy: { tahun: 'desc' } })
    const luaranMhs = await prisma.luaranMahasiswa.findMany({ where: whereClause, orderBy: { tahun: 'desc' } })

    return NextResponse.json({ ipk, prestasi, efektivitas, tracer, luaranMhs })
  } catch (error) {
    console.error('API Luaran GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch Luaran data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const role = session.user?.role
  if (!canEditModule(role, 'luaran')) {
    return NextResponse.json({ error: getRoleErrorMessage(role, 'luaran') }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { action, payload } = body

    if (action === 'saveIpk') {
      const { rows } = payload
      for (const r of rows) {
        if (r.id && !r.id.startsWith('temp_')) {
          await prisma.ipkLulusan.update({
            where: { id: r.id },
            data: {
              tahunSemester: r.tahunSemester,
              ipkMinimum: parseFloat(r.ipkMinimum) || 0,
              ipkRataRata: parseFloat(r.ipkRataRata) || 0,
              ipkMaksimum: parseFloat(r.ipkMaksimum) || 0,
              prodiId: session.user?.prodiId || undefined,
            },
          })
        } else {
          await prisma.ipkLulusan.create({
            data: {
              tahunSemester: r.tahunSemester,
              ipkMinimum: parseFloat(r.ipkMinimum) || 0,
              ipkRataRata: parseFloat(r.ipkRataRata) || 0,
              ipkMaksimum: parseFloat(r.ipkMaksimum) || 0,
              prodiId: session.user?.prodiId || null,
            },
          })
        }
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'savePrestasi') {
      const { id, namaMahasiswa, namaKegiatan, tingkat, penghargaan, tahun, jenis } = payload
      let res
      if (id && !id.startsWith('temp_')) {
        res = await prisma.prestasiMahasiswa.update({
          where: { id },
          data: {
            namaMahasiswa,
            namaKegiatan,
            tingkat,
            penghargaan,
            tahun: parseInt(tahun) || new Date().getFullYear(),
            jenis,
            prodiId: session.user?.prodiId || undefined,
          },
        })
      } else {
        res = await prisma.prestasiMahasiswa.create({
          data: {
            namaMahasiswa,
            namaKegiatan,
            tingkat,
            penghargaan,
            tahun: parseInt(tahun) || new Date().getFullYear(),
            jenis,
            prodiId: session.user?.prodiId || null,
          },
        })
      }
      return NextResponse.json(res)
    }

    if (action === 'deletePrestasi') {
      await prisma.prestasiMahasiswa.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    if (action === 'saveEfektivitas') {
      const { id, angkatan, jumlahMasuk, jumlahLulusTepat } = payload
      let res
      if (id && !id.startsWith('temp_')) {
        res = await prisma.efektivitasStudi.update({
          where: { id },
          data: {
            angkatan: parseInt(angkatan),
            jumlahMasuk: parseInt(jumlahMasuk) || 0,
            jumlahLulusTepat: parseInt(jumlahLulusTepat) || 0,
            prodiId: session.user?.prodiId || undefined,
          },
        })
      } else {
        res = await prisma.efektivitasStudi.create({
          data: {
            angkatan: parseInt(angkatan),
            jumlahMasuk: parseInt(jumlahMasuk) || 0,
            jumlahLulusTepat: parseInt(jumlahLulusTepat) || 0,
            prodiId: session.user?.prodiId || null,
          },
        })
      }
      return NextResponse.json(res)
    }

    if (action === 'saveTracer') {
      const { id, tahun, jumlahResponden, rataWaktuTunggu, persenSesuaiBidang, persenTempatKerjaLokal, persenTempatKerjaNasional, persenTempatKerjaInternasional, skorKepuasanPengguna } = payload
      let res
      if (id && !id.startsWith('temp_')) {
        res = await prisma.tracerStudy.update({
          where: { id },
          data: {
            tahun: parseInt(tahun),
            jumlahResponden: parseInt(jumlahResponden) || 0,
            rataWaktuTunggu: parseFloat(rataWaktuTunggu) || 0,
            persenSesuaiBidang: parseFloat(persenSesuaiBidang) || 0,
            persenTempatKerjaLokal: parseFloat(persenTempatKerjaLokal) || 0,
            persenTempatKerjaNasional: parseFloat(persenTempatKerjaNasional) || 0,
            persenTempatKerjaInternasional: parseFloat(persenTempatKerjaInternasional) || 0,
            skorKepuasanPengguna: parseFloat(skorKepuasanPengguna) || 0,
            prodiId: session.user?.prodiId || undefined,
          },
        })
      } else {
        res = await prisma.tracerStudy.create({
          data: {
            tahun: parseInt(tahun),
            jumlahResponden: parseInt(jumlahResponden) || 0,
            rataWaktuTunggu: parseFloat(rataWaktuTunggu) || 0,
            persenSesuaiBidang: parseFloat(persenSesuaiBidang) || 0,
            persenTempatKerjaLokal: parseFloat(persenTempatKerjaLokal) || 0,
            persenTempatKerjaNasional: parseFloat(persenTempatKerjaNasional) || 0,
            persenTempatKerjaInternasional: parseFloat(persenTempatKerjaInternasional) || 0,
            skorKepuasanPengguna: parseFloat(skorKepuasanPengguna) || 0,
            prodiId: session.user?.prodiId || null,
          },
        })
      }
      return NextResponse.json(res)
    }

    if (action === 'saveLuaran') {
      const { id, jenis, judul, namaMahasiswa, tahun, detail } = payload
      let res
      if (id && !id.startsWith('temp_')) {
        res = await prisma.luaranMahasiswa.update({
          where: { id },
          data: {
            jenis,
            judul,
            namaMahasiswa,
            tahun: parseInt(tahun) || new Date().getFullYear(),
            detail,
            prodiId: session.user?.prodiId || undefined,
          },
        })
      } else {
        res = await prisma.luaranMahasiswa.create({
          data: {
            jenis,
            judul,
            namaMahasiswa,
            tahun: parseInt(tahun) || new Date().getFullYear(),
            detail,
            prodiId: session.user?.prodiId || null,
          },
        })
      }
      return NextResponse.json(res)
    }

    if (action === 'deleteLuaranMhs') {
      await prisma.luaranMahasiswa.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API Luaran POST Error:', error)
    return NextResponse.json({ error: 'Failed to process Luaran request' }, { status: 500 })
  }
}
