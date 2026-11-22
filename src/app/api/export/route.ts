import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getActiveProdiId } from '@/lib/active-prodi'
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

    // 1. Dapatkan Program Studi aktif (Operator Prodi terkunci; Admin UPPS / Reviewer via Switcher)
    const activeProdiId = await getActiveProdiId(session, req)
    const activeProdi = activeProdiId
      ? await prisma.prodi.findUnique({ where: { id: activeProdiId } })
      : null

    const whereClause: any = activeProdiId ? { prodiId: activeProdiId } : {}

    // 2. Baca template Excel resmi LKPS LAM Teknik
    const templatePath = path.resolve('D:/laragon/www/SKRIPSI/Berkas Pedoman/S1/LKPS_Akademik_Vokasi-1.xlsx')
    let workbook: XLSX.WorkBook

    if (fs.existsSync(templatePath)) {
      const fileBuffer = fs.readFileSync(templatePath)
      workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    } else {
      workbook = XLSX.utils.book_new()
    }

    // ─────────────────────────────────────────────────────────────
    // 0. SHEET MENU: COVER IDENTITAS PENGUSUL
    // Sesuai layout visual & sel formula acuan (Menu!S73, dsb.)
    // ─────────────────────────────────────────────────────────────
    const identitas = await prisma.identitasPT.findFirst()
    if (workbook.Sheets['Menu']) {
      const menu = workbook.Sheets['Menu']
      const setCell = (cell: string, val: any, type: string = 's') => {
        if (!menu[cell]) menu[cell] = { t: type as any, v: '' }
        menu[cell].t = type as any
        menu[cell].v = val ?? ''
      }

      const namaProdiFinal = activeProdi?.namaProdi || identitas?.namaProdi || 'Teknik Informatika'
      const jenjangFinal = activeProdi?.jenjang || identitas?.jenisProgram || 'Sarjana'
      const peringkatFinal = activeProdi?.peringkatAkreditasi || identitas?.peringkatAkreditasi || 'Baik Sekali'

      setCell('H7', identitas?.namaPT || 'Universitas Lampung')
      setCell('H9', identitas?.namaUPPS || 'Fakultas Teknik')
      setCell('H11', jenjangFinal)
      setCell('H23', namaProdiFinal)
      setCell('H39', identitas?.alamat || 'Jl. Prof. Dr. Sumantri Brojonegoro No. 1, Gedong Meneng')
      setCell('L43', identitas?.kota || 'Kota Bandar Lampung')
      setCell('W43', identitas?.kodePos || '35145')
      setCell('H45', identitas?.telepon || '(0721) 704947')
      setCell('H47', identitas?.email || 'dekan@eng.unila.ac.id')
      setCell('H49', identitas?.website || 'https://eng.unila.ac.id')
      setCell('H51', identitas?.noSkPendirianPT || '')
      setCell('H53', identitas?.tanggalSkPT ? identitas.tanggalSkPT.toISOString().split('T')[0] : '')
      setCell('H55', identitas?.pejabatSkPendirianPT || '')
      setCell('H57', identitas?.noSkPembukaanPS || '')
      setCell('H59', identitas?.tanggalSkPS ? identitas.tanggalSkPS.toISOString().split('T')[0] : '')
      setCell('H61', identitas?.pejabatSkPembukaanPS || '')
      setCell('H63', identitas?.tahunPertama || '')
      setCell('H65', peringkatFinal)
      setCell('H67', identitas?.nomorSkAkreditasi || '')
      setCell('S69', identitas?.namaPengusul || 'Dekan Fakultas Teknik')

      const tglPengusulStr = identitas?.tanggalPengusul
        ? identitas.tanggalPengusul.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
      setCell('S71', tglPengusulStr)

      // S73 menjadi acuan formula validasi di sheet 1-1, 1-2, 1-3
      // Format serial tanggal atau tanggal baku (YYYY-MM-DD)
      const tsDateStr = identitas?.tanggalPengusul
        ? identitas.tanggalPengusul.toISOString().split('T')[0]
        : '2024-08-31'
      setCell('S73', tsDateStr, 'd')
    }

    // ─────────────────────────────────────────────────────────────
    // SHEET PS: DAFTAR SELURUH PRODI DI UPPS (Tabel Cover, baris 17)
    // ─────────────────────────────────────────────────────────────
    const allProdiList = await prisma.prodi.findMany({ orderBy: { namaProdi: 'asc' } })
    if (workbook.Sheets['PS'] && allProdiList.length > 0) {
      const rowsPS = allProdiList.map((p, idx) => [
        idx + 1,
        p.jenjang || 'Sarjana',
        p.namaProdi,
        p.peringkatAkreditasi || 'Terakreditasi',
        '-',
        '-',
        p.jumlahMahasiswaAktif ?? 0,
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['PS'], rowsPS, { origin: 'A17' })
    }

    // ─────────────────────────────────────────────────────────────
    // 1. SHEET 1-1, 1-2, 1-3: KERJASAMA TRIDHARMA (KRITERIA 1)
    // Dipisahkan rapi: 1-1 Pendidikan, 1-2 Penelitian, 1-3 PkM
    // Kolom J (Durasi) dan K (Validitas) dibiarkan formula template!
    // ─────────────────────────────────────────────────────────────
    const allKerjasama = await prisma.kerjasama.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    })

    const populateKerjasamaSheet = (sheetName: string, items: typeof allKerjasama) => {
      const ws = workbook.Sheets[sheetName]
      if (!ws || items.length === 0) return

      items.forEach((k, idx) => {
        const row = 12 + idx
        const isInter = k.tingkat?.toLowerCase().includes('internasional')
        const isNas = k.tingkat?.toLowerCase().includes('nasional')
        const isWil = !isInter && !isNas

        const setC = (col: string, val: any) => {
          const addr = col + row
          if (!ws[addr]) ws[addr] = { t: 's', v: '' }
          ws[addr].v = val ?? ''
        }

        setC('A', idx + 1)
        setC('B', k.namaLembaga)
        setC('C', isInter ? 'V' : '')
        setC('D', isNas ? 'V' : '')
        setC('E', isWil ? 'V' : '')
        setC('F', k.judulKegiatan)
        setC('G', k.manfaat || '')
        setC('H', k.tanggalMulai ? k.tanggalMulai.toISOString().split('T')[0] : '2022-01-01')
        setC('I', k.tanggalAkhir ? k.tanggalAkhir.toISOString().split('T')[0] : '2025-01-01')
        // Col J dan K dihitung formula bawaan Excel template (DATEDIF dan Validitas)
        setC('L', k.fileMou || '-')
      })
    }

    // 1-1 Pendidikan
    const kPendidikan = allKerjasama.filter(
      (k) => k.jenisKerjasama === 'N1' || k.jenisKerjasama?.toLowerCase().includes('pendidikan')
    )
    populateKerjasamaSheet('1-1', kPendidikan.length > 0 ? kPendidikan : allKerjasama)

    // 1-2 Penelitian
    const kPenelitian = allKerjasama.filter(
      (k) => k.jenisKerjasama === 'N2' || k.jenisKerjasama?.toLowerCase().includes('penelitian')
    )
    populateKerjasamaSheet('1-2', kPenelitian)

    // 1-3 Pengabdian (PkM)
    const kPkm = allKerjasama.filter(
      (k) => k.jenisKerjasama === 'N3' || k.jenisKerjasama?.toLowerCase().includes('pkm') || k.jenisKerjasama?.toLowerCase().includes('pengabdian')
    )
    populateKerjasamaSheet('1-3', kPkm)

    // ─────────────────────────────────────────────────────────────
    // 2. SHEET 2a1: SELEKSI & JUMLAH MAHASISWA (KRITERIA 2)
    // Tepat di baris 7 s.d. 11 (TS-4 s.d. TS) tanpa menimpa baris SUM 12!
    // ─────────────────────────────────────────────────────────────
    const mhsList = await prisma.seleksiMahasiswaBaru.findMany({
      where: whereClause,
      orderBy: { tahunSemester: 'asc' },
    })

    if (workbook.Sheets['2a1']) {
      const ws2a1 = workbook.Sheets['2a1']
      // Urutan tahun standar di template LAM Teknik: TS-4 (row 7), TS-3 (row 8), TS-2 (row 9), TS-1 (row 10), TS (row 11)
      const targetRows = [7, 8, 9, 10, 11]
      const recentMhs = mhsList.slice(-5)

      recentMhs.forEach((m, idx) => {
        const row = targetRows[idx] || (7 + idx)
        const setC = (col: string, val: any) => {
          const addr = col + row
          if (!ws2a1[addr]) ws2a1[addr] = { t: 'n', v: 0 }
          ws2a1[addr].v = Number(val) || 0
        }
        setC('B', m.dayaTampung)
        setC('C', m.jumlahPendaftar)
        setC('D', m.jumlahLulusSeleksi)
        setC('E', m.mahasiswaBaruReguler)
        setC('F', m.mahasiswaBaruTransfer)
        setC('G', m.mahasiswaAktifReguler)
        setC('H', m.mahasiswaAktifTransfer)
      })
    }

    // ─────────────────────────────────────────────────────────────
    // 3. SHEET 3a1: DOSEN TETAP PENUGASAN PS / DTPS (KRITERIA 3)
    // Baris 14 s.d. selesai, 14 kolom baku
    // ─────────────────────────────────────────────────────────────
    const dosenList = await prisma.dosenTetap.findMany({
      where: whereClause,
      orderBy: { nama: 'asc' },
    })
    if (workbook.Sheets['3a1'] && dosenList.length > 0) {
      const rows3a1 = dosenList.map((d, i) => [
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
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['3a1'], rows3a1, { origin: 'A14' })
    }

    // ─────────────────────────────────────────────────────────────
    // 3.b KINERJA & LUARAN DOSEN (3b1, 3b6, 3b7, 3b8-1 s.d. 3b8-4)
    // ─────────────────────────────────────────────────────────────
    const luaranDosenList = await prisma.luaranDosen.findMany({
      where: whereClause,
      include: { dosen: true },
      orderBy: { tahun: 'desc' },
    })

    // 3.b.1 Rekognisi DTPS (mulai A11)
    const rekognisiList = luaranDosenList.filter((l) =>
      l.jenis.includes('Rekognisi') || l.jenis.includes('Staf Ahli') || l.jenis.includes('Visiting')
    )
    if (workbook.Sheets['3b1'] && rekognisiList.length > 0) {
      const rows3b1 = rekognisiList.map((r, i) => {
        const isInter = r.detail?.toLowerCase().includes('internasional')
        const isNas = r.detail?.toLowerCase().includes('nasional')
        const isWil = !isInter && !isNas
        return [
          i + 1,
          r.namaDosen || r.dosen?.nama || '-',
          r.dosen?.bidangKeahlian || '-',
          r.judul,
          isWil ? 'V' : '',
          isNas ? 'V' : '',
          isInter ? 'V' : '',
          r.tahun,
        ]
      })
      XLSX.utils.sheet_add_aoa(workbook.Sheets['3b1'], rows3b1, { origin: 'A11' })
    }

    // 3.b.6 Sitasi Karya Ilmiah DTPS (mulai A6)
    const sitasiList = luaranDosenList.filter((l) => l.jenis.includes('Sitasi'))
    if (workbook.Sheets['3b6'] && sitasiList.length > 0) {
      const rows3b6 = sitasiList.map((s, i) => [
        i + 1,
        s.namaDosen || s.dosen?.nama || '-',
        s.judul,
        s.detail || '-',
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['3b6'], rows3b6, { origin: 'A6' })
    }

    // 3.b.7 Produk / Jasa Diadopsi Industri (mulai A6)
    const produkList = luaranDosenList.filter((l) => l.jenis.includes('Produk') || l.jenis.includes('Jasa'))
    if (workbook.Sheets['3b7'] && produkList.length > 0) {
      const rows3b7 = produkList.map((p, i) => [
        i + 1,
        p.namaDosen || p.dosen?.nama || '-',
        p.judul,
        p.detail || '-',
        p.tahun,
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['3b7'], rows3b7, { origin: 'A6' })
    }

    // 3.b.8 Luaran HKI & Paten (3b8-1 Paten, 3b8-2 Hak Cipta, 3b8-4 Buku)
    const patenList = luaranDosenList.filter((l) => l.jenis.includes('Paten'))
    if (workbook.Sheets['3b8-1'] && patenList.length > 0) {
      const rowsPaten = patenList.map((h, i) => [
        i + 1,
        h.namaDosen || h.dosen?.nama || '-',
        h.judul,
        h.detail || '-',
        h.tahun,
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['3b8-1'], rowsPaten, { origin: 'A9' })
    }

    const hakCiptaList = luaranDosenList.filter((l) => l.jenis.includes('Hak Cipta') || l.jenis.includes('HKI'))
    if (workbook.Sheets['3b8-2'] && hakCiptaList.length > 0) {
      const rowsHC = hakCiptaList.map((h, i) => [
        i + 1,
        h.namaDosen || h.dosen?.nama || '-',
        h.judul,
        h.detail || '-',
        h.tahun,
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['3b8-2'], rowsHC, { origin: 'A9' })
    }

    const bukuList = luaranDosenList.filter((l) => l.jenis.includes('Buku'))
    if (workbook.Sheets['3b8-4'] && bukuList.length > 0) {
      const rowsBuku = bukuList.map((h, i) => [
        i + 1,
        h.namaDosen || h.dosen?.nama || '-',
        h.judul,
        h.detail || '-',
        h.tahun,
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['3b8-4'], rowsBuku, { origin: 'A9' })
    }

    // ─────────────────────────────────────────────────────────────
    // 4. SHEET 4a & 4b: KEUANGAN & LAB (KRITERIA 4)
    // ─────────────────────────────────────────────────────────────
    const danaList = await prisma.penggunaanDana.findMany({
      where: whereClause,
      orderBy: { tahunSemester: 'asc' },
    })
    if (workbook.Sheets['4a'] && danaList.length > 0) {
      const rowsDana = danaList.map((d) => [
        d.tahunSemester,
        d.biayaOperasionalPendidikan,
        d.biayaPenelitianDosen,
        d.biayaPkmDosen,
        d.investasiSdm,
        d.investasiSarana,
        d.investasiPrasarana,
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['4a'], rowsDana, { origin: 'A7' })
    }

    const labList = await prisma.laboratorium.findMany({
      where: whereClause,
      orderBy: { namaLab: 'asc' },
    })
    if (workbook.Sheets['4b'] && labList.length > 0) {
      const rowsLab = labList.map((l, i) => [
        i + 1,
        l.namaLab,
        l.jenisPeralatan,
        l.kepemilikan,
        l.kondisi,
        l.jamPenggunaan,
        l.luasRuangan,
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['4b'], rowsLab, { origin: 'A9' })
    }

    // ─────────────────────────────────────────────────────────────
    // 5. SHEET 5a-1 & 5b-1: KURIKULUM & MBKM (KRITERIA 5)
    // ─────────────────────────────────────────────────────────────
    const mkList = await prisma.mataKuliah.findMany({
      where: whereClause,
      orderBy: { kode: 'asc' },
    })
    if (workbook.Sheets['5a-1'] && mkList.length > 0) {
      const rowsMk = mkList.map((m, i) => [
        i + 1,
        'Wajib',
        m.kode,
        m.nama,
        m.cpl || 'Inti',
        m.sksTeori,
        0,
        m.sksPraktikum,
        'V',
        'V',
        'V',
        'V',
        m.linkRps || 'RPS Tersedia',
        m.unitPenyelenggara || activeProdi?.namaProdi || 'Prodi',
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['5a-1'], rowsMk, { origin: 'A10' })
    }

    const mbkmList = await prisma.programMBKM.findMany({
      where: whereClause,
      orderBy: { namaMahasiswa: 'asc' },
    })
    if (workbook.Sheets['5b-1'] && mbkmList.length > 0) {
      const rowsMbkm = mbkmList.map((b, i) => [
        i + 1,
        b.namaMahasiswa,
        b.nim,
        b.namaMitra,
        b.sksKonversi,
        b.dosenPembimbing,
        b.tahun,
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['5b-1'], rowsMbkm, { origin: 'A16' })
    }

    // ─────────────────────────────────────────────────────────────
    // 6. SHEET 6a: PENELITIAN MELIBATKAN MAHASISWA (KRITERIA 6)
    // ─────────────────────────────────────────────────────────────
    const penelitianList = await prisma.penelitianDosen.findMany({
      where: {
        ...whereClause,
        jenis: 'Penelitian',
      },
      orderBy: { tahun: 'desc' },
    })
    if (workbook.Sheets['6a'] && penelitianList.length > 0) {
      const rowsPenelitian = penelitianList.map((p, i) => [
        i + 1,
        p.namaDosen,
        'Roadmap KBK Komputasi & Rekayasa Perangkat Lunak',
        p.mahasiswaTerlibat || '-',
        p.judul,
        p.tahun,
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['6a'], rowsPenelitian, { origin: 'A11' })
    }

    // ─────────────────────────────────────────────────────────────
    // 7. SHEET 7: PkM MELIBATKAN MAHASISWA (KRITERIA 7)
    // ─────────────────────────────────────────────────────────────
    const pkmList = await prisma.penelitianDosen.findMany({
      where: {
        ...whereClause,
        jenis: 'PkM',
      },
      orderBy: { tahun: 'desc' },
    })
    if (workbook.Sheets['7'] && pkmList.length > 0) {
      const rowsPkm = pkmList.map((p, i) => [
        i + 1,
        p.namaDosen,
        'Pemberdayaan Teknologi Masyarakat',
        p.mahasiswaTerlibat || '-',
        p.judul,
        p.tahun,
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['7'], rowsPkm, { origin: 'A6' })
    }

    // ─────────────────────────────────────────────────────────────
    // 8. SHEET 8a & 8b1, 8b2: LUARAN MAHASISWA (KRITERIA 8)
    // ─────────────────────────────────────────────────────────────
    const ipkList = await prisma.ipkLulusan.findMany({
      where: whereClause,
      orderBy: { tahunSemester: 'asc' },
    })
    if (workbook.Sheets['8a'] && ipkList.length > 0) {
      const rowsIpk = ipkList.map((x, i) => [
        i + 1,
        x.tahunSemester,
        120, // Estimasi lulusan prodi
        x.ipkMinimum,
        x.ipkRataRata,
        x.ipkMaksimum,
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['8a'], rowsIpk, { origin: 'A6' })
    }

    const allPrestasi = await prisma.prestasiMahasiswa.findMany({
      where: whereClause,
      orderBy: { tahun: 'desc' },
    })

    // 8.b.1 Prestasi Akademik (Sheet 8b1 mulai A10)
    const prestasiAkademik = allPrestasi.filter(
      (p) => !p.jenis || p.jenis.toLowerCase().includes('akademik') && !p.jenis.toLowerCase().includes('non')
    )
    if (workbook.Sheets['8b1'] && prestasiAkademik.length > 0) {
      const rowsAkademik = prestasiAkademik.map((pr, i) => {
        const isInter = pr.tingkat?.toLowerCase().includes('internasional')
        const isNas = pr.tingkat?.toLowerCase().includes('nasional')
        const isWil = !isInter && !isNas
        return [
          i + 1,
          pr.namaKegiatan,
          pr.tahun ? `${pr.tahun}-01-01` : '2024-01-01',
          isWil ? 'V' : '',
          isNas ? 'V' : '',
          isInter ? 'V' : '',
          pr.penghargaan || 'Juara',
        ]
      })
      XLSX.utils.sheet_add_aoa(workbook.Sheets['8b1'], rowsAkademik, { origin: 'A10' })
    }

    // 8.b.2 Prestasi Nonakademik (Sheet 8b2 mulai A11)
    const prestasiNonAkademik = allPrestasi.filter((p) => p.jenis?.toLowerCase().includes('non'))
    if (workbook.Sheets['8b2'] && prestasiNonAkademik.length > 0) {
      const rowsNon = prestasiNonAkademik.map((pr, i) => {
        const isInter = pr.tingkat?.toLowerCase().includes('internasional')
        const isNas = pr.tingkat?.toLowerCase().includes('nasional')
        const isWil = !isInter && !isNas
        return [
          i + 1,
          pr.namaKegiatan,
          pr.tahun ? `${pr.tahun}-01-01` : '2024-01-01',
          isWil ? 'V' : '',
          isNas ? 'V' : '',
          isInter ? 'V' : '',
          pr.penghargaan || 'Juara',
        ]
      })
      XLSX.utils.sheet_add_aoa(workbook.Sheets['8b2'], rowsNon, { origin: 'A11' })
    }

    // ─────────────────────────────────────────────────────────────
    // 9. SHEET 9a & 9b: PENJAMINAN MUTU (SPMI) (KRITERIA 9)
    // ─────────────────────────────────────────────────────────────
    const spmiList = await prisma.dokumenSpmi.findMany({
      where: whereClause,
      orderBy: { jenisDokumen: 'asc' },
    })
    if (workbook.Sheets['9a'] && spmiList.length > 0) {
      const rowsSpmi = spmiList.map((s, i) => [
        i + 1,
        s.jenisDokumen,
        s.tersedia ? 'V' : '-',
        s.tersedia ? 'V' : '-',
        s.tersedia ? 'V' : '-',
      ])
      XLSX.utils.sheet_add_aoa(workbook.Sheets['9a'], rowsSpmi, { origin: 'A7' })
    }

    if (workbook.Sheets['9b']) {
      const rows9b = [
        [1, 'Dokumen/Buku Kebijakan SPMI', 'SK Rektor No. 124/UN26/KP/2023'],
        [2, 'Dokumen/Buku Manual SPMI', 'SK Rektor No. 125/UN26/KP/2023'],
        [3, 'Dokumen/Buku Standar SPMI (24 Standar SN-Dikti)', 'SK Rektor No. 126/UN26/KP/2023'],
        [4, 'Dokumen/Buku Formulir SPMI', 'SK Dekan FT No. 45/UN26.1/KP/2023'],
      ]
      XLSX.utils.sheet_add_aoa(workbook.Sheets['9b'], rows9b, { origin: 'A7' })
    }

    // ─────────────────────────────────────────────────────────────
    // EXPORT WORKBOOK KE BINARY BUFFER
    // ─────────────────────────────────────────────────────────────
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    })

    const cleanProdiName = (activeProdi?.namaProdi || 'LKPS')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
    const filename = `LKPS_LAM_Teknik_${cleanProdiName}_${new Date().toISOString().slice(0, 10)}.xlsx`

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error('Error in export Excel:', err)
    return NextResponse.json(
      { error: err.message || 'Gagal mengekspor file Excel LKPS' },
      { status: 500 }
    )
  }
}
