import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  hitungIndikatorRK,
  hitungIndikatorRMD,
  hitungIndikatorSDM,
  hitungIndikatorKeuangan,
  hitungIndikatorPenelitian,
  hitungIndikatorPkM,
  hitungIndikatorSPMI,
  hitungIndikatorLuaran,
  hitungTotalAkreditasi,
  IndikatorScore,
} from '@/lib/computation-engine'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Ambil Data Kriteria 1 (Kerjasama)
    const kerjasamaList = await prisma.kerjasama.findMany()
    const n1 = kerjasamaList.filter((k) => k.jenisKerjasama === 'N1' || k.jenisKerjasama.toLowerCase().includes('pendidikan')).length
    const n2 = kerjasamaList.filter((k) => k.jenisKerjasama === 'N2' || k.jenisKerjasama.toLowerCase().includes('penelitian')).length
    const n3 = kerjasamaList.filter((k) => k.jenisKerjasama === 'N3' || k.jenisKerjasama.toLowerCase().includes('pkm') || k.jenisKerjasama.toLowerCase().includes('pengabdian')).length

    // 2. Ambil Data Kriteria 3 (SDM / DTPS)
    const dosenTetapList = await prisma.dosenTetap.findMany()
    const ndtps = dosenTetapList.length || 1
    const dosenS3 = dosenTetapList.filter((d) => d.pendidikanS3).length

    const ewmpList = await prisma.eWMP.findMany()
    const rataEwmp =
      ewmpList.length > 0
        ? ewmpList.reduce(
            (acc, curr) =>
              acc +
              curr.sksPendidikanPSSendiri +
              curr.sksPendidikanPSLain +
              curr.sksPenelitian +
              curr.sksPkm +
              curr.sksTugasTambahan,
            0
          ) / ewmpList.length
        : 14.0

    const bimbinganList = await prisma.bimbinganTA.findMany()
    const rataBimbingan =
      bimbinganList.length > 0
        ? bimbinganList.reduce(
            (acc, curr) =>
              acc +
              (curr.bimbinganPSSendiriTS +
                curr.bimbinganPSSendiriTS1 +
                curr.bimbinganPSSendiriTS2) /
                3,
            0
          ) / bimbinganList.length
        : 4.5

    // 3. Ambil Data Kriteria 2 (Mahasiswa)
    const mhsBaru = await prisma.seleksiMahasiswaBaru.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
    })
    const totalMahasiswaAktif =
      mhsBaru[0]
        ? mhsBaru[0].mahasiswaAktifReguler + mhsBaru[0].mahasiswaAktifTransfer
        : 250

    // 4. Ambil Data Kriteria 8 (Luaran)
    const ipkList = await prisma.ipkLulusan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
    const rataIpk =
      ipkList.length > 0
        ? ipkList.reduce((acc, curr) => acc + curr.ipkRataRata, 0) / ipkList.length
        : 3.4

    const efektivitas = await prisma.efektivitasStudi.findMany({
      orderBy: { angkatan: 'desc' },
      take: 1,
    })
    const masaStudiTahun = efektivitas[0]?.jumlahLulusTepat ? 3.5 : 3.8

    const tracer = await prisma.tracerStudy.findMany({
      orderBy: { tahun: 'desc' },
      take: 1,
    })
    const waktuTungguBulan = tracer[0]?.rataWaktuTunggu || 4.2

    // 5. Ambil Data Kriteria 4 (Keuangan)
    const danaList = await prisma.penggunaanDana.findMany()
    const biayaOperasionalTahunan =
      danaList.length > 0
        ? danaList.reduce((acc, curr) => acc + curr.biayaOperasionalPendidikan, 0) / danaList.length
        : 9200000000 // default Rp 9.2 Miliar/tahun (~Rp 20 Jt/mhs)

    // 6. Ambil Data Kriteria 6 (Penelitian) & Kriteria 7 (PkM)
    const penList = await prisma.penelitianDosen.findMany({ where: { jenis: 'Penelitian' } })
    const pkmList = await prisma.penelitianDosen.findMany({ where: { jenis: 'PkM' } })
    const jumlahPenelitian3Tahun = penList.length > 0 ? penList.length : 24
    const jumlahPkm3Tahun = pkmList.length > 0 ? pkmList.length : 15

    // 7. Ambil Data Kriteria 9 (SPMI)
    const spmiList = await prisma.dokumenSpmi.findMany()
    const dokumenTersediaCount = spmiList.filter((s) => s.tersedia).length || 5

    // 8. Jalankan Engine Komputasi
    const indikatorScores: IndikatorScore[] = [
      hitungIndikatorRK(n1, n2, n3, ndtps),
      hitungIndikatorRMD(totalMahasiswaAktif, ndtps),
      ...hitungIndikatorSDM({
        ndtps,
        dosenS3,
        ndtt: 0,
        ndt: ndtps,
        rataEwmp,
        rataBimbingan,
      }),
      hitungIndikatorKeuangan(biayaOperasionalTahunan, totalMahasiswaAktif),
      hitungIndikatorPenelitian(jumlahPenelitian3Tahun, ndtps),
      hitungIndikatorPkM(jumlahPkm3Tahun, ndtps),
      ...hitungIndikatorLuaran({
        rataIpk,
        masaStudiTahun,
        waktuTungguBulan,
      }),
      hitungIndikatorSPMI(dokumenTersediaCount),
    ]

    const hasil = hitungTotalAkreditasi(indikatorScores)

    return NextResponse.json({
      success: true,
      data: hasil,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal menghitung skor akreditasi' },
      { status: 500 }
    )
  }
}
