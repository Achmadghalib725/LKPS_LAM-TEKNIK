import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canEditModule, getRoleErrorMessage } from '@/lib/permissions'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const identitas = await prisma.identitasPT.findFirst()
  const prodiList = await prisma.prodi.findMany({
    orderBy: { namaProdi: 'asc' },
  })
  const timList = await prisma.timPenyusun.findMany({
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ identitas, prodiList, timList })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const role = session.user?.role
  if (!canEditModule(role, 'identitas')) {
    return NextResponse.json({ error: getRoleErrorMessage(role, 'identitas') }, { status: 403 })
  }

  const { identitas, prodiList, timList } = await req.json()

  // Upsert identitas PT
  await prisma.identitasPT.upsert({
    where: { id: 'default-pt' },
    update: {
      namaPT: identitas.namaPT || '',
      namaUPPS: identitas.namaUPPS || '',
      jenisProgram: identitas.jenisProgram || 'Sarjana',
      namaProdi: identitas.namaProdi || '',
      alamat: identitas.alamat || '',
      kota: identitas.kota || null,
      kodePos: identitas.kodePos || null,
      telepon: identitas.telepon || null,
      email: identitas.email || null,
      website: identitas.website || null,
      noSkPendirianPT: identitas.noSkPendirianPT || null,
      tanggalSkPT: identitas.tanggalSkPT ? new Date(identitas.tanggalSkPT) : null,
      pejabatSkPendirianPT: identitas.pejabatSkPendirianPT || null,
      fileSkPendirianPT: identitas.fileSkPendirianPT || null,
      noSkPembukaanPS: identitas.noSkPembukaanPS || null,
      tanggalSkPS: identitas.tanggalSkPS ? new Date(identitas.tanggalSkPS) : null,
      pejabatSkPembukaanPS: identitas.pejabatSkPembukaanPS || null,
      fileSkPembukaanPS: identitas.fileSkPembukaanPS || null,
      tahunPertama: identitas.tahunPertama || null,
      peringkatAkreditasi: identitas.peringkatAkreditasi || null,
      nomorSkAkreditasi: identitas.nomorSkAkreditasi || null,
      fileSkAkreditasi: identitas.fileSkAkreditasi || null,
      namaPengusul: identitas.namaPengusul || null,
      tanggalPengusul: identitas.tanggalPengusul ? new Date(identitas.tanggalPengusul) : null,
      tahunTS: identitas.tahunTS || null,
    },
    create: {
      id: 'default-pt',
      namaPT: identitas.namaPT || '',
      namaUPPS: identitas.namaUPPS || '',
      jenisProgram: identitas.jenisProgram || 'Sarjana',
      namaProdi: identitas.namaProdi || '',
      alamat: identitas.alamat || '',
      kota: identitas.kota || null,
      kodePos: identitas.kodePos || null,
      telepon: identitas.telepon || null,
      email: identitas.email || null,
      website: identitas.website || null,
      noSkPendirianPT: identitas.noSkPendirianPT || null,
      tanggalSkPT: identitas.tanggalSkPT ? new Date(identitas.tanggalSkPT) : null,
      pejabatSkPendirianPT: identitas.pejabatSkPendirianPT || null,
      fileSkPendirianPT: identitas.fileSkPendirianPT || null,
      noSkPembukaanPS: identitas.noSkPembukaanPS || null,
      tanggalSkPS: identitas.tanggalSkPS ? new Date(identitas.tanggalSkPS) : null,
      pejabatSkPembukaanPS: identitas.pejabatSkPembukaanPS || null,
      fileSkPembukaanPS: identitas.fileSkPembukaanPS || null,
      tahunPertama: identitas.tahunPertama || null,
      peringkatAkreditasi: identitas.peringkatAkreditasi || null,
      nomorSkAkreditasi: identitas.nomorSkAkreditasi || null,
      fileSkAkreditasi: identitas.fileSkAkreditasi || null,
      namaPengusul: identitas.namaPengusul || null,
      tanggalPengusul: identitas.tanggalPengusul ? new Date(identitas.tanggalPengusul) : null,
      tahunTS: identitas.tahunTS || null,
    },
  })

  // Perbarui prodi list jika ada
  if (Array.isArray(prodiList)) {
    for (const p of prodiList) {
      if (p.id && !p.id.startsWith('new-') && isNaN(Number(p.id))) {
        await prisma.prodi.update({
          where: { id: p.id },
          data: {
            namaProdi: p.namaProdi || 'Prodi Baru',
            jenjang: p.jenjang || 'S1',
            peringkatAkreditasi: p.peringkatAkreditasi || null,
            jumlahMahasiswaAktif: parseInt(p.jumlahMahasiswaAktif) || 0,
          },
        }).catch(() => {})
      } else if (p.namaProdi) {
        await prisma.prodi.create({
          data: {
            namaProdi: p.namaProdi,
            jenjang: p.jenjang || 'S1',
            peringkatAkreditasi: p.peringkatAkreditasi || null,
            jumlahMahasiswaAktif: parseInt(p.jumlahMahasiswaAktif) || 0,
          },
        }).catch(() => {})
      }
    }
  }

  // Simpan tim penyusun
  if (Array.isArray(timList)) {
    await prisma.timPenyusun.deleteMany()
    for (const t of timList) {
      if (t.nama && t.nama.trim() !== '') {
        await prisma.timPenyusun.create({
          data: {
            nama: t.nama.trim(),
            nidn: t.nidn || null,
            jabatan: t.jabatan || 'Anggota Tim',
          },
        })
      }
    }
  }

  return NextResponse.json({ success: true })
}
