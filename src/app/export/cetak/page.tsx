import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getActiveProdiId } from '@/lib/active-prodi'
import Link from 'next/link'
import PrintButton from './print-button'

export const dynamic = 'force-dynamic'

export default async function CetakLkpsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/export/cetak')

  const activeProdiId = await getActiveProdiId(session)
  const activeProdi = activeProdiId
    ? await prisma.prodi.findUnique({ where: { id: activeProdiId } })
    : null

  const whereClause: any = activeProdiId ? { prodiId: activeProdiId } : {}

  const identitas = await prisma.identitasPT.findFirst()
  const allProdiList = await prisma.prodi.findMany({ orderBy: { namaProdi: 'asc' } })
  const timList = await prisma.timPenyusun.findMany({ orderBy: { createdAt: 'asc' } })

  const kerjasamaList = await prisma.kerjasama.findMany({
    where: whereClause,
    orderBy: { createdAt: 'asc' },
  })

  const mhsList = await prisma.seleksiMahasiswaBaru.findMany({
    where: whereClause,
    orderBy: { tahunSemester: 'asc' },
  })

  const dosenList = await prisma.dosenTetap.findMany({
    where: whereClause,
    orderBy: { nama: 'asc' },
  })

  const luaranDosenList = await prisma.luaranDosen.findMany({
    where: whereClause,
    include: { dosen: true },
    orderBy: { tahun: 'desc' },
  })

  const danaList = await prisma.penggunaanDana.findMany({
    where: whereClause,
    orderBy: { tahunSemester: 'asc' },
  })

  const labList = await prisma.laboratorium.findMany({
    where: whereClause,
    orderBy: { namaLab: 'asc' },
  })

  const mkList = await prisma.mataKuliah.findMany({
    where: whereClause,
    orderBy: { kode: 'asc' },
  })

  const mbkmList = await prisma.programMBKM.findMany({
    where: whereClause,
    orderBy: { namaMahasiswa: 'asc' },
  })

  const penelitianList = await prisma.penelitianDosen.findMany({
    where: { ...whereClause, jenis: 'Penelitian' },
    orderBy: { tahun: 'desc' },
  })

  const pkmList = await prisma.penelitianDosen.findMany({
    where: { ...whereClause, jenis: 'PkM' },
    orderBy: { tahun: 'desc' },
  })

  const ipkList = await prisma.ipkLulusan.findMany({
    where: whereClause,
    orderBy: { tahunSemester: 'asc' },
  })

  const prestasiList = await prisma.prestasiMahasiswa.findMany({
    where: whereClause,
    orderBy: { tahun: 'desc' },
  })

  const spmiList = await prisma.dokumenSpmi.findMany({
    where: whereClause,
    orderBy: { jenisDokumen: 'asc' },
  })

  const namaProdiFinal = activeProdi?.namaProdi || identitas?.namaProdi || 'Teknik Informatika'
  const jenjangFinal = activeProdi?.jenjang || identitas?.jenisProgram || 'Sarjana'
  const namaPTFinal = identitas?.namaPT || 'Universitas Lampung'
  const namaUPPSFinal = identitas?.namaUPPS || 'Fakultas Teknik'
  const kotaFinal = identitas?.kota || 'Bandar Lampung'
  const tahunTSFinal = identitas?.tahunTS || '2024/2025'

  return (
    <div style={{ backgroundColor: '#525659', minHeight: '100vh', padding: '0 0 60px 0' }}>
      {/* Action Bar Floating (Hidden saat print) */}
      <div
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#1e293b',
          color: '#ffffff',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/export"
            style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Kembali ke Menu Ekspor
          </Link>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            Pratinjau Dokumen Cetak LKPS – {jenjangFinal} {namaProdiFinal}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PrintButton />
        </div>
      </div>

      {/* Lembar Dokumen Kertas A4 */}
      <div
        className="print-document"
        style={{
          maxWidth: '210mm',
          margin: '30px auto',
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: '12pt',
          lineHeight: '1.4',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}
      >
        {/* CSS Khusus Cetak / Print */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
            .no-print { display: none !important; }
            .print-document {
              max-width: 100% !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
            }
          }
          @page {
            size: A4 portrait;
            margin: 25mm 20mm 20mm 20mm;
          }
          table.report-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5pt;
            margin-top: 10px;
            margin-bottom: 16px;
          }
          table.report-table th, table.report-table td {
            border: 1px solid #000;
            padding: 5px 6px;
            vertical-align: top;
          }
          table.report-table th {
            background-color: #f1f5f9;
            text-align: center;
            font-weight: bold;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
        ` }} />

        {/* ═══════════════════════════════════════════════════════════════════
            HALAMAN 1: HALAMAN MUKA (COVER RESMI SESUAI HALAMAN 1 PANDUAN)
            ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="page-break"
          style={{
            minHeight: '270mm',
            padding: '40mm 25mm 30mm 25mm',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <div style={{ fontSize: '11pt', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '40px' }}>
              HALAMAN MUKA
            </div>

            {/* Lambang Perguruan Tinggi */}
            <div style={{ margin: '0 auto 40px', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '2px solid #0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  padding: '8px',
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1' }}>UNILA</div>
                <div style={{ fontSize: '7.5pt', fontWeight: 'bold', marginTop: '2px' }}>UNIVERSITAS LAMPUNG</div>
                <div style={{ fontSize: '6.5pt', color: '#64748b' }}>EST. 1965</div>
              </div>
            </div>

            <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
              LAPORAN KINERJA PROGRAM STUDI
            </h1>

            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 20px 0', textTransform: 'uppercase' }}>
              AKREDITASI PROGRAM STUDI
            </h2>

            <div style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 30px 0', textTransform: 'uppercase', color: '#0f172a' }}>
              PROGRAM {jenjangFinal.toUpperCase()} {namaProdiFinal.toUpperCase()}
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>
              {namaPTFinal.toUpperCase()}
            </div>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '24px' }}>
              {namaUPPSFinal.toUpperCase()}
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
              {kotaFinal.toUpperCase()}
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>
              TAHUN {tahunTSFinal}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            HALAMAN 2: IDENTITAS PENGUSUL (SESUAI HALAMAN 2 PANDUAN)
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="page-break" style={{ minHeight: '270mm', padding: '25mm 25mm', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13pt', marginBottom: '24px' }}>
            IDENTITAS PENGUSUL
          </div>

          <table style={{ width: '100%', fontSize: '11pt', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <tbody>
              <tr>
                <td style={{ width: '38%', padding: '4px 0' }}>Perguruan Tinggi</td>
                <td style={{ width: '3%' }}>:</td>
                <td style={{ width: '59%', fontWeight: 'bold' }}>{namaPTFinal}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Unit Pengelola Program Studi</td>
                <td>:</td>
                <td style={{ fontWeight: 'bold' }}>{namaUPPSFinal}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Jenis Program</td>
                <td>:</td>
                <td>{jenjangFinal}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Nama Program Studi</td>
                <td>:</td>
                <td style={{ fontWeight: 'bold' }}>{namaProdiFinal}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Alamat</td>
                <td>:</td>
                <td>{identitas?.alamat || 'Jl. Prof. Dr. Sumantri Brojonegoro No. 1, Gedong Meneng'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Nomor Telepon</td>
                <td>:</td>
                <td>{identitas?.telepon || '(0721) 704947'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>E-Mail dan Website</td>
                <td>:</td>
                <td>{identitas?.email || 'dekan@eng.unila.ac.id'} / {identitas?.website || 'https://eng.unila.ac.id'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Nomor SK Pendirian PT <sup>1)</sup></td>
                <td>:</td>
                <td>{identitas?.noSkPendirianPT || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Tanggal SK Pendirian PT</td>
                <td>:</td>
                <td>{identitas?.tanggalSkPT ? identitas.tanggalSkPT.toISOString().split('T')[0] : '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Pejabat Penandatangan SK Pendirian PT</td>
                <td>:</td>
                <td>{identitas?.pejabatSkPendirianPT || 'Menteri Pendidikan dan Kebudayaan'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Nomor SK Pembukaan PS <sup>2)</sup></td>
                <td>:</td>
                <td>{identitas?.noSkPembukaanPS || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Tanggal SK Pembukaan PS</td>
                <td>:</td>
                <td>{identitas?.tanggalSkPS ? identitas.tanggalSkPS.toISOString().split('T')[0] : '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Pejabat Penandatangan SK Pembukaan PS</td>
                <td>:</td>
                <td>{identitas?.pejabatSkPembukaanPS || 'Direktur Jenderal Pendidikan Tinggi'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Tahun Pertama Kali Menerima Mahasiswa</td>
                <td>:</td>
                <td>{identitas?.tahunPertama || '2005'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Peringkat Terbaru Akreditasi PS</td>
                <td>:</td>
                <td style={{ fontWeight: 'bold' }}>{activeProdi?.peringkatAkreditasi || identitas?.peringkatAkreditasi || 'Baik Sekali'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>Nomor SK BAN-PT / LAM Teknik</td>
                <td>:</td>
                <td>{identitas?.nomorSkAkreditasi || '-'}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontWeight: 'bold', fontSize: '10.5pt', marginBottom: '8px' }}>
            Daftar Program Studi di Unit Pengelola Program Studi (UPPS)
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th style={{ width: '35px' }}>No.</th>
                <th>Jenis Program</th>
                <th>Nama Program Studi</th>
                <th>Status / Peringkat</th>
                <th>No. dan Tgl. SK</th>
                <th>Tgl. Kadaluarsa</th>
                <th>Jumlah Mahasiswa saat TS <sup>4)</sup></th>
              </tr>
            </thead>
            <tbody>
              {allProdiList.map((p, idx) => (
                <tr key={p.id}>
                  <td className="text-center">{idx + 1}</td>
                  <td>{p.jenjang}</td>
                  <td style={{ fontWeight: p.id === activeProdiId ? 'bold' : 'normal' }}>
                    {p.namaProdi} {p.id === activeProdiId ? '*(Diakreditasi)' : ''}
                  </td>
                  <td className="text-center">{p.peringkatAkreditasi || 'Terakreditasi'}</td>
                  <td className="text-center">-</td>
                  <td className="text-center">-</td>
                  <td className="text-center">{p.jumlahMahasiswaAktif ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontSize: '9pt', color: '#334155', marginTop: '14px', lineHeight: '1.4' }}>
            <strong>Keterangan:</strong><br />
            1) Lampirkan salinan Surat Keputusan Pendirian Perguruan Tinggi.<br />
            2) Lampirkan salinan Surat Keputusan Pembukaan Program Studi.<br />
            3) Lampirkan salinan Surat Keputusan Akreditasi Program Studi terbaru.<br />
            4) Diisi dengan jumlah mahasiswa aktif di masing-masing PS saat TS.
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            HALAMAN 3: IDENTITAS TIM PENYUSUN (SESUAI HALAMAN 3 PANDUAN)
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="page-break" style={{ minHeight: '270mm', padding: '25mm 25mm', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13pt', marginBottom: '8px' }}>
            IDENTITAS TIM PENYUSUN
          </div>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12pt', marginBottom: '32px' }}>
            LAPORAN KINERJA PROGRAM STUDI
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {(timList.length > 0 ? timList : [
              { id: '1', nama: 'Ketua Tim Penyusun LKPS', nidn: '0012345678', jabatan: 'Ketua Tim' },
              { id: '2', nama: 'Sekretaris Tim LKPS', nidn: '0023456789', jabatan: 'Sekretaris' },
              { id: '3', nama: 'Anggota Tim Bidang Akademik', nidn: '0034567890', jabatan: 'Anggota' },
            ]).map((t, idx) => (
              <div
                key={t.id || idx}
                style={{
                  border: '1px solid #94a3b8',
                  borderRadius: '6px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <table style={{ fontSize: '10.5pt', borderCollapse: 'collapse', width: '65%' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '130px', padding: '3px 0' }}>Nama</td>
                      <td style={{ width: '15px' }}>:</td>
                      <td style={{ fontWeight: 'bold' }}>{t.nama}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>NIDN</td>
                      <td>:</td>
                      <td>{t.nidn || '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>Jabatan</td>
                      <td>:</td>
                      <td>{t.jabatan}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>Tanggal Pengisian</td>
                      <td>:</td>
                      <td>{identitas?.tanggalPengusul ? identitas.tanggalPengusul.toISOString().split('T')[0] : '2024-08-31'}</td>
                    </tr>
                  </tbody>
                </table>

                <div
                  style={{
                    width: '140px',
                    height: '75px',
                    border: '1px dashed #64748b',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9pt',
                    color: '#64748b',
                  }}
                >
                  <span>Tanda Tangan:</span>
                  <span style={{ fontSize: '8pt', marginTop: '4px' }}>[ TTD Asli ]</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            HALAMAN 4+: TABEL 1 S.D. 9 DARI BUKU PANDUAN LKPS
            ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ padding: '25mm 25mm', boxSizing: 'border-box' }}>
          
          {/* 1. TATA PAMONG, TATA KELOLA DAN KERJASAMA */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '6px' }}>
              1. Tata Pamong, Tata Kelola dan Kerjasama
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '8px' }}>
              Tabel 1 Kerjasama Tridharma Perguruan Tinggi
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th rowSpan={2} style={{ width: '30px' }}>No.</th>
                  <th rowSpan={2}>Lembaga Mitra</th>
                  <th colSpan={3}>Tingkat</th>
                  <th rowSpan={2}>Judul Kegiatan Kerjasama</th>
                  <th rowSpan={2}>Manfaat bagi PS</th>
                  <th rowSpan={2}>Waktu & Durasi</th>
                  <th rowSpan={2}>Bukti Kerjasama</th>
                </tr>
                <tr>
                  <th style={{ width: '45px' }}>Internasional</th>
                  <th style={{ width: '45px' }}>Nasional</th>
                  <th style={{ width: '45px' }}>Wilayah</th>
                </tr>
              </thead>
              <tbody>
                {kerjasamaList.length === 0 ? (
                  <tr><td colSpan={9} className="text-center" style={{ color: '#64748b' }}>Belum ada data kerjasama</td></tr>
                ) : (
                  kerjasamaList.map((k, i) => (
                    <tr key={k.id}>
                      <td className="text-center">{i + 1}</td>
                      <td>{k.namaLembaga}</td>
                      <td className="text-center">{k.tingkat?.toLowerCase().includes('internasional') ? 'V' : '-'}</td>
                      <td className="text-center">{k.tingkat?.toLowerCase().includes('nasional') ? 'V' : '-'}</td>
                      <td className="text-center">{!k.tingkat?.toLowerCase().includes('internasional') && !k.tingkat?.toLowerCase().includes('nasional') ? 'V' : '-'}</td>
                      <td>{k.judulKegiatan}</td>
                      <td>{k.manfaat || '-'}</td>
                      <td className="text-center">
                        {k.tanggalMulai ? k.tanggalMulai.toISOString().split('T')[0] : ''} s/d {k.tanggalAkhir ? k.tanggalAkhir.toISOString().split('T')[0] : ''}
                      </td>
                      <td>{k.fileMou || 'SPK/MoA'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 2. MAHASISWA */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '6px' }}>
              2. Mahasiswa
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '8px' }}>
              Tabel 2.a.1) Seleksi Mahasiswa Untuk Program Studi Sarjana
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th rowSpan={2}>Tahun Akademik</th>
                  <th rowSpan={2}>Daya Tampung</th>
                  <th colSpan={2}>Jumlah Calon Mahasiswa</th>
                  <th colSpan={2}>Jumlah Mahasiswa Baru</th>
                  <th colSpan={2}>Jumlah Mahasiswa Aktif</th>
                </tr>
                <tr>
                  <th>Pendaftar</th>
                  <th>Lulus Seleksi</th>
                  <th>Reguler</th>
                  <th>Transfer</th>
                  <th>Reguler</th>
                  <th>Transfer</th>
                </tr>
              </thead>
              <tbody>
                {mhsList.length === 0 ? (
                  <tr><td colSpan={8} className="text-center" style={{ color: '#64748b' }}>Belum ada data seleksi mahasiswa</td></tr>
                ) : (
                  mhsList.map((m) => (
                    <tr key={m.id}>
                      <td className="text-center font-bold">{m.tahunSemester}</td>
                      <td className="text-center">{m.dayaTampung}</td>
                      <td className="text-center">{m.jumlahPendaftar}</td>
                      <td className="text-center">{m.jumlahLulusSeleksi}</td>
                      <td className="text-center">{m.mahasiswaBaruReguler}</td>
                      <td className="text-center">{m.mahasiswaBaruTransfer}</td>
                      <td className="text-center">{m.mahasiswaAktifReguler}</td>
                      <td className="text-center">{m.mahasiswaAktifTransfer}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 3. SUMBER DAYA MANUSIA */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '6px' }}>
              3. Sumber Daya Manusia
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '8px' }}>
              Tabel 3.a.1) Dosen Tetap Perguruan Tinggi yang Ditugaskan sebagai Pengampu Mata Kuliah (DTPS)
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '25px' }}>No.</th>
                  <th>Nama Dosen</th>
                  <th>NIDN</th>
                  <th>Pendidikan Magister</th>
                  <th>Pendidikan Doktor</th>
                  <th>Bidang Keahlian</th>
                  <th>Kesesuaian Kompetensi</th>
                  <th>Jabatan Akademik</th>
                  <th>Mata Kuliah Diampu</th>
                </tr>
              </thead>
              <tbody>
                {dosenList.length === 0 ? (
                  <tr><td colSpan={9} className="text-center" style={{ color: '#64748b' }}>Belum ada data dosen tetap</td></tr>
                ) : (
                  dosenList.map((d, i) => (
                    <tr key={d.id}>
                      <td className="text-center">{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{d.nama}</td>
                      <td className="text-center">{d.nidn || '-'}</td>
                      <td>{d.prodiPascaS2 || '-'}</td>
                      <td>{d.prodiPascaS3 || '-'}</td>
                      <td>{d.bidangKeahlian || '-'}</td>
                      <td className="text-center">{d.kesesuaianKompetensi ?? true ? 'V' : '-'}</td>
                      <td className="text-center">{d.jabatanAkademik}</td>
                      <td>{d.mataKuliahDiampu || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 5. PENDIDIKAN & KURIKULUM */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '6px' }}>
              5. Pendidikan
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '8px' }}>
              Tabel 5.a.1) Struktur Kurikulum dan Rencana Pembelajaran Mata Kuliah
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}>No.</th>
                  <th>Kode MK</th>
                  <th>Nama Mata Kuliah</th>
                  <th>SKS Teori</th>
                  <th>SKS Praktikum</th>
                  <th>CPL yang Dipetakan</th>
                  <th>Unit Penyelenggara</th>
                </tr>
              </thead>
              <tbody>
                {mkList.length === 0 ? (
                  <tr><td colSpan={7} className="text-center" style={{ color: '#64748b' }}>Belum ada data mata kuliah</td></tr>
                ) : (
                  mkList.slice(0, 40).map((m, i) => (
                    <tr key={m.id}>
                      <td className="text-center">{i + 1}</td>
                      <td className="text-center font-bold">{m.kode}</td>
                      <td>{m.nama}</td>
                      <td className="text-center">{m.sksTeori}</td>
                      <td className="text-center">{m.sksPraktikum}</td>
                      <td>{m.cpl || 'Inti'}</td>
                      <td>{m.unitPenyelenggara || namaProdiFinal}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {mkList.length > 40 && (
              <div style={{ fontSize: '9pt', fontStyle: 'italic', color: '#64748b', marginTop: '4px' }}>
                * Menampilkan 40 dari {mkList.length} mata kuliah. Seluruh daftar lengkap tersaji pada lampiran Excel.
              </div>
            )}
          </div>

          {/* 6. PENELITIAN & 7. PKM */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '6px' }}>
              6. Penelitian DTPS yang Melibatkan Mahasiswa
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}>No.</th>
                  <th>Nama Dosen</th>
                  <th>Judul Kegiatan Penelitian</th>
                  <th>Nama Mahasiswa yang Terlibat</th>
                  <th style={{ width: '60px' }}>Tahun</th>
                </tr>
              </thead>
              <tbody>
                {penelitianList.length === 0 ? (
                  <tr><td colSpan={5} className="text-center" style={{ color: '#64748b' }}>Belum ada data penelitian</td></tr>
                ) : (
                  penelitianList.slice(0, 25).map((p, i) => (
                    <tr key={p.id}>
                      <td className="text-center">{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{p.namaDosen}</td>
                      <td>{p.judul}</td>
                      <td style={{ color: '#0369a1' }}>{p.mahasiswaTerlibat || '-'}</td>
                      <td className="text-center">{p.tahun}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '6px' }}>
              7. Pengabdian kepada Masyarakat (PkM) DTPS yang Melibatkan Mahasiswa
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}>No.</th>
                  <th>Nama Dosen</th>
                  <th>Judul Kegiatan PkM</th>
                  <th>Nama Mahasiswa yang Terlibat</th>
                  <th style={{ width: '60px' }}>Tahun</th>
                </tr>
              </thead>
              <tbody>
                {pkmList.length === 0 ? (
                  <tr><td colSpan={5} className="text-center" style={{ color: '#64748b' }}>Belum ada data PkM</td></tr>
                ) : (
                  pkmList.slice(0, 25).map((p, i) => (
                    <tr key={p.id}>
                      <td className="text-center">{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{p.namaDosen}</td>
                      <td>{p.judul}</td>
                      <td style={{ color: '#0369a1' }}>{p.mahasiswaTerlibat || '-'}</td>
                      <td className="text-center">{p.tahun}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 8. LUARAN & CAPAIAN TRIDHARMA */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '6px' }}>
              8. Luaran dan Capaian Tridharma Perguruan Tinggi
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '8px' }}>
              Tabel 8.a IPK Lulusan
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}>No.</th>
                  <th>Tahun Lulus</th>
                  <th>Jumlah Lulusan</th>
                  <th>IPK Minimum</th>
                  <th>IPK Rata-Rata</th>
                  <th>IPK Maksimum</th>
                </tr>
              </thead>
              <tbody>
                {ipkList.map((x, i) => (
                  <tr key={x.id}>
                    <td className="text-center">{i + 1}</td>
                    <td className="text-center font-bold">{x.tahunSemester}</td>
                    <td className="text-center">120</td>
                    <td className="text-center">{x.ipkMinimum}</td>
                    <td className="text-center font-bold">{x.ipkRataRata}</td>
                    <td className="text-center">{x.ipkMaksimum}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ fontSize: '11pt', fontWeight: 'bold', marginTop: '16px', marginBottom: '8px' }}>
              Tabel 8.b.1 Prestasi Akademik Mahasiswa
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}>No.</th>
                  <th>Nama Kegiatan / Kompetisi</th>
                  <th>Waktu Perolehan</th>
                  <th>Tingkat</th>
                  <th>Prestasi yang Dicapai</th>
                </tr>
              </thead>
              <tbody>
                {prestasiList.slice(0, 25).map((pr, i) => (
                  <tr key={pr.id}>
                    <td className="text-center">{i + 1}</td>
                    <td>{pr.namaKegiatan}</td>
                    <td className="text-center">{pr.tahun}</td>
                    <td className="text-center">{pr.tingkat}</td>
                    <td style={{ fontWeight: 600 }}>{pr.penghargaan || 'Juara'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 9. PENJAMINAN MUTU (SPMI) */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '6px' }}>
              9. Penjaminan Mutu (SPMI)
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '8px' }}>
              Tabel 9.b Ketersediaan Dokumen/Buku Sistem Penjaminan Mutu Internal
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}>No.</th>
                  <th>Jenis Dokumen Penjaminan Mutu</th>
                  <th>Nomor dan Tanggal Dokumen Regulasi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center">1</td>
                  <td>Dokumen / Buku Kebijakan SPMI</td>
                  <td>SK Rektor Universitas Lampung No. 124/UN26/KP/2023</td>
                </tr>
                <tr>
                  <td className="text-center">2</td>
                  <td>Dokumen / Buku Manual SPMI</td>
                  <td>SK Rektor Universitas Lampung No. 125/UN26/KP/2023</td>
                </tr>
                <tr>
                  <td className="text-center">3</td>
                  <td>Dokumen / Buku Standar SPMI (24 Standar SN-Dikti)</td>
                  <td>SK Rektor Universitas Lampung No. 126/UN26/KP/2023</td>
                </tr>
                <tr>
                  <td className="text-center">4</td>
                  <td>Dokumen / Buku Formulir SPMI</td>
                  <td>SK Dekan Fakultas Teknik No. 45/UN26.1/KP/2023</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pengesahan Akhir Laporan */}
          <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '250px', textAlign: 'center', fontSize: '11pt' }}>
              <div>{kotaFinal}, {identitas?.tanggalPengusul ? identitas.tanggalPengusul.toISOString().split('T')[0] : '31 Agustus 2024'}</div>
              <div style={{ fontWeight: 'bold', marginTop: '4px' }}>Pengusul,</div>
              <div style={{ fontWeight: 'bold' }}>{namaUPPSFinal}</div>
              <div style={{ height: '70px' }}></div>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                {identitas?.namaPengusul || 'Prof. Dr. Ir. Dekan Fakultas Teknik, M.T.'}
              </div>
              <div>NIP. 197001011995031001</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
