import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database LKPS LAM Teknik dengan data dummy lengkap (Kriteria 1 - 9)...')  // ── 1. Users ──
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@lkps.ac.id" },
    update: {},
    create: {
      id: "V54g5vHwrG1DRkk33gDS3kZ45uBifY2H",
      name: "Super Admin",
      email: "superadmin@lkps.ac.id",
      role: "SUPER_ADMIN",
    },
  })

  const adminUpps = await prisma.user.upsert({
    where: { email: "adminupps@lkps.ac.id" },
    update: {},
    create: {
      id: "JQIA9SSwpkwiMdZDLrbORqLJtNsbzHFi",
      name: "Admin UPPS Teknik",
      email: "adminupps@lkps.ac.id",
      role: "PENANGGUNG_JAWAB",
    },
  })

  const operatorProdi = await prisma.user.upsert({
    where: { email: "operator@lkps.ac.id" },
    update: {},
    create: {
      id: "339e6b9a5762bf73aef2865bd51de413",
      name: "Operator Prodi D3 Teknik Elektronika",
      email: "operator@lkps.ac.id",
      role: "OPERATOR_PRODI",
    },
  })

  const asesor = await prisma.user.upsert({
    where: { email: "asesor@lkps.ac.id" },
    update: {},
    create: {
      id: "spyH1qnCuJs6RYvrZ0fua2Hu5LQuwGmS",
      name: "Asesor Internal LAM Teknik",
      email: "asesor@lkps.ac.id",
      role: "ASESOR",
    },
  })

  // ── 2. Identitas PT & Prodi ──
  await prisma.identitasPT.upsert({
    where: { id: 'default-pt' },
    update: {
      namaPT: 'Politeknik Teknik Nusantara',
      namaUPPS: 'Jurusan Teknik Elektro',
      jenisProgram: 'Vokasi',
      namaProdi: 'D3 Teknik Elektronika',
      alamat: 'Jl. Teknik No. 1, Kota Nusantara, Jawa Tengah',
      noSkPendirianPT: '185/E/O/2003',
      tanggalSkPT: new Date('2003-05-15'),
      noSkPembukaanPS: '215/KPT/I/2003',
      tanggalSkPS: new Date('2003-06-01'),
    },
    create: {
      id: 'default-pt',
      namaPT: 'Politeknik Teknik Nusantara',
      namaUPPS: 'Jurusan Teknik Elektro',
      jenisProgram: 'Vokasi',
      namaProdi: 'D3 Teknik Elektronika',
      alamat: 'Jl. Teknik No. 1, Kota Nusantara, Jawa Tengah',
      noSkPendirianPT: '185/E/O/2003',
      tanggalSkPT: new Date('2003-05-15'),
      noSkPembukaanPS: '215/KPT/I/2003',
      tanggalSkPS: new Date('2003-06-01'),
    },
  })

  const prodi1 = await prisma.prodi.upsert({
    where: { id: 'prodi-d3-elektro' },
    update: {},
    create: {
      id: 'prodi-d3-elektro',
      namaProdi: 'D3 Teknik Elektronika',
      jenjang: 'D3',
      peringkatAkreditasi: 'Baik Sekali',
      jumlahMahasiswaAktif: 280,
    },
  })

  await prisma.prodi.upsert({
    where: { id: 'prodi-d3-mesin' },
    update: {},
    create: {
      id: 'prodi-d3-mesin',
      namaProdi: 'D3 Teknik Mesin Terapan',
      jenjang: 'D3',
      peringkatAkreditasi: 'Baik',
      jumlahMahasiswaAktif: 195,
    },
  })

  await prisma.user.update({
    where: { email: 'operator@lkps.ac.id' },
    data: { prodiId: prodi1.id },
  })

  // ── Tim Penyusun ──
  const timPenyusunData = [
    { id: 'tim-1', nama: 'Dr. Ir. Budi Santoso, M.T.', nidn: '0012057801', jabatan: 'Ketua Tim Penyusun / Dosen Tetap', prodiId: prodi1.id },
    { id: 'tim-2', nama: 'Eng. Ahmad Rifai, S.T., M.Eng.', nidn: '0023088202', jabatan: 'Anggota / Ketua Program Studi', prodiId: prodi1.id },
    { id: 'tim-3', nama: 'Maria Ulfa, S.Pd., M.T.', nidn: '0015118503', jabatan: 'Anggota / Sekretaris Prodi', prodiId: prodi1.id },
  ]
  for (const t of timPenyusunData) {
    await prisma.timPenyusun.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    })
  }

  // ── 3. Kriteria 1: Kerjasama (Tabel 1) ──
  await prisma.kerjasama.deleteMany({})
  await prisma.kerjasama.createMany({
    data: [
      {
        namaLembaga: 'PT Schneider Electric Indonesia',
        tingkat: 'Nasional',
        judulKegiatan: 'Kerjasama Praktik Kerja Lapangan dan Rekrutmen Lulusan',
        manfaat: 'Mahasiswa mendapat pengalaman industri dan peluang rekrutmen langsung',
        tanggalMulai: new Date('2022-01-01'),
        tanggalAkhir: new Date('2025-12-31'),
        jenisKerjasama: 'N1',
        fileMou: 'https://spmi.unila.ac.id/mou-schneider.pdf',
      },
      {
        namaLembaga: 'Universitas Kebangsaan Malaysia',
        tingkat: 'Internasional',
        judulKegiatan: 'Joint Research on Smart Grid & Microgrid Systems',
        manfaat: 'Publikasi ilmiah bersama di jurnal Scopus dan pertukaran riset',
        tanggalMulai: new Date('2023-03-01'),
        tanggalAkhir: new Date('2025-02-28'),
        jenisKerjasama: 'N2',
        fileMou: 'https://spmi.unila.ac.id/mou-ukm.pdf',
      },
      {
        namaLembaga: 'Pemerintah Kota Nusantara',
        tingkat: 'Wilayah/Lokal',
        judulKegiatan: 'Pengabdian Masyarakat: Elektrifikasi Panel Surya Kampung Solar',
        manfaat: 'Pemasangan panel surya di 50 rumah warga kurang mampu',
        tanggalMulai: new Date('2023-07-01'),
        tanggalAkhir: new Date('2024-06-30'),
        jenisKerjasama: 'N3',
        fileMou: 'https://spmi.unila.ac.id/mou-pemkot.pdf',
      },
      {
        namaLembaga: 'PT PLN (Persero) Pusdiklat',
        tingkat: 'Nasional',
        judulKegiatan: 'Pelatihan Sertifikasi Kompetensi Pengoperasian PLC & SCADA',
        manfaat: 'Sertifikasi kompetensi industri untuk 45 mahasiswa tingkat akhir',
        tanggalMulai: new Date('2022-09-01'),
        tanggalAkhir: new Date('2025-08-31'),
        jenisKerjasama: 'N1',
        fileMou: 'https://spmi.unila.ac.id/mou-pln.pdf',
      },
      {
        namaLembaga: 'Festo Didactic SE Germany',
        tingkat: 'Internasional',
        judulKegiatan: 'Hibah Peralatan Lab Mechatronics & Training for Trainers',
        manfaat: 'Peningkatan kualifikasi 4 dosen dan pembaruan modul praktikum',
        tanggalMulai: new Date('2021-05-10'),
        tanggalAkhir: new Date('2024-05-10'),
        jenisKerjasama: 'N1',
        fileMou: 'https://spmi.unila.ac.id/mou-festo.pdf',
      },
    ],
  })

  // ── 4. Kriteria 2: Mahasiswa (Tabel 2.a & 2.b) ──
  const seleksiData = [
    { id: 'seleksi-TS', tahunSemester: 'TS', dayaTampung: 100, jumlahPendaftar: 350, jumlahLulusSeleksi: 105, mahasiswaBaruReguler: 95, mahasiswaBaruTransfer: 5, mahasiswaAktifReguler: 280, mahasiswaAktifTransfer: 12 },
    { id: 'seleksi-TS-1', tahunSemester: 'TS-1', dayaTampung: 100, jumlahPendaftar: 320, jumlahLulusSeleksi: 102, mahasiswaBaruReguler: 90, mahasiswaBaruTransfer: 8, mahasiswaAktifReguler: 260, mahasiswaAktifTransfer: 10 },
    { id: 'seleksi-TS-2', tahunSemester: 'TS-2', dayaTampung: 90, jumlahPendaftar: 290, jumlahLulusSeleksi: 95, mahasiswaBaruReguler: 85, mahasiswaBaruTransfer: 5, mahasiswaAktifReguler: 240, mahasiswaAktifTransfer: 8 },
    { id: 'seleksi-TS-3', tahunSemester: 'TS-3', dayaTampung: 90, jumlahPendaftar: 280, jumlahLulusSeleksi: 92, mahasiswaBaruReguler: 80, mahasiswaBaruTransfer: 5, mahasiswaAktifReguler: 220, mahasiswaAktifTransfer: 7 },
    { id: 'seleksi-TS-4', tahunSemester: 'TS-4', dayaTampung: 80, jumlahPendaftar: 260, jumlahLulusSeleksi: 85, mahasiswaBaruReguler: 75, mahasiswaBaruTransfer: 3, mahasiswaAktifReguler: 200, mahasiswaAktifTransfer: 5 },
  ]
  for (const s of seleksiData) {
    await prisma.seleksiMahasiswaBaru.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    })
  }

  const asingData = [
    { id: 'asing-TS', tahunSemester: 'TS', jumlahFullTime: 2, jumlahPartTime: 3 },
    { id: 'asing-TS-1', tahunSemester: 'TS-1', jumlahFullTime: 1, jumlahPartTime: 2 },
    { id: 'asing-TS-2', tahunSemester: 'TS-2', jumlahFullTime: 0, jumlahPartTime: 1 },
  ]
  for (const a of asingData) {
    await prisma.mahasiswaAsing.upsert({
      where: { id: a.id },
      update: a,
      create: a,
    })
  }

  // ── 5. Kriteria 3: SDM (Dosen & Tendik) ──
  await prisma.bimbinganTA.deleteMany({})
  await (prisma as any).eWMP.deleteMany({})
  await prisma.luaranDosen.deleteMany({})
  await prisma.dosenTetap.deleteMany({})

  const dosenList = [
    { id: 'dosen-1', nama: 'Dr. Ir. Budi Santoso, M.T.', nidn: '0012057801', pendidikanS2: true, pendidikanS3: true, sertifikasiDosen: true, sertifikasiKompetensi: true, jabatanAkademik: 'Lektor Kepala', bidangKeahlian: 'Sistem Kontrol & Otomasi Industri', mataKuliahDiampu: 'PLC, Sistem Kontrol Terdistribusi', kesesuaianBidang: true, bebanMengajar: 12 },
    { id: 'dosen-2', nama: 'Eng. Ahmad Rifai, S.T., M.Eng.', nidn: '0023088202', pendidikanS2: true, pendidikanS3: false, sertifikasiDosen: true, sertifikasiKompetensi: true, jabatanAkademik: 'Lektor', bidangKeahlian: 'Embedded Systems & Internet of Things', mataKuliahDiampu: 'Mikrokontroler, IoT Terapan', kesesuaianBidang: true, bebanMengajar: 14 },
    { id: 'dosen-3', nama: 'Maria Ulfa, S.Pd., M.T.', nidn: '0015118503', pendidikanS2: true, pendidikanS3: false, sertifikasiDosen: true, sertifikasiKompetensi: true, jabatanAkademik: 'Lektor', bidangKeahlian: 'Elektronika Daya & Energi Terbarukan', mataKuliahDiampu: 'Rangkaian Elektronika, Solar Cell', kesesuaianBidang: true, bebanMengajar: 13 },
    { id: 'dosen-4', nama: 'Prof. Dr. Bambang Wijaya, M.Sc.', nidn: '0005046504', pendidikanS2: true, pendidikanS3: true, sertifikasiDosen: true, sertifikasiKompetensi: true, jabatanAkademik: 'Guru Besar', bidangKeahlian: 'Robotika & Kecerdasan Buatan Terapan', mataKuliahDiampu: 'Mechatronics & Robotics', kesesuaianBidang: true, bebanMengajar: 10 },
    { id: 'dosen-5', nama: 'Hendra Gunawan, S.T., M.T.', nidn: '0018098805', pendidikanS2: true, pendidikanS3: false, sertifikasiDosen: true, sertifikasiKompetensi: false, jabatanAkademik: 'Asisten Ahli', bidangKeahlian: 'Sistem Pengukuran & Instrumentasi', mataKuliahDiampu: 'Sensor & Transduser', kesesuaianBidang: true, bebanMengajar: 15 },
  ]

  for (const d of dosenList) {
    await prisma.dosenTetap.create({ data: d })
    await prisma.bimbinganTA.create({
      data: {
        dosenId: d.id,
        bimbinganPSSendiriTS: 6,
        bimbinganPSSendiriTS1: 5,
        bimbinganPSSendiriTS2: 7,
        bimbinganPSLainTS: 2,
        bimbinganPSLainTS1: 1,
        bimbinganPSLainTS2: 2,
      },
    })
    await (prisma as any).eWMP.create({
      data: {
        dosenId: d.id,
        sksPendidikanPSSendiri: 8,
        sksPendidikanPSLain: 2,
        sksPenelitian: 3,
        sksPkm: 2,
        sksTugasTambahan: 3,
      },
    })
  }

  await prisma.luaranDosen.createMany({
    data: [
      { dosenId: 'dosen-1', namaDosen: 'Dr. Ir. Budi Santoso, M.T.', jenis: 'publikasi', judul: 'Development of SCADA-Based Smart Water Grid for Industrial Parks', tahun: 2023, detail: 'Jurnal International IEEE Access (Scopus Q1)' },
      { dosenId: 'dosen-2', namaDosen: 'Eng. Ahmad Rifai, S.T., M.Eng.', jenis: 'hki', judul: 'Alat Pemantau Kualitas Air Sungai Berbasis LoRaWAN', tahun: 2023, detail: 'Paten Sederhana (No. IDS000005432)' },
      { dosenId: 'dosen-3', namaDosen: 'Maria Ulfa, S.Pd., M.T.', jenis: 'produk', judul: 'Modul Trainer Kit Solar Inverter 500W untuk SMK', tahun: 2022, detail: 'Diadopsi oleh 10 SMK Mitra di Jawa Tengah' },
      { dosenId: 'dosen-4', namaDosen: 'Prof. Dr. Bambang Wijaya, M.Sc.', jenis: 'sitasi', judul: 'Autonomous Mobile Robot Trajectory Planning in Dynamic Warehouse', tahun: 2021, detail: 'Disitasi 48 kali di Google Scholar' },
    ],
  })

  await prisma.tenagaKependidikan.deleteMany({})
  await prisma.tenagaKependidikan.createMany({
    data: [
      { jenis: 'Laboran', jenjangPendidikan: 'D3', jumlah: 4 },
      { jenis: 'Laboran', jenjangPendidikan: 'S1', jumlah: 2 },
      { jenis: 'Teknisi', jenjangPendidikan: 'D3', jumlah: 3 },
      { jenis: 'Pustakawan', jenjangPendidikan: 'S1', jumlah: 2 },
      { jenis: 'Administrasi', jenjangPendidikan: 'S1', jumlah: 5 },
    ],
  })

  // ── 6. Kriteria 4: Keuangan & Sarana ──
  await prisma.penggunaanDana.deleteMany({})
  await prisma.penggunaanDana.createMany({
    data: [
      { tahunSemester: 'TS', biayaOperasionalPendidikan: 850000000, biayaPenelitianDosen: 120000000, biayaPkmDosen: 80000000, investasiSdm: 150000000, investasiSarana: 250000000, investasiPrasarana: 100000000 },
      { tahunSemester: 'TS-1', biayaOperasionalPendidikan: 800000000, biayaPenelitianDosen: 110000000, biayaPkmDosen: 75000000, investasiSdm: 130000000, investasiSarana: 200000000, investasiPrasarana: 90000000 },
      { tahunSemester: 'TS-2', biayaOperasionalPendidikan: 750000000, biayaPenelitianDosen: 100000000, biayaPkmDosen: 70000000, investasiSdm: 120000000, investasiSarana: 180000000, investasiPrasarana: 80000000 },
    ],
  })

  await prisma.laboratorium.deleteMany({})
  await prisma.laboratorium.createMany({
    data: [
      { namaLab: 'Lab Otomasi Industri & PLC', jenisPeralatan: 'Siemens S7-1200 & Festo Pneumatic Trainer', kepemilikan: 'Milik Sendiri', kondisi: 'Baik', jamPenggunaan: 38, luasRuangan: 120 },
      { namaLab: 'Lab Mikrokontroler & IoT', jenisPeralatan: 'ESP32 Development Kits, Oscilloscope Digital, 3D Printer', kepemilikan: 'Milik Sendiri', kondisi: 'Baik', jamPenggunaan: 40, luasRuangan: 95 },
      { namaLab: 'Lab Elektronika Daya & Renewable Energy', jenisPeralatan: 'Solar Simulator, Grid-Tie Inverter 2kW, Battery Analyzer', kepemilikan: 'Milik Sendiri', kondisi: 'Baik', jamPenggunaan: 32, luasRuangan: 110 },
    ],
  })

  // ── 7. Kriteria 5: Pendidikan & MBKM ──
  await prisma.mataKuliah.deleteMany({})
  await prisma.mataKuliah.createMany({
    data: [
      { kode: 'EL-101', nama: 'Rangkaian Listrik & Elektronika Dasar', sksTeori: 2, sksPraktikum: 2, cpl: 'CPL-1, CPL-2', linkRps: 'https://spmi.unila.ac.id/rps-el101.pdf', unitPenyelenggara: 'Prodi D3 Teknik Elektronika' },
      { kode: 'EL-202', nama: 'Sistem Otomasi Industri & Programmable Logic Controller (PLC)', sksTeori: 1, sksPraktikum: 3, cpl: 'CPL-3, CPL-5', linkRps: 'https://spmi.unila.ac.id/rps-el202.pdf', unitPenyelenggara: 'Prodi D3 Teknik Elektronika' },
      { kode: 'EL-305', nama: 'Mikrokontroler & Internet of Things (IoT) Terapan', sksTeori: 1, sksPraktikum: 2, cpl: 'CPL-2, CPL-4', linkRps: 'https://spmi.unila.ac.id/rps-el305.pdf', unitPenyelenggara: 'Prodi D3 Teknik Elektronika' },
      { kode: 'EL-310', nama: 'Proyek Akhir / Tugas Akhir Terapan', sksTeori: 0, sksPraktikum: 4, cpl: 'CPL-6', linkRps: 'https://spmi.unila.ac.id/rps-el310.pdf', unitPenyelenggara: 'Prodi D3 Teknik Elektronika' },
    ],
  })

  await prisma.programMBKM.deleteMany({})
  await prisma.programMBKM.createMany({
    data: [
      { namaMahasiswa: 'Rizky Febrian', nim: '210301045', namaMitra: 'PT Schneider Electric Indonesia', sksKonversi: 20, dosenPembimbing: 'Dr. Ir. Budi Santoso, M.T.', tahun: 2023 },
      { namaMahasiswa: 'Dewi Lestari', nim: '210301088', namaMitra: 'Studi Independen IoT Bangkit Academy by Google', sksKonversi: 20, dosenPembimbing: 'Eng. Ahmad Rifai, S.T., M.Eng.', tahun: 2023 },
      { namaMahasiswa: 'Andi Wijaya', nim: '210301102', namaMitra: 'Magang Industri PT Badak NGL Bontang', sksKonversi: 20, dosenPembimbing: 'Maria Ulfa, S.Pd., M.T.', tahun: 2023 },
    ],
  })

  // ── 8. Kriteria 6 & 7: Penelitian & PkM ──
  await prisma.penelitianDosen.deleteMany({})
  await prisma.penelitianDosen.createMany({
    data: [
      { judul: 'Rancang Bangun Sistem Monitoring Solar Panel Berbasis IoT dan Machine Learning', namaDosen: 'Dr. Ir. Budi Santoso, M.T.', mahasiswaTerlibat: 'Rizky Febrian (210301045), Muhammad Ilham (210301012)', tahun: 2023, jenis: 'Penelitian' },
      { judul: 'Implementasi Robot Arm Pemilah Barang Terintegrasi Camera Vision System', namaDosen: 'Prof. Dr. Bambang Wijaya, M.Sc.', mahasiswaTerlibat: 'Aditya Pratama (210301099)', tahun: 2023, jenis: 'Penelitian' },
      { judul: 'Pelatihan dan Instalasi Panel Surya Mandiri Energi di Desa Karanganyar', namaDosen: 'Maria Ulfa, S.Pd., M.T.', mahasiswaTerlibat: 'Dewi Lestari (210301088), Siti Aminah (210301076)', tahun: 2023, jenis: 'PkM' },
      { judul: 'Pendampingan Otomasi Industri berbasis PLC bagi Guru dan Siswa SMK Vokasi', namaDosen: 'Eng. Ahmad Rifai, S.T., M.Eng.', mahasiswaTerlibat: 'Andi Wijaya (210301102)', tahun: 2022, jenis: 'PkM' },
    ],
  })

  // ── 9. Kriteria 8: Luaran Tridharma ──
  await prisma.ipkLulusan.deleteMany({})
  await prisma.ipkLulusan.createMany({
    data: [
      { tahunSemester: 'TS', ipkMinimum: 3.12, ipkRataRata: 3.58, ipkMaksimum: 3.96 },
      { tahunSemester: 'TS-1', ipkMinimum: 3.05, ipkRataRata: 3.52, ipkMaksimum: 3.92 },
      { tahunSemester: 'TS-2', ipkMinimum: 3.00, ipkRataRata: 3.48, ipkMaksimum: 3.88 },
    ],
  })

  await prisma.prestasiMahasiswa.deleteMany({})
  await prisma.prestasiMahasiswa.createMany({
    data: [
      { namaMahasiswa: 'Rizky Febrian & Tim Robotik', namaKegiatan: 'Kontes Robot Indonesia (KRI) Kategori KRAI', tingkat: 'Nasional', penghargaan: 'Juara 1 & Best Design', tahun: 2023, jenis: 'Akademik' },
      { namaMahasiswa: 'Aditya Pratama', namaKegiatan: 'International PLC Industrial Automation Challenge', tingkat: 'Internasional', penghargaan: 'Runner Up (Juara 2)', tahun: 2023, jenis: 'Akademik' },
      { namaMahasiswa: 'Siti Aminah', namaKegiatan: 'Kejuaraan Pencak Silat Antar Perguruan Tinggi', tingkat: 'Wilayah', penghargaan: 'Medali Emas (Juara 1)', tahun: 2022, jenis: 'Non-Akademik' },
    ],
  })

  await prisma.efektivitasStudi.deleteMany({})
  await prisma.efektivitasStudi.createMany({
    data: [
      { angkatan: 2020, jumlahMasuk: 95, jumlahLulusTepat: 88 },
      { angkatan: 2019, jumlahMasuk: 90, jumlahLulusTepat: 83 },
      { angkatan: 2018, jumlahMasuk: 85, jumlahLulusTepat: 79 },
    ],
  })

  await prisma.tracerStudy.deleteMany({})
  await prisma.tracerStudy.createMany({
    data: [
      { tahun: 2023, jumlahResponden: 85, rataWaktuTunggu: 2.1, persenSesuaiBidang: 89.4, persenTempatKerjaLokal: 15.0, persenTempatKerjaNasional: 75.0, persenTempatKerjaInternasional: 10.0, skorKepuasanPengguna: 3.78 },
      { tahun: 2022, jumlahResponden: 80, rataWaktuTunggu: 2.4, persenSesuaiBidang: 86.5, persenTempatKerjaLokal: 20.0, persenTempatKerjaNasional: 72.0, persenTempatKerjaInternasional: 8.0, skorKepuasanPengguna: 3.65 },
    ],
  })

  await prisma.luaranMahasiswa.deleteMany({})
  await prisma.luaranMahasiswa.createMany({
    data: [
      { jenis: 'publikasi', judul: 'Desain Inverter Sederhana untuk Aplikasi Solar Home System', namaMahasiswa: 'Rizky Febrian', tahun: 2023, detail: 'Jurnal Vokasi Teknik Elektro (Sinta 3)' },
      { jenis: 'produk', judul: 'Trainer Kit PLC Siemens S7-1200 untuk Media Pembelajaran SMK', namaMahasiswa: 'Andi Wijaya', tahun: 2023, detail: 'Diadopsi oleh SMK Negeri 2 Nusantara' },
      { jenis: 'hki', judul: 'Source Code Program Sistem Presensi RFID Terintegrasi Telegram Bot', namaMahasiswa: 'Dewi Lestari', tahun: 2022, detail: 'Hak Cipta Program Komputer (EC002022881)' },
    ],
  })

  // ── 10. Kriteria 9: Penjaminan Mutu (SPMI) ──
  await prisma.dokumenSpmi.deleteMany({})
  await prisma.dokumenSpmi.createMany({
    data: [
      { jenisDokumen: 'Kebijakan SPMI', tersedia: true, fileDokumen: 'https://spmi.unila.ac.id/kebijakan-spmi.pdf', keterangan: 'SK Direktur No. 042/SK/2021 - Berlaku aktif' },
      { jenisDokumen: 'Manual SPMI', tersedia: true, fileDokumen: 'https://spmi.unila.ac.id/manual-spmi.pdf', keterangan: 'Manual Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan' },
      { jenisDokumen: 'Standar SPMI', tersedia: true, fileDokumen: 'https://spmi.unila.ac.id/standar-spmi.pdf', keterangan: 'Mencakup 24 Standar Nasional Pendidikan Tinggi + 6 Standar Tambahan' },
      { jenisDokumen: 'Formulir SPMI', tersedia: true, fileDokumen: 'https://spmi.unila.ac.id/formulir-spmi.pdf', keterangan: 'Lengkap untuk 9 kriteria akreditasi' },
      { jenisDokumen: 'AMI (Audit Mutu Internal)', tersedia: true, fileDokumen: 'https://spmi.unila.ac.id/laporan-ami-2023.pdf', keterangan: 'Laporan AMI Siklus VIII Tahun 2023 - Temuan 0 Mayor, 2 Minor' },
      { jenisDokumen: 'Tindak Lanjut PPEPP', tersedia: true, fileDokumen: 'https://spmi.unila.ac.id/ppepp-2023.pdf', keterangan: 'Rencana Peningkatan Standar Sarana & Kualifikasi Dosen S3' },
    ],
  })

  console.log('✅ SELURUH DATA DUMMY KRITERIA 1 - 9 BERHASIL DI-SEED KE DATABASE!')
  console.log('\n📋 Akun Login Demo:')
  console.log('  Super Admin  : superadmin@lkps.ac.id | password123')
  console.log('  Admin UPPS   : adminupps@lkps.ac.id  | password123')
  console.log('  Operator     : operator@lkps.ac.id   | password123')
  console.log('  Asesor       : asesor@lkps.ac.id     | password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
