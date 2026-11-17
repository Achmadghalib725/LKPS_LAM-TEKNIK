import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canEditModule, getRoleErrorMessage } from '@/lib/permissions'
import { getActiveProdiId } from '@/lib/active-prodi'

export async function GET(req: Request) {
  try {
    const session = await auth()
    const activeProdiId = await getActiveProdiId(session, req)

    // Filter khusus berdasarkan prodi aktif
    const dosenWhere = activeProdiId ? { prodiId: activeProdiId } : {}

    const dosen = await prisma.dosenTetap.findMany({
      where: dosenWhere,
      include: {
        bimbinganTA: true,
        ewmp: true,
        luaranDosen: true,
      },
      orderBy: { nama: 'asc' },
    })

    const bimbingan = await prisma.bimbinganTA.findMany({
      where: activeProdiId ? { dosen: { prodiId: activeProdiId } } : {},
      include: { dosen: true },
    })

    const ewmp = await prisma.eWMP.findMany({
      where: activeProdiId ? { dosen: { prodiId: activeProdiId } } : {},
      include: { dosen: true },
    })

    const luaranDosen = await prisma.luaranDosen.findMany({
      where: activeProdiId ? { prodiId: activeProdiId } : {},
      include: { dosen: true },
      orderBy: { tahun: 'desc' },
    })

    const tendik = await prisma.tenagaKependidikan.findMany({
      where: activeProdiId ? { prodiId: activeProdiId } : {},
      orderBy: { jenis: 'asc' },
    })

    return NextResponse.json({ dosen, bimbingan, ewmp, luaranDosen, tendik })
  } catch (error) {
    console.error('API SDM GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch SDM data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const role = session.user?.role
  if (role === 'ASESOR') {
    return NextResponse.json({ error: 'Akses ditolak: Asesor Internal hanya memiliki izin membaca data (Read-Only).' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { action, payload } = body

    // Batasan peran: Tendik dikelola oleh Admin UPPS & Super Admin, sedangkan Dosen DTPS diisi oleh Operator Prodi & Super Admin
    if (action === 'saveTendik' && role === 'OPERATOR_PRODI') {
      return NextResponse.json({ error: 'Akses ditolak: Data Tenaga Kependidikan (Tendik) dikonsolidasikan oleh Admin UPPS.' }, { status: 403 })
    }
    if (action !== 'saveTendik' && role === 'ADMIN_UPPS') {
      // Admin UPPS sekarang memiliki hak akses penuh ke seluruh data borang LKPS
    }

    // 1. Save / Update Dosen Tetap (Tabel 3.a.1)
    if (action === 'saveDosen') {
      const {
        id,
        nama,
        nidn,
        pendidikanS2,
        pendidikanS3,
        prodiPascaS2,
        prodiPascaS3,
        bidangKeahlian,
        kesesuaianKompetensi,
        jabatanAkademik,
        sertifikasiDosen,
        noSertifikatPendidik,
        sertifikasiKompetensi,
        bidangSertifikasi,
        lembagaSertifikasi,
        mataKuliahDiampu,
        kesesuaianBidang,
        mataKuliahPSLain,
        bebanMengajar,
      } = payload
      let res
      // Pastikan saat operator menyimpan dosen, otomatis terasosiasi ke prodiId miliknya
      const prodiIdToSave = role === 'OPERATOR_PRODI' && session.user?.prodiId ? session.user.prodiId : undefined

      const dataPayload = {
        nama,
        nidn,
        pendidikanS2: Boolean(pendidikanS2),
        pendidikanS3: Boolean(pendidikanS3),
        prodiPascaS2: prodiPascaS2 || '',
        prodiPascaS3: prodiPascaS3 || '',
        bidangKeahlian: bidangKeahlian || '',
        kesesuaianKompetensi: kesesuaianKompetensi ?? true,
        jabatanAkademik: jabatanAkademik || 'Lektor',
        sertifikasiDosen: Boolean(sertifikasiDosen),
        noSertifikatPendidik: noSertifikatPendidik || '',
        sertifikasiKompetensi: Boolean(sertifikasiKompetensi),
        bidangSertifikasi: bidangSertifikasi || '',
        lembagaSertifikasi: lembagaSertifikasi || '',
        mataKuliahDiampu: mataKuliahDiampu || '',
        kesesuaianBidang: kesesuaianBidang ?? true,
        mataKuliahPSLain: mataKuliahPSLain || '',
        bebanMengajar: parseFloat(bebanMengajar) || 0,
        ...(prodiIdToSave ? { prodiId: prodiIdToSave } : {}),
      }

      if (id && !id.startsWith('temp_')) {
        res = await prisma.dosenTetap.update({
          where: { id },
          data: dataPayload,
        })
      } else {
        res = await prisma.dosenTetap.create({
          data: dataPayload,
        })
      }
      return NextResponse.json(res)
    }

    if (action === 'deleteDosen') {
      await prisma.dosenTetap.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    // 2. Save Bimbingan TA (Tabel 3.a.2)
    if (action === 'saveBimbingan') {
      const { id, dosenId, bimbinganPSSendiriTS, bimbinganPSSendiriTS1, bimbinganPSSendiriTS2, bimbinganPSLainTS, bimbinganPSLainTS1, bimbinganPSLainTS2 } = payload
      let res
      if (id && !id.startsWith('temp_')) {
        res = await prisma.bimbinganTA.update({
          where: { id },
          data: {
            dosenId,
            bimbinganPSSendiriTS: parseInt(bimbinganPSSendiriTS) || 0,
            bimbinganPSSendiriTS1: parseInt(bimbinganPSSendiriTS1) || 0,
            bimbinganPSSendiriTS2: parseInt(bimbinganPSSendiriTS2) || 0,
            bimbinganPSLainTS: parseInt(bimbinganPSLainTS) || 0,
            bimbinganPSLainTS1: parseInt(bimbinganPSLainTS1) || 0,
            bimbinganPSLainTS2: parseInt(bimbinganPSLainTS2) || 0,
          },
        })
      } else {
        res = await prisma.bimbinganTA.create({
          data: {
            dosenId,
            bimbinganPSSendiriTS: parseInt(bimbinganPSSendiriTS) || 0,
            bimbinganPSSendiriTS1: parseInt(bimbinganPSSendiriTS1) || 0,
            bimbinganPSSendiriTS2: parseInt(bimbinganPSSendiriTS2) || 0,
            bimbinganPSLainTS: parseInt(bimbinganPSLainTS) || 0,
            bimbinganPSLainTS1: parseInt(bimbinganPSLainTS1) || 0,
            bimbinganPSLainTS2: parseInt(bimbinganPSLainTS2) || 0,
          },
        })
      }
      return NextResponse.json(res)
    }

    if (action === 'deleteBimbingan') {
      await prisma.bimbinganTA.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    // 3. Save EWMP (Tabel 3.a.3)
    if (action === 'saveEwmp') {
      const { id, dosenId, sksPendidikanPSSendiri, sksPendidikanPSLain, sksPenelitian, sksPkm, sksTugasTambahan } = payload
      let res
      if (id && !id.startsWith('temp_')) {
        res = await prisma.eWMP.update({
          where: { id },
          data: {
            dosenId,
            sksPendidikanPSSendiri: parseFloat(sksPendidikanPSSendiri) || 0,
            sksPendidikanPSLain: parseFloat(sksPendidikanPSLain) || 0,
            sksPenelitian: parseFloat(sksPenelitian) || 0,
            sksPkm: parseFloat(sksPkm) || 0,
            sksTugasTambahan: parseFloat(sksTugasTambahan) || 0,
          },
        })
      } else {
        res = await prisma.eWMP.create({
          data: {
            dosenId,
            sksPendidikanPSSendiri: parseFloat(sksPendidikanPSSendiri) || 0,
            sksPendidikanPSLain: parseFloat(sksPendidikanPSLain) || 0,
            sksPenelitian: parseFloat(sksPenelitian) || 0,
            sksPkm: parseFloat(sksPkm) || 0,
            sksTugasTambahan: parseFloat(sksTugasTambahan) || 0,
          },
        })
      }
      return NextResponse.json(res)
    }

    if (action === 'deleteEwmp') {
      await prisma.eWMP.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    // 4. Save Kinerja / Luaran Dosen (Tabel 3.b.1 - 3.b.8)
    if (action === 'saveLuaranDosen') {
      const { id, dosenId, namaDosen, jenis, judul, tahun, detail } = payload
      let res
      if (id && !id.startsWith('temp_')) {
        res = await prisma.luaranDosen.update({
          where: { id },
          data: {
            dosenId: dosenId || null,
            namaDosen: namaDosen || '',
            jenis,
            judul,
            tahun: parseInt(tahun) || new Date().getFullYear(),
            detail: detail || '',
            prodiId: session.user?.prodiId || undefined,
          },
        })
      } else {
        res = await prisma.luaranDosen.create({
          data: {
            dosenId: dosenId || null,
            namaDosen: namaDosen || '',
            jenis,
            judul,
            tahun: parseInt(tahun) || new Date().getFullYear(),
            detail: detail || '',
            prodiId: session.user?.prodiId || null,
          },
        })
      }
      return NextResponse.json(res)
    }

    if (action === 'deleteLuaranDosen') {
      await prisma.luaranDosen.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    // 5. Save Tenaga Kependidikan (Tabel 3.c)
    if (action === 'saveTendik') {
      const { id, jenis, jenjangPendidikan, jumlah } = payload
      let res
      if (id && !id.startsWith('temp_')) {
        res = await prisma.tenagaKependidikan.update({
          where: { id },
          data: { jenis, jenjangPendidikan, jumlah: parseInt(jumlah) || 0 },
        })
      } else {
        res = await prisma.tenagaKependidikan.create({
          data: { jenis, jenjangPendidikan, jumlah: parseInt(jumlah) || 0 },
        })
      }
      return NextResponse.json(res)
    }

    if (action === 'deleteTendik') {
      await prisma.tenagaKependidikan.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API SDM POST Error:', error)
    return NextResponse.json({ error: 'Failed to process SDM request' }, { status: 500 })
  }
}
