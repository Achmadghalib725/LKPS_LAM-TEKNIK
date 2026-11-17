import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ambil template baku resmi LKPS jika tersedia
    const templatePath = path.resolve('D:/laragon/www/SKRIPSI/Berkas Pedoman/S1/LKPS_Akademik_Vokasi-1.xlsx')
    let workbook: XLSX.WorkBook

    if (fs.existsSync(templatePath)) {
      const fileBuffer = fs.readFileSync(templatePath)
      workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    } else {
      workbook = XLSX.utils.book_new()
    }

    // 1. Populasi Data Tabel 1-1 (Kerjasama)
    const kerjasamaList = await prisma.kerjasama.findMany()
    const rowsKerjasama = [
      ['No.', 'Lembaga Mitra', 'Tingkat', 'Judul Kegiatan', 'Manfaat', 'Waktu & Durasi', 'Bukti'],
      ...kerjasamaList.map((k, i) => [
        i + 1,
        k.namaLembaga,
        k.tingkat,
        k.judulKegiatan,
        k.manfaat,
        `${k.tanggalMulai.toISOString().slice(0, 10)} s/d ${k.tanggalAkhir.toISOString().slice(0, 10)}`,
        k.fileMou || '-',
      ]),
    ]

    let sheet11 = workbook.Sheets['1-1']
    if (!sheet11) {
      sheet11 = XLSX.utils.aoa_to_sheet(rowsKerjasama)
      XLSX.utils.book_append_sheet(workbook, sheet11, '1-1')
    } else {
      // Sisipkan baris data ke sheet template yang sudah ada mulai baris ke-8
      XLSX.utils.sheet_add_aoa(sheet11, rowsKerjasama.slice(1), { origin: 'A8' })
    }

    // 2. Populasi Data Tabel 2a1 (Seleksi & Jumlah Mahasiswa)
    const mhsList = await prisma.seleksiMahasiswaBaru.findMany({
      orderBy: { createdAt: 'asc' },
    })
    const rowsMhs = [
      ['Tahun Semester', 'Daya Tampung', 'Pendaftar', 'Lulus', 'Baru Reguler', 'Baru Transfer', 'Aktif Reguler', 'Aktif Transfer'],
      ...mhsList.map((m) => [
        m.tahunSemester,
        m.dayaTampung,
        m.jumlahPendaftar,
        m.jumlahLulusSeleksi,
        m.mahasiswaBaruReguler,
        m.mahasiswaBaruTransfer,
        m.mahasiswaAktifReguler,
        m.mahasiswaAktifTransfer,
      ]),
    ]

    let sheet2a1 = workbook.Sheets['2a1']
    if (!sheet2a1) {
      sheet2a1 = XLSX.utils.aoa_to_sheet(rowsMhs)
      XLSX.utils.book_append_sheet(workbook, sheet2a1, '2a1')
    } else {
      XLSX.utils.sheet_add_aoa(sheet2a1, rowsMhs.slice(1), { origin: 'A6' })
    }

    // 3. Populasi Data Tabel 3a1 (Dosen Tetap Penugasan PS / DTPS 13 Kolom Baku)
    const dosenList = await prisma.dosenTetap.findMany()
    const rowsDosen = [
      [
        'No.',
        'Nama Dosen',
        'NIDN / NIDK',
        'Magister (S2)',
        'Doktor (S3)',
        'Bidang Keahlian',
        'Kesesuaian Kompetensi Inti',
        'Jabatan Akademik',
        'No. Sertifikat Pendidik',
        'Bidang Sertifikasi',
        'Lembaga Penerbit',
        'Mata Kuliah Diampu PS Akreditasi',
        'Kesesuaian dg MK',
        'Mata Kuliah Diampu PS Lain',
      ],
      ...dosenList.map((d, i) => [
        i + 1,
        d.nama,
        d.nidn || '-',
        d.prodiPascaS2 || (d.pendidikanS2 ? 'Magister (S2)' : '-'),
        d.prodiPascaS3 || (d.pendidikanS3 ? 'Doktor (S3)' : '-'),
        d.bidangKeahlian || '-',
        (d.kesesuaianKompetensi ?? true) ? 'V' : '-',
        d.jabatanAkademik,
        d.noSertifikatPendidik || (d.sertifikasiDosen ? 'V' : '-'),
        d.bidangSertifikasi || (d.sertifikasiKompetensi ? 'V' : '-'),
        d.lembagaSertifikasi || '-',
        d.mataKuliahDiampu || '-',
        d.kesesuaianBidang ? 'V' : '-',
        d.mataKuliahPSLain || '-',
      ]),
    ]

    let sheet3a1 = workbook.Sheets['3a1']
    if (!sheet3a1) {
      sheet3a1 = XLSX.utils.aoa_to_sheet(rowsDosen)
      XLSX.utils.book_append_sheet(workbook, sheet3a1, '3a1')
    } else {
      XLSX.utils.sheet_add_aoa(sheet3a1, rowsDosen.slice(1), { origin: 'A8' })
    }

    // 3.b Populasi Kinerja & Luaran Dosen (3b1 Rekognisi, 3b6 Sitasi, 3b7 Produk, 3b8 HKI)
    const luaranDosenList = await prisma.luaranDosen.findMany({ include: { dosen: true } })

    // 3.b.1 Rekognisi DTPS
    const rekognisiList = luaranDosenList.filter((l) => l.jenis.includes('Rekognisi') || l.jenis.includes('Staf Ahli') || l.jenis.includes('Visiting'))
    const rows3b1 = [
      ['No.', 'Nama Dosen', 'Bidang Keahlian', 'Rekognisi / Bukti', 'Tingkat', 'Tahun'],
      ...rekognisiList.map((r, i) => [
        i + 1,
        r.namaDosen || r.dosen?.nama || '-',
        r.dosen?.bidangKeahlian || '-',
        r.judul,
        r.detail || '-',
        r.tahun,
      ]),
    ]
    let sheet3b1 = workbook.Sheets['3b1']
    if (!sheet3b1) {
      sheet3b1 = XLSX.utils.aoa_to_sheet(rows3b1)
      XLSX.utils.book_append_sheet(workbook, sheet3b1, '3b1')
    } else {
      XLSX.utils.sheet_add_aoa(sheet3b1, rows3b1.slice(1), { origin: 'A8' })
    }

    // 3.b.6 Sitasi Karya Ilmiah
    const sitasiList = luaranDosenList.filter((l) => l.jenis.includes('Sitasi'))
    const rows3b6 = [
      ['No.', 'Nama Dosen', 'Judul Artikel yang Disitasi', 'Nama Jurnal / Jumlah Sitasi'],
      ...sitasiList.map((s, i) => [
        i + 1,
        s.namaDosen || s.dosen?.nama || '-',
        s.judul,
        s.detail || '-',
      ]),
    ]
    let sheet3b6 = workbook.Sheets['3b6']
    if (!sheet3b6) {
      sheet3b6 = XLSX.utils.aoa_to_sheet(rows3b6)
      XLSX.utils.book_append_sheet(workbook, sheet3b6, '3b6')
    } else {
      XLSX.utils.sheet_add_aoa(sheet3b6, rows3b6.slice(1), { origin: 'A6' })
    }

    // 3.b.7 Produk / Jasa Diadopsi Industri
    const produkList = luaranDosenList.filter((l) => l.jenis.includes('Produk') || l.jenis.includes('Jasa'))
    const rows3b7 = [
      ['No.', 'Nama Dosen', 'Nama Produk/Jasa', 'Deskripsi & Bukti Pengadopsi', 'Tahun'],
      ...produkList.map((p, i) => [
        i + 1,
        p.namaDosen || p.dosen?.nama || '-',
        p.judul,
        p.detail || '-',
        p.tahun,
      ]),
    ]
    let sheet3b7 = workbook.Sheets['3b7']
    if (!sheet3b7) {
      sheet3b7 = XLSX.utils.aoa_to_sheet(rows3b7)
      XLSX.utils.book_append_sheet(workbook, sheet3b7, '3b7')
    } else {
      XLSX.utils.sheet_add_aoa(sheet3b7, rows3b7.slice(1), { origin: 'A6' })
    }

    // 3.b.8 Luaran HKI & Paten (Bagian 1 Paten, Bagian 2 Hak Cipta & Buku)
    const hkiList = luaranDosenList.filter((l) => l.jenis.includes('HKI') || l.jenis.includes('Paten') || l.jenis.includes('Hak Cipta') || l.jenis.includes('Buku'))
    const rows3b81 = [
      ['No.', 'Nama Dosen', 'Judul Paten / HKI', 'Nomor Paten / Keterangan', 'Tahun'],
      ...hkiList.map((h, i) => [
        i + 1,
        h.namaDosen || h.dosen?.nama || '-',
        h.judul,
        h.detail || '-',
        h.tahun,
      ]),
    ]
    let sheet3b81 = workbook.Sheets['3b8-1']
    if (!sheet3b81) {
      sheet3b81 = XLSX.utils.aoa_to_sheet(rows3b81)
      XLSX.utils.book_append_sheet(workbook, sheet3b81, '3b8-1')
    } else {
      XLSX.utils.sheet_add_aoa(sheet3b81, rows3b81.slice(1), { origin: 'A7' })
    }

    // 4. Populasi Kriteria 4: Keuangan (4a) & Lab (4b)
    const danaList = await prisma.penggunaanDana.findMany({ orderBy: { tahunSemester: 'asc' } })
    const rowsDana = [
      ['Tahun Semester', 'Operasional Pendidikan', 'Penelitian Dosen', 'PkM Dosen', 'Investasi SDM', 'Investasi Sarana', 'Investasi Prasarana'],
      ...danaList.map((d) => [
        d.tahunSemester,
        d.biayaOperasionalPendidikan,
        d.biayaPenelitianDosen,
        d.biayaPkmDosen,
        d.investasiSdm,
        d.investasiSarana,
        d.investasiPrasarana,
      ]),
    ]
    let sheet4a = workbook.Sheets['4a']
    if (!sheet4a) {
      sheet4a = XLSX.utils.aoa_to_sheet(rowsDana)
      XLSX.utils.book_append_sheet(workbook, sheet4a, '4a')
    } else {
      XLSX.utils.sheet_add_aoa(sheet4a, rowsDana.slice(1), { origin: 'A7' })
    }

    const labList = await prisma.laboratorium.findMany({ orderBy: { namaLab: 'asc' } })
    const rowsLab = [
      ['No.', 'Nama Laboratorium', 'Peralatan Utama', 'Kepemilikan', 'Kondisi', 'Jam Penggunaan', 'Luas Ruangan (m2)'],
      ...labList.map((l, i) => [
        i + 1,
        l.namaLab,
        l.jenisPeralatan,
        l.kepemilikan,
        l.kondisi,
        l.jamPenggunaan,
        l.luasRuangan,
      ]),
    ]
    let sheet4b = workbook.Sheets['4b']
    if (!sheet4b) {
      sheet4b = XLSX.utils.aoa_to_sheet(rowsLab)
      XLSX.utils.book_append_sheet(workbook, sheet4b, '4b')
    } else {
      XLSX.utils.sheet_add_aoa(sheet4b, rowsLab.slice(1), { origin: 'A7' })
    }

    // 5. Populasi Kriteria 5: Kurikulum (5a-1) & MBKM (5b-1)
    const mkList = await prisma.mataKuliah.findMany({ orderBy: { kode: 'asc' } })
    const rowsMk = [
      ['Kode MK', 'Nama Mata Kuliah', 'SKS Teori', 'SKS Praktikum', 'CPL yang Dipetakan', 'Unit Penyelenggara'],
      ...mkList.map((m) => [
        m.kode,
        m.nama,
        m.sksTeori,
        m.sksPraktikum,
        m.cpl,
        m.unitPenyelenggara || '-',
      ]),
    ]
    let sheet5a1 = workbook.Sheets['5a-1']
    if (!sheet5a1) {
      sheet5a1 = XLSX.utils.aoa_to_sheet(rowsMk)
      XLSX.utils.book_append_sheet(workbook, sheet5a1, '5a-1')
    } else {
      XLSX.utils.sheet_add_aoa(sheet5a1, rowsMk.slice(1), { origin: 'A7' })
    }

    const mbkmList = await prisma.programMBKM.findMany({ orderBy: { namaMahasiswa: 'asc' } })
    const rowsMbkm = [
      ['No.', 'Nama Mahasiswa', 'NIM', 'Nama Mitra', 'SKS Konversi', 'Dosen Pembimbing', 'Tahun'],
      ...mbkmList.map((b, i) => [
        i + 1,
        b.namaMahasiswa,
        b.nim,
        b.namaMitra,
        b.sksKonversi,
        b.dosenPembimbing,
        b.tahun,
      ]),
    ]
    let sheet5b1 = workbook.Sheets['5b-1']
    if (!sheet5b1) {
      sheet5b1 = XLSX.utils.aoa_to_sheet(rowsMbkm)
      XLSX.utils.book_append_sheet(workbook, sheet5b1, '5b-1')
    } else {
      XLSX.utils.sheet_add_aoa(sheet5b1, rowsMbkm.slice(1), { origin: 'A7' })
    }

    // 6. Populasi Kriteria 6 & 7: Penelitian (6a) & PkM (7)
    const penelitianList = await prisma.penelitianDosen.findMany({
      where: { jenis: 'Penelitian' },
      orderBy: { tahun: 'desc' },
    })
    const rowsPenelitian = [
      ['No.', 'Nama Dosen', 'Judul Penelitian', 'Mahasiswa Terlibat', 'Tahun'],
      ...penelitianList.map((p, i) => [i + 1, p.namaDosen, p.judul, p.mahasiswaTerlibat, p.tahun]),
    ]
    let sheet6a = workbook.Sheets['6a']
    if (!sheet6a) {
      sheet6a = XLSX.utils.aoa_to_sheet(rowsPenelitian)
      XLSX.utils.book_append_sheet(workbook, sheet6a, '6a')
    } else {
      XLSX.utils.sheet_add_aoa(sheet6a, rowsPenelitian.slice(1), { origin: 'A7' })
    }

    const pkmList = await prisma.penelitianDosen.findMany({
      where: { jenis: 'PkM' },
      orderBy: { tahun: 'desc' },
    })
    const rowsPkm = [
      ['No.', 'Nama Dosen', 'Judul PkM', 'Mahasiswa Terlibat', 'Tahun'],
      ...pkmList.map((p, i) => [i + 1, p.namaDosen, p.judul, p.mahasiswaTerlibat, p.tahun]),
    ]
    let sheet7 = workbook.Sheets['7']
    if (!sheet7) {
      sheet7 = XLSX.utils.aoa_to_sheet(rowsPkm)
      XLSX.utils.book_append_sheet(workbook, sheet7, '7')
    } else {
      XLSX.utils.sheet_add_aoa(sheet7, rowsPkm.slice(1), { origin: 'A7' })
    }

    // 7. Populasi Kriteria 8: Luaran (8a IPK, 8b1 Prestasi, 8c Masa Studi, 8d1 Tracer)
    const ipkList = await prisma.ipkLulusan.findMany({ orderBy: { tahunSemester: 'asc' } })
    const rowsIpk = [
      ['Tahun Semester', 'IPK Minimum', 'IPK Rata-Rata', 'IPK Maksimum'],
      ...ipkList.map((x) => [x.tahunSemester, x.ipkMinimum, x.ipkRataRata, x.ipkMaksimum]),
    ]
    let sheet8a = workbook.Sheets['8a']
    if (!sheet8a) {
      sheet8a = XLSX.utils.aoa_to_sheet(rowsIpk)
      XLSX.utils.book_append_sheet(workbook, sheet8a, '8a')
    } else {
      XLSX.utils.sheet_add_aoa(sheet8a, rowsIpk.slice(1), { origin: 'A7' })
    }

    const prestasiList = await prisma.prestasiMahasiswa.findMany({ orderBy: { tahun: 'desc' } })
    const rowsPrestasi = [
      ['No.', 'Nama Mahasiswa', 'Nama Kegiatan', 'Tingkat', 'Penghargaan', 'Tahun', 'Jenis'],
      ...prestasiList.map((pr, i) => [
        i + 1,
        pr.namaMahasiswa,
        pr.namaKegiatan,
        pr.tingkat,
        pr.penghargaan,
        pr.tahun,
        pr.jenis,
      ]),
    ]
    let sheet8b1 = workbook.Sheets['8b1']
    if (!sheet8b1) {
      sheet8b1 = XLSX.utils.aoa_to_sheet(rowsPrestasi)
      XLSX.utils.book_append_sheet(workbook, sheet8b1, '8b1')
    } else {
      XLSX.utils.sheet_add_aoa(sheet8b1, rowsPrestasi.slice(1), { origin: 'A7' })
    }

    // 8. Populasi Kriteria 9: SPMI (9a)
    const spmiList = await prisma.dokumenSpmi.findMany({ orderBy: { jenisDokumen: 'asc' } })
    const rowsSpmi = [
      ['No.', 'Jenis Dokumen', 'Status Ketersediaan', 'Keterangan'],
      ...spmiList.map((s, i) => [i + 1, s.jenisDokumen, s.tersedia ? 'Tersedia' : 'Belum Ada', s.keterangan || '-']),
    ]
    let sheet9a = workbook.Sheets['9a']
    if (!sheet9a) {
      sheet9a = XLSX.utils.aoa_to_sheet(rowsSpmi)
      XLSX.utils.book_append_sheet(workbook, sheet9a, '9a')
    } else {
      XLSX.utils.sheet_add_aoa(sheet9a, rowsSpmi.slice(1), { origin: 'A7' })
    }

    // Generate output Excel binary buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    })

    const filename = `LKPS_LAM_Teknik_${new Date().toISOString().slice(0, 10)}.xlsx`

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal mengekspor file Excel LKPS' },
      { status: 500 }
    )
  }
}
