import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import {
  parseOneDataSDM,
  parseOneDataMahasiswa,
  parseOneDataKerjasama,
  parseOneDataTracer,
} from '@/lib/onedata-parser'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = req.headers.get('content-type') || ''

    // 1. Aksi Simpan / Apply ke Basis Data LKPS
    if (contentType.includes('application/json')) {
      const body = await req.json()
      const { action, domain, items } = body

      if (action === 'apply' && Array.isArray(items) && items.length > 0) {
        let insertedCount = 0

        if (domain?.includes('SDM') || domain?.includes('Dosen')) {
          for (const item of items) {
            const safeNidn = item.nidn && item.nidn !== '-' ? String(item.nidn) : `TMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
            await prisma.dosenTetap.upsert({
              where: { nidn: safeNidn },
              update: {
                nama: item.nama,
                jabatanAkademik: item.jabatanAkademik || 'Lektor',
                bidangKeahlian: item.bidangKeahlian || null,
                pendidikanS2: Boolean(item.pendidikan?.includes('S2')),
                pendidikanS3: Boolean(item.pendidikan?.includes('S3')),
                mataKuliahDiampu: item.mataKuliahDiampu || null,
                kesesuaianBidang: item.kesesuaianKompetensi ?? true,
                sertifikasiDosen: item.sertifikatPendidik ?? true,
                sertifikasiKompetensi: item.sertifikatProfesi ?? false,
              },
              create: {
                nidn: safeNidn,
                nama: item.nama,
                jabatanAkademik: item.jabatanAkademik || 'Lektor',
                bidangKeahlian: item.bidangKeahlian || null,
                pendidikanS2: Boolean(item.pendidikan?.includes('S2')),
                pendidikanS3: Boolean(item.pendidikan?.includes('S3')),
                mataKuliahDiampu: item.mataKuliahDiampu || null,
                kesesuaianBidang: item.kesesuaianKompetensi ?? true,
                sertifikasiDosen: item.sertifikatPendidik ?? true,
                sertifikasiKompetensi: item.sertifikatProfesi ?? false,
                prodiId: session.user.prodiId || null,
              },
            })
            insertedCount++
          }
        } else if (domain?.includes('Mahasiswa') || domain?.includes('PMB')) {
          for (const item of items) {
            await prisma.seleksiMahasiswaBaru.create({
              data: {
                tahunSemester: item.tahunAkademik || 'TS',
                dayaTampung: Number(item.dayaTampung || 0),
                jumlahPendaftar: Number(item.pendaftar || 0),
                jumlahLulusSeleksi: Number(item.lulusSeleksi || 0),
                mahasiswaBaruReguler: Number(item.mhsBaruReguler || 0),
                mahasiswaBaruTransfer: Number(item.mhsBaruTransfer || 0),
                mahasiswaAktifReguler: Number(item.mhsAktifReguler || 0),
                mahasiswaAktifTransfer: Number(item.mhsAktifTransfer || 0),
              },
            })
            insertedCount++
          }
        } else if (domain?.includes('Kerjasama') || domain?.includes('LP2M')) {
          for (const item of items) {
            const jns = item.bidang === 'Penelitian' ? 'N2' : item.bidang === 'Pengabdian' ? 'N3' : 'N1'
            await prisma.kerjasama.create({
              data: {
                namaLembaga: item.lembagaMitra || 'Mitra Universitas',
                tingkat: item.tingkat || 'Nasional',
                judulKegiatan: item.judulKegiatan || 'Kerjasama Tridharma',
                manfaat: item.manfaat || 'Peningkatan kapasitas prodi',
                tanggalMulai: new Date(),
                tanggalAkhir: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                jenisKerjasama: jns,
                fileMou: null,
              },
            })
            insertedCount++
          }
        } else if (domain?.includes('Tracer')) {
          for (const item of items) {
            await prisma.tracerStudy.create({
              data: {
                tahun: Number(item.tahun || new Date().getFullYear()),
                jumlahResponden: Number(item.responden || 100),
                rataWaktuTunggu: Number(item.waktuTungguBulan || 4.0),
                persenSesuaiBidang: Number(item.kesesuaianBidangPersen || 80),
                persenTempatKerjaLokal: 30,
                persenTempatKerjaNasional: 60,
                persenTempatKerjaInternasional: 10,
                skorKepuasanPengguna: 3.5,
              },
            })
            insertedCount++
          }
        }

        return NextResponse.json({
          success: true,
          message: `Berhasil menerapkan ${insertedCount} data ke basis data LKPS`,
          insertedCount,
        })
      }

      return NextResponse.json({ error: 'Aksi atau data tidak valid' }, { status: 400 })
    }

    // 2. Aksi Unggah Berkas & Ekstraksi Preview
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const domain = (formData.get('domain') as string) || 'auto'

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let rawRows: any[] = []

    if (file.name.endsWith('.json')) {
      const text = buffer.toString('utf-8')
      const json = JSON.parse(text)
      rawRows = Array.isArray(json) ? json : json.data || json.rows || [json]
    } else {
      // Excel (.xlsx / .xls) / CSV
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      rawRows = XLSX.utils.sheet_to_json(firstSheet)
    }

    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json({ error: 'File kosong atau format baris tidak dikenali' }, { status: 400 })
    }

    let parsedResult = null

    // Deteksi otomatis atau via domain form
    if (domain === 'sdm' || ('nidn' in rawRows[0] || 'nm_sdm' in rawRows[0] || 'nama_sdm' in rawRows[0])) {
      parsedResult = parseOneDataSDM(rawRows)
    } else if (domain === 'mahasiswa' || ('pendaftar' in rawRows[0] || 'tahun_akademik' in rawRows[0])) {
      parsedResult = parseOneDataMahasiswa(rawRows)
    } else if (domain === 'kerjasama' || ('lembaga_mitra' in rawRows[0] || 'mitra' in rawRows[0])) {
      parsedResult = parseOneDataKerjasama(rawRows)
    } else if (domain === 'tracer' || ('waktu_tunggu_bulan' in rawRows[0] || 'kesesuaian_tinggi' in rawRows[0])) {
      parsedResult = parseOneDataTracer(rawRows)
    } else {
      // Fallback parser SDM
      parsedResult = parseOneDataSDM(rawRows)
    }

    return NextResponse.json({
      success: true,
      message: 'Ekstraksi One Data berhasil',
      result: parsedResult,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal memproses file One Data' },
      { status: 500 }
    )
  }
}
