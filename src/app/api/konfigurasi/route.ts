import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canEditModule } from '@/lib/permissions'
import { LAM_TEKNIK_2024_TEMPLATE } from '@/lib/lkpsTemplates'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if any regulasi exists
    let regulasiList = await prisma.regulasiLKPS.findMany({
      include: {
        kriteriaList: {
          orderBy: { nomorUrut: 'asc' },
          include: {
            tabelList: {
              orderBy: { nomorTabel: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // If empty, auto-seed default LAM Teknik 2024 from comprehensive template
    if (regulasiList.length === 0) {
      const defaultReg = await prisma.regulasiLKPS.create({
        data: {
          nama: 'Instrumen Akreditasi LAM Teknik 2024 (Diploma III / Sarjana Terapan)',
          tahunAkademik: '2024/2025',
          statusAktif: true,
          keterangan: 'Template resmi baku LAM Teknik untuk program vokasi dan sarjana keteknikan sesuai regulasi BAN-PT & Kemendikbudristek.',
        },
      })

      for (const k of LAM_TEKNIK_2024_TEMPLATE) {
        await prisma.kriteriaConfig.create({
          data: {
            regulasiId: defaultReg.id,
            nomorUrut: k.nomorUrut,
            kode: k.kode,
            nama: k.nama,
            levelWewenang: k.levelWewenang,
            deskripsi: k.deskripsi,
            statusAktif: true,
            tabelList: {
              create: k.tabelList.map(t => ({
                nomorTabel: t.nomorTabel,
                namaTabel: t.namaTabel,
                levelPengisi: t.levelPengisi,
                wajibUploadBukti: t.wajibUploadBukti,
                deskripsi: t.deskripsi,
                formatKolom: JSON.stringify({
                  sheetRef: t.sheetRef,
                  targetJenjang: t.targetJenjang,
                  konvensiWaktu: t.konvensiWaktu,
                  kolom: t.kolom,
                  dokumenBukti: t.dokumenBukti,
                  rumusPenilaian: t.rumusPenilaian,
                }),
                statusAktif: true,
              })),
            },
          },
        })
      }

      // Re-fetch after seeding
      regulasiList = await prisma.regulasiLKPS.findMany({
        include: {
          kriteriaList: {
            orderBy: { nomorUrut: 'asc' },
            include: {
              tabelList: {
                orderBy: { nomorTabel: 'asc' },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      })
    }

    return NextResponse.json({ regulasiList })
  } catch (err: any) {
    console.error('Error in GET /api/konfigurasi:', err)
    return NextResponse.json({ error: err.message || 'Gagal memuat konfigurasi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Role check: Admin UPPS, Super Admin, dan Operator Prodi
    const userRole = (session.user as any).role
    if (!canEditModule(userRole, 'konfigurasi')) {
      return NextResponse.json(
        { error: 'Akses ditolak: Akun Anda tidak memiliki wewenang mengatur struktur kriteria dan tabel LKPS.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { action, payload } = body

    // ─── 1. REGULASI ACTIONS ─────────────────────────────────────────
    if (action === 'createRegulasi') {
      const { nama, tahunAkademik, keterangan, statusAktif, cloneFromId } = payload
      if (!nama || !tahunAkademik) {
        return NextResponse.json({ error: 'Nama dan Tahun Akademik wajib diisi' }, { status: 400 })
      }

      const newReg = await prisma.regulasiLKPS.create({
        data: {
          nama,
          tahunAkademik,
          keterangan: keterangan || '',
          statusAktif: statusAktif ?? false,
        },
      })

      // If user wants to clone criteria from an existing regulation
      if (cloneFromId) {
        const sourceKriteria = await prisma.kriteriaConfig.findMany({
          where: { regulasiId: cloneFromId },
          include: { tabelList: true },
          orderBy: { nomorUrut: 'asc' },
        })

        for (const k of sourceKriteria) {
          await prisma.kriteriaConfig.create({
            data: {
              regulasiId: newReg.id,
              nomorUrut: k.nomorUrut,
              kode: k.kode,
              nama: k.nama,
              levelWewenang: k.levelWewenang,
              deskripsi: k.deskripsi,
              statusAktif: k.statusAktif,
              tabelList: {
                create: k.tabelList.map(t => ({
                  nomorTabel: t.nomorTabel,
                  namaTabel: t.namaTabel,
                  levelPengisi: t.levelPengisi,
                  wajibUploadBukti: t.wajibUploadBukti,
                  deskripsi: t.deskripsi,
                  formatKolom: t.formatKolom,
                  statusAktif: t.statusAktif,
                })),
              },
            },
          })
        }
      }

      return NextResponse.json({ success: true, regulasi: newReg })
    }

    if (action === 'updateRegulasi') {
      const { id, nama, tahunAkademik, keterangan, statusAktif } = payload
      const updated = await prisma.regulasiLKPS.update({
        where: { id },
        data: {
          nama,
          tahunAkademik,
          keterangan,
          statusAktif,
        },
      })
      return NextResponse.json({ success: true, regulasi: updated })
    }

    if (action === 'setActiveRegulasi') {
      const { id } = payload
      // Set all to false, then target to true
      await prisma.regulasiLKPS.updateMany({ data: { statusAktif: false } })
      const active = await prisma.regulasiLKPS.update({
        where: { id },
        data: { statusAktif: true },
      })
      return NextResponse.json({ success: true, regulasi: active })
    }

    if (action === 'deleteRegulasi') {
      const { id } = payload
      await prisma.regulasiLKPS.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    if (action === 'loadTemplateLAMTeknik') {
      const { regulasiId, replaceExisting } = payload
      if (!regulasiId) {
        return NextResponse.json({ error: 'ID Regulasi tujuan harus ditentukan' }, { status: 400 })
      }

      if (replaceExisting) {
        await prisma.kriteriaConfig.deleteMany({ where: { regulasiId } })
      }

      for (const k of LAM_TEKNIK_2024_TEMPLATE) {
        await prisma.kriteriaConfig.create({
          data: {
            regulasiId,
            nomorUrut: k.nomorUrut,
            kode: k.kode,
            nama: k.nama,
            levelWewenang: k.levelWewenang,
            deskripsi: k.deskripsi,
            statusAktif: true,
            tabelList: {
              create: k.tabelList.map(t => ({
                nomorTabel: t.nomorTabel,
                namaTabel: t.namaTabel,
                levelPengisi: t.levelPengisi,
                wajibUploadBukti: t.wajibUploadBukti,
                deskripsi: t.deskripsi,
                formatKolom: JSON.stringify({
                  sheetRef: t.sheetRef,
                  targetJenjang: t.targetJenjang,
                  konvensiWaktu: t.konvensiWaktu,
                  kolom: t.kolom,
                  dokumenBukti: t.dokumenBukti,
                  rumusPenilaian: t.rumusPenilaian,
                }),
                statusAktif: true,
              })),
            },
          },
        })
      }

      return NextResponse.json({ success: true, message: 'Template Baku LAM Teknik berhasil dimuat!' })
    }

    // ─── 2. KRITERIA ACTIONS ─────────────────────────────────────────
    if (action === 'createKriteria') {
      const { regulasiId, nomorUrut, kode, nama, deskripsi, levelWewenang, statusAktif } = payload
      if (!kode || !nama) {
        return NextResponse.json({ error: 'Kode dan Nama Kriteria wajib diisi' }, { status: 400 })
      }

      const newKriteria = await prisma.kriteriaConfig.create({
        data: {
          regulasiId,
          nomorUrut: Number(nomorUrut) || 1,
          kode,
          nama,
          deskripsi: deskripsi || '',
          levelWewenang: levelWewenang || 'PRODI',
          statusAktif: statusAktif ?? true,
        },
      })
      return NextResponse.json({ success: true, kriteria: newKriteria })
    }

    if (action === 'updateKriteria') {
      const { id, nomorUrut, kode, nama, deskripsi, levelWewenang, statusAktif } = payload
      const updated = await prisma.kriteriaConfig.update({
        where: { id },
        data: {
          nomorUrut: Number(nomorUrut) || 1,
          kode,
          nama,
          deskripsi,
          levelWewenang,
          statusAktif,
        },
      })
      return NextResponse.json({ success: true, kriteria: updated })
    }

    if (action === 'toggleStatusKriteria') {
      const { id, statusAktif } = payload
      const updated = await prisma.kriteriaConfig.update({
        where: { id },
        data: { statusAktif: Boolean(statusAktif) },
      })
      return NextResponse.json({ success: true, kriteria: updated })
    }

    if (action === 'deleteKriteria') {
      const { id } = payload || {}
      if (!id) {
        return NextResponse.json({ error: 'ID Kriteria tidak diberikan' }, { status: 400 })
      }
      // Hapus seluruh tabel di dalam kriteria terlebih dahulu
      await prisma.tabelConfig.deleteMany({ where: { kriteriaId: id } })
      await prisma.kriteriaConfig.delete({ where: { id } })
      return NextResponse.json({ success: true, message: 'Kriteria beserta seluruh tabel di dalamnya berhasil dihapus' })
    }

    // ─── 3. TABEL ACTIONS ────────────────────────────────────────────
    if (action === 'createTabel') {
      const {
        kriteriaId,
        nomorTabel,
        namaTabel,
        deskripsi,
        levelPengisi,
        wajibUploadBukti,
        statusAktif,
        formatKolom,
      } = payload

      if (!nomorTabel || !namaTabel) {
        return NextResponse.json({ error: 'Nomor Tabel dan Nama Tabel wajib diisi' }, { status: 400 })
      }

      const formatKolomStr =
        typeof formatKolom === 'object'
          ? JSON.stringify(formatKolom)
          : typeof formatKolom === 'string'
          ? formatKolom
          : null

      const newTabel = await prisma.tabelConfig.create({
        data: {
          kriteriaId,
          nomorTabel,
          namaTabel,
          deskripsi: deskripsi || '',
          levelPengisi: levelPengisi || 'PRODI',
          wajibUploadBukti: wajibUploadBukti ?? true,
          formatKolom: formatKolomStr,
          statusAktif: statusAktif ?? true,
        },
      })
      return NextResponse.json({ success: true, tabel: newTabel })
    }

    if (action === 'updateTabel') {
      const {
        id,
        nomorTabel,
        namaTabel,
        deskripsi,
        levelPengisi,
        wajibUploadBukti,
        statusAktif,
        formatKolom,
      } = payload

      const formatKolomStr =
        typeof formatKolom === 'object'
          ? JSON.stringify(formatKolom)
          : typeof formatKolom === 'string'
          ? formatKolom
          : null

      const updated = await prisma.tabelConfig.update({
        where: { id },
        data: {
          nomorTabel,
          namaTabel,
          deskripsi,
          levelPengisi,
          wajibUploadBukti,
          formatKolom: formatKolomStr,
          statusAktif,
        },
      })
      return NextResponse.json({ success: true, tabel: updated })
    }

    if (action === 'toggleStatusTabel') {
      const { id, statusAktif } = payload
      const updated = await prisma.tabelConfig.update({
        where: { id },
        data: { statusAktif: Boolean(statusAktif) },
      })
      return NextResponse.json({ success: true, tabel: updated })
    }

    if (action === 'deleteTabel') {
      const { id } = payload || {}
      if (!id) {
        return NextResponse.json({ error: 'ID Tabel tidak diberikan' }, { status: 400 })
      }
      await prisma.tabelConfig.delete({ where: { id } })
      return NextResponse.json({ success: true, message: 'Tabel LKPS berhasil dihapus' })
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 })
  } catch (err: any) {
    console.error('Error in POST /api/konfigurasi:', err)
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}
